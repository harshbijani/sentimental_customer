import { useSocketContext } from "../context/SocketContext";
import MoodChart from "./MoodChart";

const EMOTIONS = [
  { key: "excited",    label: "Excited",    emoji: "🤩", color: "#7c3aed", bg: "#ede9fe" },
  { key: "happy",      label: "Happy",      emoji: "😊", color: "#059669", bg: "#d1fae5" },
  { key: "neutral",    label: "Neutral",    emoji: "😐", color: "#d97706", bg: "#fef3c7" },
  { key: "unhappy",    label: "Unhappy",    emoji: "😢", color: "#2563eb", bg: "#dbeafe" },
  { key: "frustrated", label: "Frustrated", emoji: "😤", color: "#dc2626", bg: "#fee2e2" },
];

export default function AdminDashboard() {
  const { counts, timeline, isConnected } = useSocketContext();
  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <div style={{ animation: "fadeUp 0.45s ease both" }}>

      {/* ── Header ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "36px" }}>
        <div>
          <p style={{
            fontSize: "0.68rem", fontWeight: 600,
            letterSpacing: "1.4px", textTransform: "uppercase",
            color: "var(--text-tertiary)", marginBottom: "8px",
          }}>
            Admin · Analytics
          </p>
          <h1 style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(1.8rem, 3.5vw, 2.4rem)",
            fontWeight: 700,
            color: "var(--text-primary)",
            lineHeight: 1.15,
            letterSpacing: "-0.3px",
          }}>
            Emotion <em style={{ fontStyle: "italic" }}>Intelligence</em>
          </h1>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {/* Total count pill */}
          {total > 0 && (
            <div style={{
              fontSize: "0.78rem", fontWeight: 600,
              color: "var(--text-secondary)",
              background: "var(--bg-subtle)",
              border: "1px solid var(--border)",
              padding: "5px 14px",
              borderRadius: "999px",
            }}>
              {total} total
            </div>
          )}
          {/* Live badge */}
          <div style={{
            display: "flex", alignItems: "center", gap: "5px",
            fontSize: "0.72rem", fontWeight: 500,
            color:      isConnected ? "var(--positive)" : "var(--negative)",
            background: isConnected ? "var(--positive-light)" : "var(--negative-light)",
            border:     `1px solid ${isConnected ? "rgba(5,150,105,0.2)" : "rgba(220,38,38,0.2)"}`,
            padding: "4px 12px", borderRadius: "999px",
          }}>
            <span style={{
              width: "5px", height: "5px", borderRadius: "50%",
              background: isConnected ? "var(--positive)" : "var(--negative)",
              display: "inline-block",
              animation: isConnected ? "pulseGlow 2s ease-in-out infinite" : "none",
            }} />
            {isConnected ? "Live" : "Reconnecting…"}
          </div>
        </div>
      </div>

      {/* ── 5 Emotion Cards ── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(5, 1fr)",
        gap: "10px",
        marginBottom: "24px",
      }}>
        {EMOTIONS.map(({ key, label, emoji, color, bg }) => {
          const count = counts[key] ?? 0;
          const pct   = total ? Math.round((count / total) * 100) : 0;
          const isTop = total > 0 && count === Math.max(...EMOTIONS.map(e => counts[e.key] ?? 0));

          return (
            <div key={key} style={{
              background: "var(--bg-white)",
              border: `1px solid ${isTop ? color + "40" : "var(--border)"}`,
              borderTop: `3px solid ${color}`,
              borderRadius: "var(--r-md)",
              padding: "18px 12px 14px",
              textAlign: "center",
              boxShadow: isTop ? `0 4px 16px ${color}18` : "var(--shadow-xs)",
              transition: "box-shadow 0.2s, transform 0.2s",
              position: "relative",
            }}
            onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
            onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
            >
              {isTop && count > 0 && (
                <div style={{
                  position: "absolute", top: "-1px", right: "10px",
                  fontSize: "0.55rem", fontWeight: 700,
                  background: color, color: "white",
                  padding: "2px 6px", borderRadius: "0 0 4px 4px",
                  letterSpacing: "0.5px", textTransform: "uppercase",
                }}>
                  Top
                </div>
              )}
              <div style={{ fontSize: "1.6rem", marginBottom: "8px", lineHeight: 1 }}>{emoji}</div>
              <div style={{ fontSize: "1.6rem", fontWeight: 700, color, lineHeight: 1, marginBottom: "4px" }}>
                {count}
              </div>
              <div style={{ fontSize: "0.72rem", fontWeight: 500, color: "var(--text-secondary)", marginBottom: "6px" }}>
                {label}
              </div>
              <div style={{
                display: "inline-block",
                fontSize: "0.65rem", fontWeight: 600,
                background: bg, color,
                borderRadius: "999px",
                padding: "2px 7px",
              }}>
                {pct}%
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Charts ── */}
      <MoodChart counts={counts} timeline={timeline} />
    </div>
  );
}