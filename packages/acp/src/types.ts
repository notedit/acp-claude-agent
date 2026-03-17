// ============================================================
// ACP Protocol — Message type definitions
// Agent Communication Protocol: AI SDK 无关的通用通信协议
// ============================================================

/** Server → Client: 流式事件 */
export type ACPServerMessage =
  | ACPTextDelta
  | ACPToolCallStart
  | ACPToolCallInput
  | ACPToolCallEnd
  | ACPToolResult
  | ACPTurnComplete
  | ACPError;

export interface ACPTextDelta {
  type: "text_delta";
  text: string;
}

export interface ACPToolCallStart {
  type: "tool_call_start";
  id: string;
  name: string;
}

export interface ACPToolCallInput {
  type: "tool_call_input";
  id: string;
  delta: string;
}

export interface ACPToolCallEnd {
  type: "tool_call_end";
  id: string;
}

export interface ACPToolResult {
  type: "tool_result";
  id: string;
  result: string;
  isError?: boolean;
}

export interface ACPTurnComplete {
  type: "turn_complete";
  sessionId: string;
  costUsd?: number;
}

export interface ACPError {
  type: "error";
  message: string;
}

/** Client → Server: 用户操作 */
export type ACPClientMessage = ACPUserMessage | ACPCancel;

export interface ACPUserMessage {
  type: "user_message";
  content: string;
}

export interface ACPCancel {
  type: "cancel";
}

/** 连接状态 */
export type ACPConnectionState = "connecting" | "connected" | "disconnected" | "error";
