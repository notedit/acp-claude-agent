"use client";

import { useState } from "react";
import type { ToolCallState } from "@/store/chat-store";

interface Props {
  toolCall: ToolCallState;
}

export function ToolCallCard({ toolCall }: Props) {
  const [expanded, setExpanded] = useState(false);
  const { name, input, result, isError, status } = toolCall;

  const statusColor =
    status === "done"
      ? isError
        ? "var(--red)"
        : "var(--green)"
      : "var(--orange)";

  const statusLabel =
    status === "streaming_input"
      ? "Receiving..."
      : status === "executing"
        ? "Executing..."
        : isError
          ? "Error"
          : "Done";

  return (
    <div
      style={{
        margin: "10px 0",
        border: "1px solid var(--border)",
        borderRadius: 8,
        overflow: "hidden",
        background: "var(--bg-primary)",
      }}
    >
      {/* Header */}
      <div
        onClick={() => setExpanded(!expanded)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "8px 12px",
          cursor: "pointer",
          background: "var(--bg-tertiary)",
          userSelect: "none",
        }}
      >
        <span
          style={{
            fontSize: 10,
            transition: "transform 0.2s",
            transform: expanded ? "rotate(90deg)" : "rotate(0deg)",
          }}
        >
          &#9654;
        </span>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 12,
            fontWeight: 600,
            color: "var(--purple)",
          }}
        >
          {name}
        </span>
        <span style={{ flex: 1 }} />
        <span
          style={{
            fontSize: 11,
            color: statusColor,
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          {status !== "done" && (
            <span
              style={{
                display: "inline-block",
                width: 10,
                height: 10,
                border: "2px solid",
                borderColor: `${statusColor} transparent ${statusColor} transparent`,
                borderRadius: "50%",
              }}
              className="animate-spin"
            />
          )}
          {statusLabel}
        </span>
      </div>

      {/* Body */}
      {expanded && (
        <div style={{ padding: 12, fontSize: 12 }}>
          {input && (
            <div style={{ marginBottom: 10 }}>
              <div
                style={{
                  fontSize: 11,
                  color: "var(--text-muted)",
                  marginBottom: 4,
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                }}
              >
                Input
              </div>
              <pre
                style={{
                  margin: 0,
                  fontSize: 12,
                  maxHeight: 200,
                  overflow: "auto",
                }}
              >
                {formatJSON(input)}
              </pre>
            </div>
          )}
          {result && (
            <div>
              <div
                style={{
                  fontSize: 11,
                  color: "var(--text-muted)",
                  marginBottom: 4,
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                }}
              >
                Result
              </div>
              <pre
                style={{
                  margin: 0,
                  fontSize: 12,
                  maxHeight: 300,
                  overflow: "auto",
                  borderColor: isError ? "var(--red)" : "var(--border)",
                }}
              >
                {formatJSON(result)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function formatJSON(str: string): string {
  try {
    return JSON.stringify(JSON.parse(str), null, 2);
  } catch {
    return str;
  }
}
