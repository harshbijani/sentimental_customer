import { useSocketContext } from "../context/SocketContext";
import MoodChart from "./MoodChart";

export default function AdminDashboard() {
  const { counts, timeline, isConnected, comments } = useSocketContext();
  const total = counts.positive + counts.neutral + counts.negative;

  const stats = [
    { key: "positive", label: "Happy",   emoji: "😊", color: "#16a34a", bg: "#dcfce7" },
    { key: "neutral",  label: "Neutral", emoji: "😐", color: "#a16207", bg: "#fef9c3" },
    { key: "negative", label: "Unhappy", emoji: "😠", color: "#b91c1c", bg: "#fee2e2" },
  ];

  const sentimentColor = {
    positive: "#16a34a",
    neutral:  "#ca8a04",
    negative: "#dc2626",
  };

  async function deleteComment(id) {
    await fetch(`/api/comment/${id}`, { method: "DELETE" });
  }

  return (
    <div>
      {/* ── Header ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 600, color: "#1a1a2e" }}>
          Sentiment Dashboard
        </h1>
        <span style={{
          fontSize: "0.75rem",
          padding: "2px 10px",
          borderRadius: "999px",
          background: isConnected ? "#dcfce7" : "#fee2e2",
          color: isConnected ? "#16a34a" : "#dc2626",
        }}>
          {isConnected ? "● Live" : "○ Reconnecting…"}
        </span>
      </div>

      {/* ── Stat Cards ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "28px" }}>
        {stats.map(({ key, label, emoji, color, bg }) => (
          <div key={key} style={{
            background: "white",
            borderRadius: "12px",
            padding: "20px",
            textAlign: "center",
            boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
            borderTop: `4px solid ${color}`,
          }}>
            <div style={{ fontSize: "2rem" }}>{emoji}</div>
            <div style={{ fontSize: "2rem", fontWeight: 700, color, marginTop: "4px" }}>
              {counts[key]}
            </div>
            <div style={{ fontSize: "0.8rem", color: "#64748b", marginTop: "2px" }}>{label}</div>
            <div style={{
              display: "inline-block",
              marginTop: "6px",
              fontSize: "0.7rem",
              background: bg,
              color,
              borderRadius: "999px",
              padding: "1px 8px",
              fontWeight: 600,
            }}>
              {total ? Math.round((counts[key] / total) * 100) : 0}%
            </div>
          </div>
        ))}
      </div>

      {/* ── Chart ── */}
      <MoodChart counts={counts} timeline={timeline} />

      {/* ── Total ── */}
      <p style={{ textAlign: "center", marginTop: "16px", fontSize: "0.8rem", color: "#94a3b8" }}>
        Total comments received: <strong>{total}</strong>
      </p>

      {/* ── Comment List with Delete ── */}
      <div style={{ marginTop: "32px" }}>
        <h2 style={{ fontSize: "1.1rem", fontWeight: 600, color: "#1a1a2e", marginBottom: "12px" }}>
          All Comments
        </h2>

        {comments.length === 0 ? (
          <p style={{ color: "#94a3b8", fontSize: "0.9rem", textAlign: "center", padding: "24px" }}>
            No comments yet.
          </p>
        ) : (
          comments.map((c) => (
            <div key={c.id} style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              background: "white",
              borderRadius: "10px",
              padding: "12px 16px",
              marginBottom: "8px",
              boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
              borderLeft: `4px solid ${sentimentColor[c.sentiment.label] ?? "#94a3b8"}`,
            }}>
              <div>
                <strong style={{ fontSize: "0.85rem", color: "#1a1a2e" }}>{c.author}</strong>
                <p style={{ margin: "4px 0 0", fontSize: "0.9rem", color: "#374151" }}>{c.text}</p>
                <span style={{ fontSize: "0.72rem", color: "#94a3b8" }}>
                  {new Date(c.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <button
                onClick={() => deleteComment(c.id)}
                style={{
                  background: "#fee2e2",
                  border: "none",
                  borderRadius: "6px",
                  color: "#dc2626",
                  padding: "4px 10px",
                  cursor: "pointer",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  whiteSpace: "nowrap",
                  marginLeft: "12px",
                  flexShrink: 0,
                }}
              >
                🗑 Delete
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}