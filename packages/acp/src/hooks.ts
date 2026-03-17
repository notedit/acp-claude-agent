// ============================================================
// useACP — React hook for ACP WebSocket connection
// ============================================================

import { useCallback, useEffect, useRef, useState } from "react";
import { ACPClient } from "./client.js";
import type { ACPServerMessage, ACPConnectionState } from "./types.js";

export interface UseACPOptions {
  url: string;
  onMessage?: (msg: ACPServerMessage) => void;
}

export interface UseACPReturn {
  sendMessage: (content: string) => void;
  cancel: () => void;
  connectionState: ACPConnectionState;
}

export function useACP({ url, onMessage }: UseACPOptions): UseACPReturn {
  const [connectionState, setConnectionState] =
    useState<ACPConnectionState>("disconnected");
  const clientRef = useRef<ACPClient | null>(null);
  const onMessageRef = useRef(onMessage);
  onMessageRef.current = onMessage;

  useEffect(() => {
    const client = new ACPClient({
      url,
      onMessage: (msg) => onMessageRef.current?.(msg),
      onStateChange: setConnectionState,
    });
    clientRef.current = client;
    client.connect();

    return () => {
      client.disconnect();
      clientRef.current = null;
    };
  }, [url]);

  const sendMessage = useCallback((content: string) => {
    clientRef.current?.send({ type: "user_message", content });
  }, []);

  const cancel = useCallback(() => {
    clientRef.current?.send({ type: "cancel" });
  }, []);

  return { sendMessage, cancel, connectionState };
}
