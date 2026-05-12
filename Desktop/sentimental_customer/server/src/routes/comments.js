import { Router }   from "express";
import { getSentiment } from "../services/sentiment.js";
import multer       from "multer";
import FormData     from "form-data";
import axios        from "axios";
import "dotenv/config";

const router  = Router();
const upload  = multer({
  storage: multer.memoryStorage(),
  limits:  { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_, file, cb) => {
    const allowed = [".pdf", ".docx", ".txt", ".csv", ".xlsx"];
    const ext     = file.originalname.slice(file.originalname.lastIndexOf(".")).toLowerCase();
    allowed.includes(ext)
      ? cb(null, true)
      : cb(new Error(`Unsupported file type: ${ext}`));
  },
});

const PYTHON_URL = process.env.PYTHON_SERVICE_URL || "http://localhost:5001";

// ── POST /api/comment ────────────────────────────────────
router.post("/comment", async (req, res) => {
  const { author, text } = req.body;

  if (!text?.trim()) {
    return res.status(400).json({ error: "Comment text is required" });
  }

  try {
    const sentiment = await getSentiment(text.trim());

    const comment = {
      id:        Date.now().toString(),
      author:    author?.trim() || "Anonymous",
      text:      text.trim(),
      sentiment,
      timestamp: sentiment.timestamp || new Date().toISOString(),
    };

    req.app.locals.io.emit("new_comment", comment);
    return res.status(201).json(comment);
  } catch (err) {
    console.error("❌ Sentiment service error:", err.message);
    return res.status(503).json({ error: "Sentiment service unavailable" });
  }
});

// ── POST /api/upload ─────────────────────────────────────
router.post("/upload", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file provided" });
  }

  try {
    // Forward the file buffer to Python
    const form = new FormData();
    form.append("file", req.file.buffer, {
      filename:    req.file.originalname,
      contentType: req.file.mimetype,
    });

    const { data } = await axios.post(
      `${PYTHON_URL}/analyze-file`,
      form,
      {
        headers:  form.getHeaders(),
        timeout:  60000, // 60s — large files take longer
      }
    );

    // Broadcast file analysis result to all connected clients
    const fileResult = {
      id:        Date.now().toString(),
      type:      "file_analysis",
      author:    req.body.author?.trim() || "Anonymous",
      filename:  data.filename,
      timestamp: new Date().toISOString(),
      ...data,
    };

    req.app.locals.io.emit("file_analysis", fileResult);
    return res.status(200).json(fileResult);
  } catch (err) {
    console.error("❌ File analysis error:", err.message);
    return res.status(503).json({ error: "File analysis failed" });
  }
});

export default router;