/**
 * Coze AI 工作流调用服务
 *
 * 封装与 Coze 平台的交互，支持：
 * - 非流式请求（适合代码评审、能力评估等需要完整 JSON 结果的场景）
 * - 流式请求（适合面试对话等需要实时反馈的场景）
 */

const COZE_API_BASE = "https://api.coze.cn/v1";

interface CozeMessagePayload {
  bot_id: string;
  user_id: string;
  additional_messages: { role: "user"; content: string; content_type: "text" }[];
  stream: boolean;
  auto_save_history?: boolean;
  conversation_id?: string;
}

export interface CozeMessage {
  role: "assistant" | "user";
  type: string;
  content: string;
}

interface CozeChatResponse {
  code: number;
  msg: string;
  data: {
    id: string;
    conversation_id: string;
    status: string;
  };
}

interface CozeRetrieveResponse {
  code: number;
  msg: string;
  data: {
    id: string;
    conversation_id: string;
    status: "created" | "in_progress" | "completed" | "failed" | "requires_action";
  };
}

interface CozeMessageListResponse {
  code: number;
  data: CozeMessage[];
}

function getConfig() {
  const apiKey = process.env.COZE_API_KEY;
  const botId = process.env.COZE_BOT_ID;
  if (!apiKey || !botId) {
    throw new Error("缺少 COZE_API_KEY 或 COZE_BOT_ID 环境变量配置");
  }
  return { apiKey, botId };
}

function headers(apiKey: string) {
  return {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  };
}

/**
 * 非流式调用 Coze Bot（轮询等待结果）
 * 适用于代码评审、能力评分等场景
 */
export async function chatNonStream(
  userId: string,
  message: string,
  conversationId?: string,
): Promise<{ answer: string; conversationId: string }> {
  const { apiKey, botId } = getConfig();

  const payload: CozeMessagePayload = {
    bot_id: botId,
    user_id: userId,
    additional_messages: [
      { role: "user", content: message, content_type: "text" },
    ],
    stream: false,
    auto_save_history: true,
    ...(conversationId && { conversation_id: conversationId }),
  };

  // 1. 发起对话
  const chatRes = await fetch(`${COZE_API_BASE}/chat`, {
    method: "POST",
    headers: headers(apiKey),
    body: JSON.stringify(payload),
  });
  const chatData: CozeChatResponse = await chatRes.json();

  if (chatData.code !== 0) {
    throw new Error(`Coze API 错误: ${chatData.msg}`);
  }

  const chatId = chatData.data.id;
  const convId = chatData.data.conversation_id;

  // 2. 轮询等待完成（最多 60 秒）
  const maxAttempts = 30;
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise((r) => setTimeout(r, 2000));

    const retrieveRes = await fetch(
      `${COZE_API_BASE}/chat/retrieve?chat_id=${chatId}&conversation_id=${convId}`,
      { headers: headers(apiKey) },
    );
    const retrieveData: CozeRetrieveResponse = await retrieveRes.json();

    if (retrieveData.data.status === "completed") break;
    if (retrieveData.data.status === "failed") {
      throw new Error("Coze 对话处理失败");
    }
  }

  // 3. 获取回复消息
  const msgRes = await fetch(
    `${COZE_API_BASE}/chat/message/list?chat_id=${chatId}&conversation_id=${convId}`,
    { headers: headers(apiKey) },
  );
  const msgData: CozeMessageListResponse = await msgRes.json();

  const answer =
    msgData.data.find((m) => m.role === "assistant" && m.type === "answer")
      ?.content ?? "";

  return { answer, conversationId: convId };
}

/**
 * 流式调用 Coze Bot
 * 适用于面试对话等需要实时展示的场景
 * 返回 ReadableStream 以便在 API Route 中直接 pipe
 */
export async function chatStream(
  userId: string,
  message: string,
  conversationId?: string,
): Promise<ReadableStream<Uint8Array>> {
  const { apiKey, botId } = getConfig();

  const payload: CozeMessagePayload = {
    bot_id: botId,
    user_id: userId,
    additional_messages: [
      { role: "user", content: message, content_type: "text" },
    ],
    stream: true,
    auto_save_history: true,
    ...(conversationId && { conversation_id: conversationId }),
  };

  const res = await fetch(`${COZE_API_BASE}/chat`, {
    method: "POST",
    headers: headers(apiKey),
    body: JSON.stringify(payload),
  });

  if (!res.ok || !res.body) {
    throw new Error(`Coze 流式请求失败: ${res.status}`);
  }

  return res.body;
}

/**
 * 辅助函数：解析 AI 返回的 JSON 评分
 * Coze 工作流返回的 answer 可能被 markdown 代码块包裹
 */
export function parseJsonAnswer<T>(answer: string): T {
  const cleaned = answer
    .replace(/^```json\s*/i, "")
    .replace(/```\s*$/, "")
    .trim();
  return JSON.parse(cleaned);
}
