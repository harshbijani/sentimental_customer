import { useSocketContext } from "../context/SocketContext";
import CommentCard from "./CommentCard";
import CommentForm from "./CommentForm";

export default function CommentWall() {
  const { comments, isConnected } = useSocketContext();

  return (
    <div style={{ animation: "fadeUp 0.5s ease both" }}>

      {/* ── PAGE HEADER ── */}
      <div style={{ marginBottom: "40px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
          <span style={{
            fontSize: "0.72rem",
            fontWeight: 600,
            letterSpacing: "1.5px",
            textTransform: "uppercase",
            color: "var(--text-tertiary)",
          }}>
            Customer Feedback
          </span>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "0.75rem",
            fontWeight: 500,
            color: isConnected ? "var(--positive)" : "var(--negative)",
            background: isConnected ? "var(--positive-light)" : "var(--negative-light)",
            padding: "4px 12px",
            borderRadius: "999px",
            border: `1px solid ${isConnected ? "var(--positive-mid)" : "var(--negative-mid)"}`,
          }}>
            <span style={{
              width: "6px", height: "6px", borderRadius: "50%",
              background: isConnected ? "var(--positive)" : "var(--negative)",
              boxShadow: isConnected ? "0 0 6px var(--positive)" : "none",
              animation: isConnected ? "pulse 2s infinite" : "none",
              display: "inline-block",
            }} />
            {isConnected ? "Live" : "Reconnecting…"}
          </div>
        </div>
        <h1 style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(2rem, 5vw, 2.75rem)",
          fontWeight: 700,
          color: "var(--text-primary)",
          lineHeight: 1.15,
          letterSpacing: "-0.5px",
        }}>
          What are people<br />
          <span style={{
            background: "linear-gradient(135deg, #2563eb, #7c3aed)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}>saying today?</span>
        </h1>
      </div>

      {/* ── FORM ── */}
      <CommentForm />

      {/* ── DIVIDER ── */}
      {comments.length > 0 && (
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "16px",
          margin: "40px 0 28px",
        }}>
          <div style={{ flex: 1, height: "1px", background: "var(--border)" }} />
          <span style={{
            fontSize: "0.75rem",
            fontWeight: 600,
            color: "var(--text-tertiary)",
            letterSpacing: "1px",
            textTransform: "uppercase",
            whiteSpace: "nowrap",
          }}>
            {comments.length} {comments.length === 1 ? "response" : "responses"}
          </span>
          <div style={{ flex: 1, height: "1px", background: "var(--border)" }} />
        </div>
      )}

      {/* ── COMMENT LIST ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        {comments.length === 0 ? (
          <div style={{
            textAlign: "center",
            padding: "72px 32px",
            background: "var(--bg-white)",
            borderRadius: "20px",
            border: "1px solid var(--border)",
            marginTop: "32px",
          }}>
            <div style={{ fontSize: "2.5rem", marginBottom: "16px" }}>✦</div>
            <p style={{
              fontFamily: "var(--font-display)",
              fontSize: "1.2rem",
              color: "var(--text-secondary)",
              marginBottom: "6px",
            }}>
              No feedback yet
            </p>
            <p style={{ fontSize: "0.85rem", color: "var(--text-tertiary)" }}>
              Be the first to share your thoughts
            </p>
          </div>
        ) : (
          comments.map((c, i) => (
            <div
              key={c.id}
              style={{
                animation: "slideDown 0.4s ease both",
                animationDelay: `${Math.min(i * 0.04, 0.3)}s`,
              }}
            >
              <CommentCard comment={c} />
            </div>
          ))
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}