// import { Router } from "express";
// import { getSentiment } from "../services/sentiment.js";

// const router = Router();

// router.post("/comment", async (req, res) => {
//   const { author, text } = req.body;

//   if (!text?.trim()) {
//     return res.status(400).json({ error: "Comment text is required" });
//   }

//   try {
//     const sentiment = await getSentiment(text.trim());

//     const comment = {
//       id: Date.now().toString(),
//       author: author?.trim() || "Anonymous",
//       text: text.trim(),
//       sentiment,
//       timestamp: new Date().toISOString(),
//     };

//     // Broadcast to every connected client (wall + admin dashboard)
//     req.app.locals.io.emit("new_comment", comment);

//     return res.status(201).json(comment);
//   } catch (err) {
//     console.error("❌ Sentiment service error:", err.message);
//     return res.status(503).json({ error: "Sentiment service unavailable" });
//   }
// });

// export default router;

import { Router } from "express";
import { getSentiment } from "../services/sentiment.js";

const router = Router();

// ── In-memory store ──────────────────────────────────────────────
const comments = [];

// ── POST /api/comment ────────────────────────────────────────────
router.post("/comment", async (req, res) => {
  const { author, text } = req.body;

  if (!text?.trim()) {
    return res.status(400).json({ error: "Comment text is required" });
  }

  try {
    const sentiment = await getSentiment(text.trim());

    const comment = {
      id: Date.now().toString(),
      author: author?.trim() || "Anonymous",
      text: text.trim(),
      sentiment,
      timestamp: new Date().toISOString(),
    };

    comments.push(comment); // ← save to store
    req.app.locals.io.emit("new_comment", comment);

    return res.status(201).json(comment);
  } catch (err) {
    console.error("❌ Sentiment service error:", err.message);
    return res.status(503).json({ error: "Sentiment service unavailable" });
  }
});

// ── POST /api/admin/verify ────────────────────────────────────────
// Frontend sends { password }, we check against .env, return ok/fail
router.post("/admin/verify", (req, res) => {
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ error: "Password is required" });
  }

  if (password === process.env.ADMIN_PASSWORD) {
    return res.status(200).json({ success: true });
  }

  return res.status(401).json({ success: false, error: "Wrong password" });
});

// ── DELETE /api/comment/:id ───────────────────────────────────────
// Removes from store, broadcasts delete event to all clients
router.delete("/comment/:id", (req, res) => {
  const { id } = req.params;
  const index = comments.findIndex((c) => c.id === id);

  if (index === -1) {
    return res.status(404).json({ error: "Comment not found" });
  }

  comments.splice(index, 1);
  req.app.locals.io.emit("delete_comment", { id }); // ← tell all clients

  return res.status(200).json({ success: true, id });
});

export default router;