const SENTIMENT = {
  positive: {
    label:      "Happy",
    emoji:      "😊",
    color:      "var(--positive)",
    bg:         "var(--positive-light)",
    border:     "rgba(5, 150, 105, 0.2)",
    leftBar:    "#059669",
    scoreColor: "#059669",
  },
  neutral: {
    label:      "Neutral",
    emoji:      "😐",
    color:      "var(--neutral)",
    bg:         "var(--neutral-light)",
    border:     "rgba(217, 119, 6, 0.2)",
    leftBar:    "#d97706",
    scoreColor: "#d97706",
  },
  negative: {
    label:      "Unhappy",
    emoji:      "😠",
    color:      "var(--negative)",
    bg:         "var(--negative-light)",
    border:     "rgba(220, 38, 38, 0.2)",
    leftBar:    "#dc2626",
    scoreColor: "#dc2626",
  },
};

function timeAgo(isoString) {
  const diff = Math.floor((Date.now() - new Date(isoString)) / 1000);
  if (diff < 60)  return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return new Date(isoString).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function CommentCard({ comment }) {
  const s = SENTIMENT[comment.sentiment?.label] ?? SENTIMENT.neutral;
  const compound = comment.sentiment?.compound ?? 0;
  const barWidth = `${Math.round(Math.abs(compound) * 100)}%`;

  return (
    <div style={{
      position: "relative",
      background: "var(--bg-white)",
      borderRadius: "16px",
      border: "1px solid var(--border)",
      padding: "20px 22px 18px 26px",
      boxShadow: "var(--shadow-sm)",
      overflow: "hidden",
      transition: "box-shadow 0.2s ease, transform 0.2s ease",
      cursor: "default",
    }}
    onMouseEnter={e => {
      e.currentTarget.style.boxShadow = "var(--shadow-md)";
      e.currentTarget.style.transform = "translateY(-1px)";
    }}
    onMouseLeave={e => {
      e.currentTarget.style.boxShadow = "var(--shadow-sm)";
      e.currentTarget.style.transform = "translateY(0)";
    }}
    >
      {/* Coloured left accent bar */}
      <div style={{
        position: "absolute",
        left: 0, top: 0, bottom: 0,
        width: "4px",
        background: s.leftBar,
        borderRadius: "16px 0 0 16px",
      }} />

      {/* Header row */}
      <div style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        marginBottom: "10px",
        gap: "12px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {/* Avatar */}
          <div style={{
            width: "34px",
            height: "34px",
            borderRadius: "10px",
            background: `linear-gradient(135deg, ${s.leftBar}22, ${s.leftBar}44)`,
            border: `1px solid ${s.border}`,
            display: "grid",
            placeItems: "center",
            fontSize: "1rem",
            flexShrink: 0,
          }}>
            {comment.author?.[0]?.toUpperCase() || "A"}
          </div>
          <div>
            <p style={{
              fontWeight: 600,
              fontSize: "0.875rem",
              color: "var(--text-primary)",
              lineHeight: 1.2,
            }}>
              {comment.author || "Anonymous"}
            </p>
            <p style={{ fontSize: "0.72rem", color: "var(--text-tertiary)", marginTop: "1px" }}>
              {timeAgo(comment.timestamp)}
            </p>
          </div>
        </div>

        {/* Sentiment badge */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "5px",
          background: s.bg,
          color: s.color,
          border: `1px solid ${s.border}`,
          borderRadius: "999px",
          padding: "4px 11px",
          fontSize: "0.72rem",
          fontWeight: 600,
          letterSpacing: "0.3px",
          whiteSpace: "nowrap",
          flexShrink: 0,
        }}>
          <span>{s.emoji}</span>
          {s.label}
        </div>
      </div>

      {/* Comment text */}
      <p style={{
        fontSize: "0.925rem",
        color: "var(--text-secondary)",
        lineHeight: 1.65,
        marginBottom: "14px",
      }}>
        {comment.text}
      </p>

      {/* Score bar */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <span style={{ fontSize: "0.68rem", color: "var(--text-tertiary)", fontWeight: 500, letterSpacing: "0.5px", whiteSpace: "nowrap" }}>
          SENTIMENT
        </span>
        <div style={{
          flex: 1,
          height: "4px",
          background: "var(--bg-subtle)",
          borderRadius: "2px",
          overflow: "hidden",
        }}>
          <div style={{
            width: barWidth,
            height: "100%",
            background: s.leftBar,
            borderRadius: "2px",
            transition: "width 0.6s ease",
          }} />
        </div>
        <span style={{ fontSize: "0.72rem", fontWeight: 600, color: s.scoreColor, minWidth: "36px", textAlign: "right" }}>
          {compound > 0 ? "+" : ""}{compound.toFixed(2)}
        </span>
      </div>
    </div>
  );
}