// ============================================================
// AgentSession — 核心会话管理
// 支持真实 Claude Agent SDK 和 Mock 模式
// ============================================================

import type { ACPServerMessage } from "@acp/protocol";
import type { AgentSessionOptions } from "./types.js";
import { mockAgentResponse } from "./mock-agent.js";

export class AgentSession {
  private options: AgentSessionOptions;
  private cancelled = false;
  // SDK session will be initialized when SDK is available
  // private sdkSession: unknown = null;

  constructor(options: AgentSessionOptions = {}) {
    this.options = {
      model: options.model ?? "claude-sonnet-4-20250514",
      mock: options.mock ?? true,
      ...options,
    };
  }

  /**
   * 处理用户消息，通过 emit 回调发送 ACP 消息
   */
  async handleMessage(
    content: string,
    emit: (msg: ACPServerMessage) => void,
  ): Promise<void> {
    this.cancelled = false;

    try {
      if (this.options.mock) {
        await this.handleMock(content, emit);
      } else {
        await this.handleReal(content, emit);
      }
    } catch (error) {
      if (!this.cancelled) {
        emit({
          type: "error",
          message: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }
  }

  cancel(): void {
    this.cancelled = true;
  }

  private async handleMock(
    content: string,
    emit: (msg: ACPServerMessage) => void,
  ): Promise<void> {
    for await (const msg of mockAgentResponse(content)) {
      if (this.cancelled) return;
      emit(msg);
    }
  }

  private async handleReal(
    content: string,
    emit: (msg: ACPServerMessage) => void,
  ): Promise<void> {
    // TODO: 接入真实 Claude Agent SDK
    // 需要 ANTHROPIC_API_KEY 环境变量
    //
    // import { query } from "@anthropic-ai/claude-agent-sdk";
    // import { adaptStream } from "./stream-adapter.js";
    //
    // const stream = query({
    //   prompt: content,
    //   options: {
    //     model: this.options.model,
    //     includePartialMessages: true,
    //     allowedTools: this.options.allowedTools,
    //     mcpServers: this.options.mcpServers,
    //   },
    // });
    //
    // for await (const acpMsg of adaptStream(stream)) {
    //   if (this.cancelled) return;
    //   emit(acpMsg);
    // }

    emit({
      type: "error",
      message:
        "Real Claude Agent SDK not yet configured. Set MOCK_AGENT=true or provide ANTHROPIC_API_KEY.",
    });
  }
}
