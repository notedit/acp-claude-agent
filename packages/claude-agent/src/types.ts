// ============================================================
// Claude Agent module types
// ============================================================

export interface AgentSessionOptions {
  /** Claude model ID */
  model?: string;
  /** Use mock agent (no API key needed) */
  mock?: boolean;
  /** Allowed built-in tools */
  allowedTools?: string[];
  /** Custom MCP servers */
  mcpServers?: Record<string, unknown>;
}

export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  handler: (args: Record<string, unknown>) => Promise<ToolResult>;
}

export interface ToolResult {
  content: Array<{ type: "text"; text: string }>;
  isError?: boolean;
}
