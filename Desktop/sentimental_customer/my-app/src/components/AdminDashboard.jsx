import { useSocketContext } from "../context/SocketContext";
import MoodChart from "./MoodChart";

const EMOTION_META = [
  { key: "excited",    label: "Excited",    emoji: "🤩", color: "#7c3aed", bg: "#ede9fe", border: "#7c3aed" },
  { key: "happy",      label: "Happy",      emoji: "😊", color: "#059669", bg: "#d1fae5", border: "#059669" },
  { key: "neutral",    label: "Neutral",    emoji: "😐", color: "#d97706", bg: "#fef3c7", border: "#d97706" },
  { key: "unhappy",    label: "Unhappy",    emoji: "😢", color: "#2563eb", bg: "#dbeafe", border: "#2563eb" },
  { key: "frustrated", label: "Frustrated", emoji: "😤", color: "#dc2626", bg: "#fee2e2", border: "#dc2626" },
];

export default function AdminDashboard() {
  const { counts, timeline, isConnected } = useSocketContext();
  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
        <div>
          <p style={{ fontSize: "0.72rem", fontWeight: 600, letterSpacing: "1.5px", textTransform: "uppercase", color: "var(--text-tertiary)", marginBottom: "8px" }}>
            Admin Dashboard
          </p>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.8rem, 4vw, 2.4rem)", fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.3px" }}>
            Emotion Analytics
          </h1>
        </div>
        <div style={{
          display: "flex", alignItems: "center", gap: "6px",
          fontSize: "0.75rem", fontWeight: 500,
          color: isConnected ? "var(--positive)" : "var(--negative)",
          background: isConnected ? "var(--positive-light)" : "var(--negative-light)",
          padding: "6px 14px", borderRadius: "999px",
          border: `1px solid ${isConnected ? "rgba(5,150,105,0.2)" : "rgba(220,38,38,0.2)"}`,
        }}>
          <span style={{
            width: "6px", height: "6px", borderRadius: "50%",
            background: isConnected ? "var(--positive)" : "var(--negative)",
            display: "inline-block",
          }} />
          {isConnected ? "Live" : "Reconnecting…"}
        </div>
      </div>

      {/* ✅ 5 Emotion Stat Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "12px", marginBottom: "28px" }}>
        {EMOTION_META.map(({ key, label, emoji, color, bg }) => {
          const count = counts[key] ?? 0;
          const pct   = total ? Math.round((count / total) * 100) : 0;
          return (
            <div key={key} style={{
              background: "var(--bg-white)",
              borderRadius: "16px",
              padding: "20px 16px",
              textAlign: "center",
              boxShadow: "var(--shadow-sm)",
              border: "1px solid var(--border)",
              borderTop: `3px solid ${color}`,
              transition: "box-shadow 0.2s ease",
            }}>
              <div style={{ fontSize: "1.75rem", marginBottom: "8px" }}>{emoji}</div>
              <div style={{ fontSize: "1.75rem", fontWeight: 700, color, lineHeight: 1 }}>
                {count}
              </div>
              <div style={{ fontSize: "0.78rem", color: "var(--text-secondary)", fontWeight: 500, margin: "4px 0" }}>
                {label}
              </div>
              <div style={{
                display: "inline-block",
                fontSize: "0.68rem",
                fontWeight: 600,
                background: bg,
                color,
                borderRadius: "999px",
                padding: "2px 8px",
                marginTop: "2px",
              }}>
                {pct}%
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <MoodChart counts={counts} timeline={timeline} />

      <p style={{ textAlign: "center", marginTop: "16px", fontSize: "0.8rem", color: "var(--text-tertiary)" }}>
        Total responses received: <strong style={{ color: "var(--text-primary)" }}>{total}</strong>
      </p>
    </div>
  );
}