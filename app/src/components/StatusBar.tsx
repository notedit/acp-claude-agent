"use client";

import type { ACPConnectionState } from "@acp/protocol";

interface Props {
  connectionState: ACPConnectionState;
  sessionId: string | null;
}

const stateConfig: Record<
  ACPConnectionState,
  { label: string; color: string }
> = {
  connecting: { label: "Connecting...", color: "var(--orange)" },
  connected: { label: "Connected", color: "var(--green)" },
  disconnected: { label: "Disconnected", color: "var(--text-muted)" },
  error: { label: "Connection Error", color: "var(--red)" },
};

export function StatusBar({ connectionState, sessionId }: Props) {
  const { label, color } = stateConfig[connectionState];

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
        padding: "4px 20px 8px",
        fontSize: 11,
        color: "var(--text-muted)",
      }}
    >
      <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <span
          style={{
            display: "inline-block",
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: color,
          }}
        />
        {label}
      </span>
      {sessionId && (
        <span>
          Session: <code style={{ fontSize: 10 }}>{sessionId}</code>
        </span>
      )}
    </div>
  );
}
