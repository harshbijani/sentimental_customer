import { createContext, useContext, useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:4002";

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [comments, setComments] = useState([]);
  const [counts, setCounts] = useState({ positive: 0, neutral: 0, negative: 0 });
  const [timeline, setTimeline] = useState([]);

  useEffect(() => {
    // Create socket once
    const socket = io(SERVER_URL, {
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("✅ Socket connected:", socket.id);
      setIsConnected(true);
    });

    socket.on("disconnect", () => {
      console.log("❌ Socket disconnected");
      setIsConnected(false);
    });

    // ✅ Listener is set up once here, never torn down on route change
    socket.on("new_comment", (comment) => {
      console.log("📨 New comment received:", comment);

      setComments((prev) => [comment, ...prev]);

      setCounts((prev) => ({
        ...prev,
        [comment.sentiment.label]: prev[comment.sentiment.label] + 1,
      }));

      setTimeline((prev) => [
        ...prev.slice(-29),
        {
          time: new Date(comment.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          compound: comment.sentiment.compound,
        },
      ]);
    });

    socket.on("delete_comment", ({ id }) => {
      setComments((prev) => prev.filter((c) => c.id !== id));
      // optionally re-calculate counts here if you track them
    });

    return () => {
      socket.disconnect();
    };
  }, []); // ✅ Empty deps — runs once only, never re-runs

  return (
    <SocketContext.Provider value={{
      socket: socketRef.current,
      isConnected,
      comments,
      counts,
      timeline,
    }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocketContext() {
  return useContext(SocketContext);
}