"use client";

import { useRef, useState, type KeyboardEvent } from "react";

interface Props {
  onSend: (content: string) => void;
  onCancel: () => void;
  disabled: boolean;
  isStreaming: boolean;
}

export function MessageInput({ onSend, onCancel, disabled, isStreaming }: Props) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled || isStreaming) return;
    onSend(trimmed);
    setValue("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleInput = () => {
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = "auto";
      ta.style.height = Math.min(ta.scrollHeight, 200) + "px";
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "12px 20px" }}>
      <div
        style={{
          display: "flex",
          gap: 8,
          alignItems: "flex-end",
        }}
      >
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            handleInput();
          }}
          onKeyDown={handleKeyDown}
          placeholder={
            disabled
              ? "Connecting..."
              : isStreaming
                ? "Agent is thinking..."
                : "Type a message... (Shift+Enter for newline)"
          }
          disabled={disabled || isStreaming}
          rows={1}
          style={{
            flex: 1,
            resize: "none",
            background: "var(--bg-secondary)",
            border: "1px solid var(--border)",
            borderRadius: 10,
            padding: "10px 14px",
            color: "var(--text-primary)",
            fontSize: 14,
            fontFamily: "var(--font-sans)",
            lineHeight: 1.5,
            outline: "none",
            transition: "border-color 0.2s",
          }}
          onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
          onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
        />

        {isStreaming ? (
          <button
            onClick={onCancel}
            style={{
              background: "var(--red)",
              color: "#fff",
              border: "none",
              borderRadius: 10,
              padding: "10px 16px",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 500,
              whiteSpace: "nowrap",
            }}
          >
            Cancel
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={disabled || !value.trim()}
            style={{
              background:
                disabled || !value.trim() ? "var(--bg-tertiary)" : "var(--accent)",
              color: disabled || !value.trim() ? "var(--text-muted)" : "#fff",
              border: "none",
              borderRadius: 10,
              padding: "10px 16px",
              cursor: disabled || !value.trim() ? "default" : "pointer",
              fontSize: 13,
              fontWeight: 500,
              whiteSpace: "nowrap",
            }}
          >
            Send
          </button>
        )}
      </div>
    </div>
  );
}
