"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/app/contexts/authContext";
import { useRouter } from "next/navigation";
import { io, Socket } from "socket.io-client";
import { Oval } from "react-loader-spinner";

type ChatMessage = {
  _id?: string;
  sender?: string;
  username?: string;
  message?: string;
  createdAt?: string;
};

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3000";

export default function Chat() {
  const { context } = useAuth();
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const socketRef = useRef<Socket | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);

  const username = (context.User as any)?.username || "You";

  useEffect(() => {
    if (!context.loading && !context.User) {
      router.push("/");
    }
  }, [context.loading, context.User, router]);

  useEffect(() => {
    if (!context.User) return;

    const socket = io(SOCKET_URL, {
      withCredentials: true,
      transports: ["websocket"],
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      setConnected(true);
      setLoading(false);
    });

    socket.on("connect_error", () => {
      setConnected(false);
      setLoading(false);
    });

    socket.on("chat_history", (history: ChatMessage[]) => {
      setMessages(history || []);
    });

    socket.on("receive_message", (msg: ChatMessage) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.disconnect();
    };
  }, [context.User]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    const text = input.trim();
    if (!text || !socketRef.current) return;
    socketRef.current.emit("send_message", text);
    setInput("");
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }
  };

  const groupedMessages = useMemo(() => messages, [messages]);

  if (!context.User) return null;

  return (
    <div className="space">
      <div className="stars" />
      <div className="nebula" />
      <div className="content">
        <header className="hero">
          <h1>Mission Chat</h1>
          <p>Live discussion channel for researchers and observers.</p>
        </header>

        <section className="chatShell">
          <div className="chatHeader">
            <div>
              <div className="label">Room status</div>
              <div className={`statusPill ${connected ? "ok" : "warn"}`}>
                {connected ? "Connected" : "Disconnected"}
              </div>
            </div>
            <div className="label">Signed in as {username}</div>
          </div>

          <div className="chatBody">
            {loading ? (
              <div className="loaderWrap">
                <Oval
                  height={56}
                  width={56}
                  color="#8ab8ff"
                  secondaryColor="rgba(138, 184, 255, 0.35)"
                  strokeWidth={4}
                  strokeWidthSecondary={4}
                />
              </div>
            ) : groupedMessages.length === 0 ? (
              <div className="emptyState">No messages yet. Start the conversation.</div>
            ) : (
              groupedMessages.map((msg, idx) => {
                const mine = msg.username === username;
                const time = msg.createdAt
                  ? new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                  : "";
                return (
                  <div key={msg._id ?? idx} className={`bubbleRow ${mine ? "right" : "left"}`}>
                    <div className={`bubble ${mine ? "mine" : "theirs"}`}>
                      <div className="meta">
                        <span className="user">{msg.username || "Unknown"}</span>
                        <span className="time">{time}</span>
                      </div>
                      <div className="text">{msg.message}</div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={endRef} />
          </div>

          <div className="chatInput">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Type your message..."
            />
            <button className="primary" onClick={handleSend}>
              Send
            </button>
          </div>
        </section>
      </div>

      <style jsx>{`
        .space {
          position: relative;
          min-height: 100vh;
          overflow: hidden;
          background: radial-gradient(circle at 20% 20%, #0b1f3a 0%, #05070f 45%, #020308 100%);
          color: #d6e6ff;
          padding: 80px 6vw 64px;
        }

        .stars {
          position: absolute;
          inset: 0;
          background-image:
            radial-gradient(2px 2px at 20% 30%, #c8e6ff 40%, transparent 60%),
            radial-gradient(1px 1px at 70% 10%, #9cc8ff 40%, transparent 60%),
            radial-gradient(2px 2px at 80% 80%, #d6f0ff 40%, transparent 60%),
            radial-gradient(1px 1px at 30% 70%, #b4d5ff 40%, transparent 60%),
            radial-gradient(1.5px 1.5px at 50% 50%, #ffffff 40%, transparent 60%);
          opacity: 0.6;
          animation: twinkle 8s ease-in-out infinite;
          pointer-events: none;
        }

        .nebula {
          position: absolute;
          inset: -20% 0 0 -10%;
          background: radial-gradient(circle at 30% 30%, rgba(73, 132, 255, 0.35), transparent 55%),
            radial-gradient(circle at 70% 60%, rgba(35, 235, 199, 0.2), transparent 50%);
          filter: blur(10px);
          opacity: 0.6;
          animation: drift 18s linear infinite;
          pointer-events: none;
        }

        .content {
          position: relative;
          z-index: 2;
          display: flex;
          flex-direction: column;
          gap: 28px;
        }

        .hero h1 {
          font-size: clamp(2.2rem, 4vw, 3.2rem);
          margin: 0 0 10px;
          color: #a6d4ff;
          letter-spacing: 0.02em;
        }

        .hero p {
          margin: 0;
          font-size: 1.05rem;
          color: #b7c8ea;
        }

        .chatShell {
          background: rgba(7, 14, 28, 0.75);
          border: 1px solid rgba(86, 123, 187, 0.35);
          border-radius: 18px;
          padding: 18px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          min-height: 520px;
        }

        .chatHeader {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
        }

        .label {
          font-size: 0.8rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #8fb2e8;
        }

        .statusPill {
          display: inline-flex;
          align-items: center;
          padding: 4px 10px;
          border-radius: 999px;
          font-size: 0.7rem;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          border: 1px solid transparent;
          margin-top: 6px;
        }

        .statusPill.ok {
          background: rgba(73, 196, 255, 0.12);
          color: #8fd9ff;
          border-color: rgba(73, 196, 255, 0.35);
        }

        .statusPill.warn {
          background: rgba(255, 95, 95, 0.12);
          color: #ffb1b1;
          border-color: rgba(255, 95, 95, 0.4);
        }

        .chatBody {
          flex: 1;
          overflow-y: auto;
          background: rgba(10, 18, 36, 0.4);
          border-radius: 14px;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .bubbleRow {
          display: flex;
        }

        .bubbleRow.left {
          justify-content: flex-start;
        }

        .bubbleRow.right {
          justify-content: flex-end;
        }

        .bubble {
          max-width: min(70%, 560px);
          padding: 12px 14px;
          border-radius: 16px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          border: 1px solid transparent;
        }

        .bubble.mine {
          background: rgba(91, 123, 255, 0.2);
          border-color: rgba(91, 123, 255, 0.4);
          text-align: right;
        }

        .bubble.theirs {
          background: rgba(73, 196, 255, 0.12);
          border-color: rgba(73, 196, 255, 0.35);
        }

        .meta {
          display: flex;
          justify-content: space-between;
          gap: 10px;
          font-size: 0.72rem;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #b7c8ea;
        }

        .text {
          font-size: 0.95rem;
          color: #e2ecff;
        }

        .chatInput {
          display: flex;
          gap: 10px;
          align-items: center;
        }

        .chatInput input {
          flex: 1;
          background: rgba(10, 20, 40, 0.8);
          color: #d6e6ff;
          border: 1px solid rgba(86, 123, 187, 0.5);
          padding: 10px 12px;
          border-radius: 12px;
        }

        .primary {
          border-radius: 12px;
          padding: 10px 16px;
          border: 1px solid transparent;
          font-weight: 600;
          letter-spacing: 0.02em;
          background: #5b7bff;
          color: #f5f7ff;
          cursor: pointer;
        }

        .loaderWrap {
          min-height: 280px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .emptyState {
          color: #b7c8ea;
          text-align: center;
          padding: 40px 0;
        }

        @keyframes twinkle {
          0%,
          100% {
            opacity: 0.5;
          }
          50% {
            opacity: 0.9;
          }
        }

        @keyframes drift {
          0% {
            transform: translate3d(0, 0, 0) scale(1);
          }
          50% {
            transform: translate3d(30px, -20px, 0) scale(1.05);
          }
          100% {
            transform: translate3d(0, 0, 0) scale(1);
          }
        }

        @media (max-width: 720px) {
          .chatShell {
            padding: 14px;
          }

          .bubble {
            max-width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
