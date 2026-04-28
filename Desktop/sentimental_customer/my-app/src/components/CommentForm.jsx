import { useState } from "react";

export default function CommentForm() {
  const [author, setAuthor] = useState("");
  const [text, setText] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | error | success
  const [focused, setFocused] = useState(false);

  const charLimit = 500;
  const remaining = charLimit - text.length;

  const submit = async () => {
    if (!text.trim() || status === "loading") return;
    setStatus("loading");
    try {
      const res = await fetch("/api/comment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ author, text }),
      });
      if (!res.ok) throw new Error();
      setText("");
      setAuthor("");
      setStatus("success");
      setTimeout(() => setStatus("idle"), 2500);
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) submit();
  };

  const isFull = text.length >= charLimit;

  return (
    <div style={{
      background: "var(--bg-white)",
      borderRadius: "20px",
      border: focused ? "1.5px solid #2563eb" : "1.5px solid var(--border)",
      boxShadow: focused ? "0 0 0 4px rgba(37,99,235,0.07), var(--shadow-md)" : "var(--shadow-sm)",
      padding: "20px",
      transition: "border-color 0.2s ease, box-shadow 0.2s ease",
    }}>

      {/* Author row */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "14px" }}>
        <div style={{
          width: "36px", height: "36px",
          borderRadius: "10px",
          background: author
            ? "linear-gradient(135deg, #2563eb22, #7c3aed33)"
            : "var(--bg-subtle)",
          border: "1px solid var(--border)",
          display: "grid",
          placeItems: "center",
          fontSize: "1rem",
          flexShrink: 0,
          fontWeight: 600,
          color: "var(--text-secondary)",
          transition: "background 0.2s ease",
        }}>
          {author ? author[0].toUpperCase() : "👤"}
        </div>
        <input
          style={{
            flex: 1,
            border: "none",
            outline: "none",
            background: "transparent",
            fontSize: "0.875rem",
            fontWeight: 500,
            color: "var(--text-primary)",
            fontFamily: "var(--font-body)",
          }}
          placeholder="Your name (optional)"
          value={author}
          onChange={e => setAuthor(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
      </div>

      {/* Divider */}
      <div style={{ height: "1px", background: "var(--border)", marginBottom: "14px" }} />

      {/* Textarea */}
      <textarea
        style={{
          width: "100%",
          border: "none",
          outline: "none",
          background: "transparent",
          fontSize: "0.95rem",
          color: "var(--text-primary)",
          lineHeight: 1.65,
          resize: "none",
          minHeight: "100px",
          fontFamily: "var(--font-body)",
          fontWeight: 400,
        }}
        placeholder="Share your experience, thoughts, or suggestions…"
        value={text}
        onChange={e => setText(e.target.value.slice(0, charLimit))}
        onKeyDown={handleKeyDown}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />

      {/* Footer row */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: "14px",
        paddingTop: "14px",
        borderTop: "1px solid var(--border)",
      }}>
        <div style={{ display: "flex", align: "center", gap: "12px" }}>
          <span style={{
            fontSize: "0.72rem",
            color: isFull ? "var(--negative)" : "var(--text-tertiary)",
            fontWeight: isFull ? 600 : 400,
          }}>
            {remaining} chars left
          </span>
          <span style={{ fontSize: "0.72rem", color: "var(--text-tertiary)" }}>
            · Ctrl+Enter to send
          </span>
        </div>

        <button
          onClick={submit}
          disabled={!text.trim() || status === "loading"}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            background: status === "success"
              ? "var(--positive)"
              : status === "error"
              ? "var(--negative)"
              : !text.trim()
              ? "var(--bg-subtle)"
              : "linear-gradient(135deg, #2563eb, #7c3aed)",
            color: !text.trim() ? "var(--text-tertiary)" : "white",
            border: "none",
            borderRadius: "10px",
            padding: "9px 20px",
            fontSize: "0.85rem",
            fontWeight: 600,
            cursor: !text.trim() || status === "loading" ? "not-allowed" : "pointer",
            fontFamily: "var(--font-body)",
            transition: "all 0.2s ease",
            boxShadow: text.trim() && status === "idle"
              ? "0 2px 8px rgba(37,99,235,0.3)"
              : "none",
            letterSpacing: "0.2px",
          }}
        >
          {status === "loading" && (
            <span style={{
              width: "12px", height: "12px",
              border: "2px solid rgba(255,255,255,0.4)",
              borderTopColor: "white",
              borderRadius: "50%",
              display: "inline-block",
              animation: "spinnerSpin 0.7s linear infinite",
            }} />
          )}
          {status === "loading" ? "Sending…"
           : status === "success" ? "✓ Sent!"
           : status === "error"   ? "Try again"
           : "Post Feedback"}
        </button>
      </div>

      <style>{`
        @keyframes spinnerSpin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}