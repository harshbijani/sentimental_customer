import { Router } from "express";
import { getSentiment } from "../services/sentiment.js";

const router = Router();

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

export default router;