"use client";

import { useEffect, useRef } from "react";
import type { DisplayMessage } from "@/store/chat-store";
import { UserMessage } from "./UserMessage";
import { AssistantTurnView } from "./AssistantTurn";

interface Props {
  messages: DisplayMessage[];
}

export function ChatContainer({ messages }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const userScrolled = useRef(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      userScrolled.current = scrollHeight - scrollTop - clientHeight > 100;
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!userScrolled.current) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <div
      ref={containerRef}
      style={{
        flex: 1,
        overflow: "auto",
        padding: "20px 0",
      }}
    >
      {messages.length === 0 && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            color: "var(--text-muted)",
            gap: 12,
          }}
        >
          <div style={{ fontSize: 48 }}>&#x1F916;</div>
          <p style={{ fontSize: 14 }}>发送消息开始对话</p>
          <p style={{ fontSize: 12, color: "var(--text-muted)" }}>
            试试 &quot;查询北京天气&quot; 或 &quot;计算 123 * 456&quot;
          </p>
        </div>
      )}

      {messages.map((msg, i) => {
        if (msg.role === "user") {
          return <UserMessage key={i} content={msg.content} />;
        }
        if (msg.role === "assistant") {
          return <AssistantTurnView key={i} turn={msg} />;
        }
        if (msg.role === "error") {
          return (
            <div
              key={i}
              style={{
                maxWidth: 800,
                margin: "8px auto",
                padding: "8px 20px",
              }}
            >
              <div
                style={{
                  background: "rgba(248, 81, 73, 0.1)",
                  border: "1px solid var(--red)",
                  borderRadius: 8,
                  padding: "10px 14px",
                  color: "var(--red)",
                  fontSize: 13,
                }}
              >
                {msg.message}
              </div>
            </div>
          );
        }
        return null;
      })}

      <div ref={bottomRef} />
    </div>
  );
}
