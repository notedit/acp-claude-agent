"use client";

import type { AssistantTurn } from "@/store/chat-store";
import { ToolCallCard } from "./ToolCallCard";

interface Props {
  turn: AssistantTurn;
}

export function AssistantTurnView({ turn }: Props) {
  return (
    <div style={{ maxWidth: 800, margin: "8px auto", padding: "0 20px" }}>
      <div
        style={{
          background: "var(--bg-secondary)",
          border: "1px solid var(--border)",
          borderRadius: 12,
          padding: "14px 18px",
          fontSize: 14,
          lineHeight: 1.7,
        }}
      >
        {turn.segments.map((seg, i) => {
          if (seg.type === "text") {
            return (
              <div
                key={i}
                style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}
                dangerouslySetInnerHTML={{ __html: renderSimpleMarkdown(seg.content) }}
              />
            );
          }
          if (seg.type === "tool_call") {
            return <ToolCallCard key={i} toolCall={seg.toolCall} />;
          }
          return null;
        })}

        {turn.isStreaming && (
          <span
            style={{
              display: "inline-block",
              width: 6,
              height: 16,
              background: "var(--accent)",
              marginLeft: 2,
              verticalAlign: "text-bottom",
              borderRadius: 1,
            }}
            className="animate-pulse"
          />
        )}
      </div>
    </div>
  );
}

/** Simple markdown to HTML (bold, inline code, newlines) */
function renderSimpleMarkdown(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\n/g, "<br/>");
}
