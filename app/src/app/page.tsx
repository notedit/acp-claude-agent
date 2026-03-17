"use client";

import { useCallback } from "react";
import { useACP } from "@acp/protocol";
import type { ACPServerMessage } from "@acp/protocol";
import { useChatStore } from "@/store/chat-store";
import { ChatContainer } from "@/components/ChatContainer";
import { MessageInput } from "@/components/MessageInput";
import { StatusBar } from "@/components/StatusBar";

function getWsUrl(): string {
  if (typeof window === "undefined") return "";
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  return `${protocol}//${window.location.host}/ws`;
}

export default function Home() {
  const store = useChatStore();

  const handleMessage = useCallback(
    (msg: ACPServerMessage) => {
      switch (msg.type) {
        case "text_delta":
          store.appendTextDelta(msg.text);
          break;
        case "tool_call_start":
          store.startToolCall(msg.id, msg.name);
          break;
        case "tool_call_input":
          store.appendToolInput(msg.id, msg.delta);
          break;
        case "tool_call_end":
          store.endToolCall(msg.id);
          break;
        case "tool_result":
          store.setToolResult(msg.id, msg.result, msg.isError);
          break;
        case "turn_complete":
          store.completeTurn(msg.sessionId);
          break;
        case "error":
          store.addError(msg.message);
          break;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const { sendMessage, cancel, connectionState } = useACP({
    url: getWsUrl(),
    onMessage: handleMessage,
  });

  const handleSend = useCallback(
    (content: string) => {
      store.addUserMessage(content);
      sendMessage(content);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sendMessage],
  );

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
      }}
    >
      <header
        style={{
          padding: "12px 20px",
          borderBottom: "1px solid var(--border)",
          background: "var(--bg-secondary)",
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <h1 style={{ fontSize: 16, fontWeight: 600 }}>ACP Agent</h1>
        <span
          style={{
            fontSize: 12,
            color: "var(--text-muted)",
            background: "var(--bg-tertiary)",
            padding: "2px 8px",
            borderRadius: 4,
          }}
        >
          Mock Mode
        </span>
      </header>

      <ChatContainer messages={store.messages} />

      <div style={{ borderTop: "1px solid var(--border)" }}>
        <MessageInput
          onSend={handleSend}
          onCancel={cancel}
          disabled={connectionState !== "connected"}
          isStreaming={store.isStreaming}
        />
        <StatusBar
          connectionState={connectionState}
          sessionId={store.sessionId}
        />
      </div>
    </div>
  );
}
