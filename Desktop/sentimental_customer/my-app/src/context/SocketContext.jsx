import { createContext, useContext, useEffect, useRef, useState } from "react";
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
    const socket = io(SERVER_URL, {
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on("connect",    () => setIsConnected(true));
    socket.on("disconnect", () => setIsConnected(false));

    socket.on("new_comment", (comment) => {
      setComments((prev) => [comment, ...prev]);

      setCounts((prev) => ({
        ...prev,
        [comment.sentiment.label]: prev[comment.sentiment.label] + 1,
      }));

      setTimeline((prev) => [
        ...prev.slice(-29),
        {
          time:     new Date(comment.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          compound: comment.sentiment.compound,
        },
      ]);
    });

    return () => socket.disconnect();
  }, []);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, isConnected, comments, counts, timeline }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocketContext() {
  return useContext(SocketContext);
}