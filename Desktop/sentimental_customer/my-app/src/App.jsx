import { useState } from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { SocketProvider } from "./context/SocketContext";
import CommentWall    from "./components/CommentWall";
import AdminDashboard from "./components/AdminDashboard";
import AdminLogin     from "./components/AdminLogin";
import "./App.css";

export default function App() {
  // Check sessionStorage so page refresh inside the tab keeps you in
  const [adminUnlocked, setAdminUnlocked] = useState(
    () => sessionStorage.getItem("admin_unlocked") === "true"
  );

  function handleUnlock() { setAdminUnlocked(true); }

  function handleLock() {
    sessionStorage.removeItem("admin_unlocked");
    setAdminUnlocked(false);
  }

  return (
    <SocketProvider>
      <BrowserRouter>
        <nav className="navbar">
          <span className="navbar-brand">💬 Sentiment Wall</span>
          <div className="navbar-links">
            <Link to="/">Wall</Link>
            <Link to="/admin">Admin</Link>
            {/* Show lock button only when admin is inside */}
            {adminUnlocked && (
              <button onClick={handleLock} style={{
                marginLeft: "8px", fontSize: "0.8rem", background: "none",
                border: "1px solid #e2e8f0", borderRadius: "6px",
                padding: "2px 10px", cursor: "pointer", color: "#64748b",
              }}>
                🔓 Lock
              </button>
            )}
          </div>
        </nav>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<CommentWall />} />
            <Route
              path="/admin"
              element={
                adminUnlocked
                  ? <AdminDashboard />
                  : <AdminLogin onUnlock={handleUnlock} />
              }
            />
          </Routes>
        </main>
      </BrowserRouter>
    </SocketProvider>
  );
}