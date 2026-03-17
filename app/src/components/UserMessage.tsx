"use client";

interface Props {
  content: string;
}

export function UserMessage({ content }: Props) {
  return (
    <div style={{ maxWidth: 800, margin: "8px auto", padding: "0 20px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
        }}
      >
        <div
          style={{
            background: "var(--accent)",
            color: "#fff",
            borderRadius: "16px 16px 4px 16px",
            padding: "10px 16px",
            maxWidth: "70%",
            fontSize: 14,
            lineHeight: 1.6,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        >
          {content}
        </div>
      </div>
    </div>
  );
}
