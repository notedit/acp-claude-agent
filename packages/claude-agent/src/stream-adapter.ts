// ============================================================
// Stream Adapter — SDK StreamEvent → ACP message conversion
// 将 Claude Agent SDK 的流式事件翻译为 ACP 协议消息
// ============================================================

import type { ACPServerMessage } from "@acp/protocol";

/**
 * SDK stream event types (subset we care about).
 * Using loose types to avoid hard dependency on SDK package at type level.
 */
export interface SDKStreamMessage {
  type: "stream_event" | "assistant" | "result";
  event?: {
    type: string;
    content_block?: {
      type: string;
      id?: string;
      name?: string;
    };
    delta?: {
      type: string;
      text?: string;
      partial_json?: string;
    };
    index?: number;
  };
  session_id?: string;
  result?: string;
  message?: {
    content: Array<{
      type: string;
      id?: string;
      name?: string;
      input?: unknown;
    }>;
  };
}

/**
 * Convert a stream of SDK messages to ACP protocol messages.
 */
export async function* adaptStream(
  stream: AsyncIterable<SDKStreamMessage>,
): AsyncGenerator<ACPServerMessage> {
  let currentToolId: string | null = null;

  for await (const message of stream) {
    if (message.type === "stream_event" && message.event) {
      const event = message.event;

      switch (event.type) {
        case "content_block_start": {
          if (event.content_block?.type === "tool_use") {
            currentToolId = event.content_block.id ?? crypto.randomUUID();
            yield {
              type: "tool_call_start",
              id: currentToolId,
              name: event.content_block.name ?? "unknown",
            };
          }
          break;
        }

        case "content_block_delta": {
          if (event.delta?.type === "text_delta" && event.delta.text) {
            yield { type: "text_delta", text: event.delta.text };
          } else if (
            event.delta?.type === "input_json_delta" &&
            event.delta.partial_json &&
            currentToolId
          ) {
            yield {
              type: "tool_call_input",
              id: currentToolId,
              delta: event.delta.partial_json,
            };
          }
          break;
        }

        case "content_block_stop": {
          if (currentToolId) {
            yield { type: "tool_call_end", id: currentToolId };
            currentToolId = null;
          }
          break;
        }
      }
    } else if (message.type === "result") {
      yield {
        type: "turn_complete",
        sessionId: message.session_id ?? "unknown",
      };
    }
  }
}
