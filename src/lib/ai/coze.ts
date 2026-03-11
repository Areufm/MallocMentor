/**
 * Coze AI 服务层
 *
 * 适配扣子平台「发布为应用」后的 API 格式。
 * 每个 Bot 独立配置 TOKEN / URL / PROJECT_ID。
 *
 * 支持四种 Bot：
 * - interview:     AI 面试官（流式对话）
 * - codeReview:    代码审查（收集完整回复后返回）
 * - knowledge:     知识助手（流式对话）
 * - learningPath:  学习路径推荐（非流式，返回 JSON）
 */

import { randomUUID } from "crypto";

export type BotType = "interview" | "codeReview" | "knowledge" | "learningPath";

// ---------- 类型定义 ----------

/** 扣子应用 SSE data 中的事件类型 */
type CozeDataType =
  | "message_start"
  | "message_end"
  | "answer"
  | "error"
  | "tool_request"
  | "tool_response";

interface CozeStreamData {
  type: CozeDataType;
  session_id?: string;
  msg_id?: string;
  sequence_id?: number;
  finish?: boolean;
  // 扣子实际返回的 content 是嵌套对象，文本在 content.answer 里
  content?: {
    answer?: string;
    thinking?: string | null;
    tool_request?: unknown;
    tool_response?: unknown;
    error?: { code?: number; error_msg?: string } | null;
    message_start?: unknown;
    message_end?: { code?: string; message?: string; token_cost?: unknown; time_cost_ms?: number } | null;
  };
  log_id?: string;
}

/** Bot 配置信息 */
interface BotConfig {
  token: string;
  url: string;
  projectId: string;
}

// ---------- 配置获取 ----------

/**
 * 检查某个 Bot 是否已配置（Token + URL + ProjectID 全部存在）
 */
export function isCozeConfigured(botType: BotType): boolean {
  const cfg = getBotEnv(botType);
  return !!(cfg.token && cfg.url && cfg.projectId);
}

/** 每个 Bot 独立的环境变量映射 */
const ENV_MAP: Record<BotType, { token: string; url: string; projectId: string }> = {
  interview: {
    token: "COZE_INTERVIEW_TOKEN",
    url: "COZE_INTERVIEW_URL",
    projectId: "COZE_INTERVIEW_PROJECT_ID",
  },
  codeReview: {
    token: "COZE_CODE_REVIEW_TOKEN",
    url: "COZE_CODE_REVIEW_URL",
    projectId: "COZE_CODE_REVIEW_PROJECT_ID",
  },
  knowledge: {
    token: "COZE_KNOWLEDGE_TOKEN",
    url: "COZE_KNOWLEDGE_URL",
    projectId: "COZE_KNOWLEDGE_PROJECT_ID",
  },
  learningPath: {
    token: "COZE_LEARNING_PATH_TOKEN",
    url: "COZE_LEARNING_PATH_URL",
    projectId: "COZE_LEARNING_PATH_PROJECT_ID",
  },
};

function getBotEnv(botType: BotType) {
  const keys = ENV_MAP[botType];
  return {
    token: process.env[keys.token] ?? "",
    url: process.env[keys.url] ?? "",
    projectId: process.env[keys.projectId] ?? "",
  };
}

function getConfig(botType: BotType): BotConfig {
  const cfg = getBotEnv(botType);
  if (!cfg.token || !cfg.url || !cfg.projectId) {
    throw new Error(`缺少 ${botType} 相关环境变量（TOKEN / URL / PROJECT_ID）`);
  }
  return cfg;
}

// ---------- 请求构建 ----------

/** 构建扣子应用的请求体 */
function buildPayload(message: string, projectId: string, sessionId?: string) {
  return {
    content: {
      query: {
        prompt: [{ type: "text", content: { text: message } }],
      },
    },
    type: "query",
    session_id: sessionId ?? randomUUID(),
    project_id: projectId,
  };
}

function authHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    Accept: "text/event-stream",
  };
}

// ---------- 流式调用 ----------

/**
 * 流式调用扣子应用
 *
 * 返回一个 ReadableStream<string>，每次 yield 的是 assistant 增量文本片段。
 * 解析扣子 SSE 格式：event: message\ndata: {"type":"answer","answer":"..."}\n\n
 *
 * @param botType   - 使用哪个 Bot
 * @param message   - 用户消息
 * @param sessionId - 多轮对话 session ID（不传则自动生成）
 * @returns { stream, sessionId } — 文本流 + 本次使用的 sessionId（前端可存起来用于下次对话）
 */
export async function chatStream(
  botType: BotType,
  message: string,
  sessionId?: string,
): Promise<{ stream: ReadableStream<string>; sessionId: string }> {
  const { token, url, projectId } = getConfig(botType);
  const actualSessionId = sessionId ?? randomUUID();

  const res = await fetch(url, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(buildPayload(message, projectId, actualSessionId)),
  });

  if (!res.ok || !res.body) {
    const errText = await res.text().catch(() => "");
    throw new Error(`Coze 请求失败 (${res.status}): ${errText}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  const stream = new ReadableStream<string>({
    async start(controller) {
      let buffer = "";

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            controller.close();
            return;
          }

          buffer += decoder.decode(value, { stream: true });
          const blocks = buffer.split("\n\n");
          buffer = blocks.pop() ?? "";

          for (const block of blocks) {
            if (!block.trim()) continue;

            const dataLines = block
              .split("\n")
              .filter((line) => line.startsWith("data:"))
              .map((line) => line.slice(5).trim());

            if (dataLines.length === 0) continue;

            const dataText = dataLines.join("\n");
            let parsed: CozeStreamData;
            try {
              parsed = JSON.parse(dataText);
            } catch {
              continue;
            }

            if (parsed.type === "answer" && parsed.content?.answer) {
              controller.enqueue(parsed.content.answer);
            } else if (parsed.type === "error") {
              const errMsg = parsed.content?.error?.error_msg ?? "Coze 返回错误";
              console.error("[Coze] error:", errMsg);
              controller.error(new Error(errMsg));
              return;
            } else if (parsed.type === "message_end") {
              controller.close();
              return;
            }
          }
        }
      } catch (err) {
        console.error("[Coze v2] stream error:", err);
        controller.error(err);
      }
    },
    cancel() {
      reader.cancel();
    },
  });

  return { stream, sessionId: actualSessionId };
}

// ---------- 非流式调用（收集完整回复） ----------

/**
 * 非流式调用扣子应用
 * 内部仍走流式接口，但收集所有 answer 片段后一次性返回完整文本。
 * 适用于代码审查等需要完整 JSON 结果的场景。
 */
export async function chatNonStream(
  botType: BotType,
  message: string,
  sessionId?: string,
): Promise<{ answer: string; sessionId: string }> {
  const { stream, sessionId: sid } = await chatStream(botType, message, sessionId);
  const reader = stream.getReader();
  let fullAnswer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    fullAnswer += value;
  }

  return { answer: fullAnswer, sessionId: sid };
}

// ---------- 工具函数 ----------

/**
 * 解析 AI 返回的 JSON（可能被 markdown 代码块包裹）
 */
export function parseJsonAnswer<T>(answer: string): T {
  const cleaned = answer
    .replace(/^```json\s*/i, "")
    .replace(/```\s*$/, "")
    .trim();
  return JSON.parse(cleaned);
}
