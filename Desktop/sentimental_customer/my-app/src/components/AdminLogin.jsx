import { useState } from "react";

export default function AdminLogin({ onUnlock }) {
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  async function handleSubmit() {
    if (!password.trim()) return;
    setLoading(true);
    setError("");

    try {
      const res  = await fetch("/api/admin/verify", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ password }),
      });
      const data = await res.json();

      if (data.success) {
        sessionStorage.setItem("admin_unlocked", "true"); // ← persists for tab session
        onUnlock();
      } else {
        setError("❌ Wrong password. Try again.");
      }
    } catch {
      setError("❌ Could not reach server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: "60vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", gap: "16px",
    }}>
      <div style={{
        background: "white", borderRadius: "16px", padding: "40px 48px",
        boxShadow: "0 4px 24px rgba(0,0,0,0.08)", textAlign: "center", width: "100%", maxWidth: "360px",
      }}>
        <div style={{ fontSize: "2.5rem", marginBottom: "8px" }}>🔒</div>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "4px" }}>Admin Access</h2>
        <p style={{ fontSize: "0.85rem", color: "#64748b", marginBottom: "24px" }}>
          Enter the admin password to continue
        </p>

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          style={{
            width: "100%", padding: "10px 14px", borderRadius: "8px",
            border: "1.5px solid #e2e8f0", fontSize: "1rem",
            outline: "none", boxSizing: "border-box", marginBottom: "12px",
          }}
        />

        {error && (
          <p style={{ color: "#dc2626", fontSize: "0.82rem", marginBottom: "10px" }}>{error}</p>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            width: "100%", padding: "10px", borderRadius: "8px",
            background: loading ? "#94a3b8" : "#1a1a2e", color: "white",
            border: "none", fontSize: "0.95rem", fontWeight: 600,
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Checking…" : "Unlock Dashboard"}
        </button>
      </div>
    </div>
  );
}