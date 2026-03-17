// ============================================================
// Mock Agent — 模拟 Claude Agent SDK 行为（无需 API key）
// 用于开发和测试
// ============================================================

import type { ACPServerMessage } from "@acp/protocol";

const MOCK_SESSION_ID = "mock-session-001";

/** 模拟流式文本输出，逐字符发送 */
async function* streamText(text: string, delayMs = 30): AsyncGenerator<ACPServerMessage> {
  for (const char of text) {
    yield { type: "text_delta", text: char };
    await sleep(delayMs);
  }
}

/** 模拟工具调用流程 */
async function* streamToolCall(
  toolName: string,
  input: Record<string, unknown>,
  result: string,
): AsyncGenerator<ACPServerMessage> {
  const toolId = `tool_${Date.now()}`;

  yield { type: "tool_call_start", id: toolId, name: toolName };
  await sleep(100);

  // 流式发送 JSON input
  const inputStr = JSON.stringify(input, null, 2);
  for (let i = 0; i < inputStr.length; i += 5) {
    yield { type: "tool_call_input", id: toolId, delta: inputStr.slice(i, i + 5) };
    await sleep(20);
  }

  yield { type: "tool_call_end", id: toolId };
  await sleep(300); // 模拟工具执行时间

  yield { type: "tool_result", id: toolId, result };
  await sleep(100);
}

/** 根据用户输入生成模拟回复 */
export async function* mockAgentResponse(content: string): AsyncGenerator<ACPServerMessage> {
  const lower = content.toLowerCase();

  // 如果提到天气，模拟工具调用
  if (lower.includes("天气") || lower.includes("weather")) {
    yield* streamText("让我帮你查询天气信息。\n\n");

    const city = extractCity(content);
    yield* streamToolCall(
      "get_weather",
      { city, unit: "celsius" },
      JSON.stringify({
        city,
        temperature: 22,
        condition: "晴朗",
        humidity: 45,
        wind: "东北风 3级",
      }),
    );

    yield* streamText(
      `\n根据查询结果，**${city}**当前天气：\n` +
      `- 🌡️ 温度：22°C\n` +
      `- ☀️ 天况：晴朗\n` +
      `- 💧 湿度：45%\n` +
      `- 🌬️ 风力：东北风 3级\n\n` +
      `适合外出活动！`,
    );
  }
  // 如果提到计算，模拟工具调用
  else if (lower.includes("计算") || lower.includes("calculate") || /\d+\s*[+\-*/]\s*\d+/.test(content)) {
    yield* streamText("好的，我来帮你计算。\n\n");

    const expr = content.match(/[\d+\-*/\s().]+/)?.[0]?.trim() || "42 * 2";
    let result: number;
    try {
      result = Function(`"use strict"; return (${expr})`)() as number;
    } catch {
      result = 84;
    }

    yield* streamToolCall(
      "calculate",
      { expression: expr },
      JSON.stringify({ result, expression: expr }),
    );

    yield* streamText(`\n计算结果：**${expr} = ${result}**`);
  }
  // 如果提到文件/目录，模拟文件系统工具
  else if (lower.includes("文件") || lower.includes("目录") || lower.includes("file") || lower.includes("list")) {
    yield* streamText("我来查看一下文件信息。\n\n");

    yield* streamToolCall(
      "list_directory",
      { path: "/home/user/project" },
      JSON.stringify({
        files: [
          { name: "package.json", size: "1.2KB", type: "file" },
          { name: "src/", size: "-", type: "directory" },
          { name: "README.md", size: "2.4KB", type: "file" },
          { name: "tsconfig.json", size: "0.8KB", type: "file" },
          { name: "node_modules/", size: "-", type: "directory" },
        ],
      }),
    );

    yield* streamText(
      "\n目录内容如下：\n\n" +
      "| 名称 | 类型 | 大小 |\n" +
      "|------|------|------|\n" +
      "| `package.json` | 文件 | 1.2KB |\n" +
      "| `src/` | 目录 | - |\n" +
      "| `README.md` | 文件 | 2.4KB |\n" +
      "| `tsconfig.json` | 文件 | 0.8KB |\n" +
      "| `node_modules/` | 目录 | - |\n",
    );
  }
  // 默认对话回复
  else {
    yield* streamText(
      `你好！我是 ACP Agent 助手（Mock 模式）。\n\n` +
      `你说的是：「${content}」\n\n` +
      `我目前运行在模拟模式下，你可以试试以下功能：\n` +
      `- **天气查询**：输入 "查询北京天气"\n` +
      `- **数学计算**：输入 "计算 123 * 456"\n` +
      `- **文件浏览**：输入 "列出文件目录"\n\n` +
      `这些操作会展示工具调用的完整流程（名称 → 参数 → 结果）。`,
    );
  }

  yield { type: "turn_complete", sessionId: MOCK_SESSION_ID };
}

function extractCity(text: string): string {
  const cities = ["北京", "上海", "广州", "深圳", "杭州", "成都", "武汉", "南京", "西安", "重庆"];
  for (const city of cities) {
    if (text.includes(city)) return city;
  }
  if (/[a-zA-Z]/.test(text)) {
    const match = text.match(/(?:weather|in)\s+(\w+)/i);
    if (match) return match[1];
  }
  return "北京";
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
