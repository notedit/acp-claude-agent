import { create } from "zustand";

// ============================================================
// Display types for rendering
// ============================================================

export interface ToolCallState {
  id: string;
  name: string;
  input: string;
  result?: string;
  isError?: boolean;
  /** "streaming_input" | "executing" | "done" */
  status: "streaming_input" | "executing" | "done";
}

export interface AssistantTurn {
  role: "assistant";
  /** Accumulated text segments (split by tool calls) */
  segments: TurnSegment[];
  isStreaming: boolean;
}

export type TurnSegment =
  | { type: "text"; content: string }
  | { type: "tool_call"; toolCall: ToolCallState };

export interface UserMessage {
  role: "user";
  content: string;
}

export interface ErrorMessage {
  role: "error";
  message: string;
}

export type DisplayMessage = UserMessage | AssistantTurn | ErrorMessage;

// ============================================================
// Store
// ============================================================

interface ChatState {
  messages: DisplayMessage[];
  isStreaming: boolean;
  sessionId: string | null;

  addUserMessage: (content: string) => void;
  appendTextDelta: (text: string) => void;
  startToolCall: (id: string, name: string) => void;
  appendToolInput: (id: string, delta: string) => void;
  endToolCall: (id: string) => void;
  setToolResult: (id: string, result: string, isError?: boolean) => void;
  completeTurn: (sessionId: string) => void;
  addError: (message: string) => void;
}

/** Get the current assistant turn, creating one if needed */
function ensureAssistantTurn(messages: DisplayMessage[]): {
  messages: DisplayMessage[];
  turn: AssistantTurn;
} {
  const last = messages[messages.length - 1];
  if (last && last.role === "assistant") {
    return { messages, turn: last };
  }
  const turn: AssistantTurn = { role: "assistant", segments: [], isStreaming: true };
  return { messages: [...messages, turn], turn };
}

/** Get or create last text segment in the assistant turn */
function ensureTextSegment(turn: AssistantTurn): TurnSegment {
  const lastSeg = turn.segments[turn.segments.length - 1];
  if (lastSeg && lastSeg.type === "text") return lastSeg;
  const seg: TurnSegment = { type: "text", content: "" };
  turn.segments.push(seg);
  return seg;
}

/** Find tool call in turn by id */
function findToolCall(turn: AssistantTurn, id: string): ToolCallState | undefined {
  for (const seg of turn.segments) {
    if (seg.type === "tool_call" && seg.toolCall.id === id) {
      return seg.toolCall;
    }
  }
  return undefined;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  isStreaming: false,
  sessionId: null,

  addUserMessage: (content) =>
    set((state) => ({
      messages: [...state.messages, { role: "user", content }],
      isStreaming: true,
    })),

  appendTextDelta: (text) =>
    set((state) => {
      const { messages, turn } = ensureAssistantTurn([...state.messages]);
      const seg = ensureTextSegment(turn);
      if (seg.type === "text") seg.content += text;
      return { messages: [...messages] };
    }),

  startToolCall: (id, name) =>
    set((state) => {
      const { messages, turn } = ensureAssistantTurn([...state.messages]);
      turn.segments.push({
        type: "tool_call",
        toolCall: { id, name, input: "", status: "streaming_input" },
      });
      return { messages: [...messages] };
    }),

  appendToolInput: (id, delta) =>
    set((state) => {
      const msgs = [...state.messages];
      const last = msgs[msgs.length - 1];
      if (last?.role === "assistant") {
        const tc = findToolCall(last, id);
        if (tc) tc.input += delta;
      }
      return { messages: msgs };
    }),

  endToolCall: (id) =>
    set((state) => {
      const msgs = [...state.messages];
      const last = msgs[msgs.length - 1];
      if (last?.role === "assistant") {
        const tc = findToolCall(last, id);
        if (tc) tc.status = "executing";
      }
      return { messages: msgs };
    }),

  setToolResult: (id, result, isError) =>
    set((state) => {
      const msgs = [...state.messages];
      const last = msgs[msgs.length - 1];
      if (last?.role === "assistant") {
        const tc = findToolCall(last, id);
        if (tc) {
          tc.result = result;
          tc.isError = isError;
          tc.status = "done";
        }
      }
      return { messages: msgs };
    }),

  completeTurn: (sessionId) =>
    set((state) => {
      const msgs = [...state.messages];
      const last = msgs[msgs.length - 1];
      if (last?.role === "assistant") {
        last.isStreaming = false;
      }
      return { messages: msgs, isStreaming: false, sessionId };
    }),

  addError: (message) =>
    set((state) => ({
      messages: [...state.messages, { role: "error", message }],
      isStreaming: false,
    })),
}));
