/**
 * 客户端 SSE 流解析工具
 *
 * 背景：
 * 此前 chat-window.tsx 与 chat-widget.tsx 各自实现了一份"读 ReadableStream
 * + TextDecoder + buffer 切 \n\n + 解析 data: 行 + JSON.parse + 跳过 [DONE]"
 * 的逻辑，约 35 行 × 2 处。这里抽成一个异步生成器，组件只关心业务事件。
 *
 * 协议（与 src/app/api/knowledge/chat 和 interviews/[id]/message 的服务端对齐）：
 * - 每个事件以 `data: <payload>\n\n` 形式出现
 * - payload 可能是：
 *   - `[DONE]` 字面量 -> 流结束
 *   - JSON 字符串 -> 解析后产出 SSEEvent（按内容分类）
 *   - 非 JSON 内容 -> 跳过（容错）
 */

/** 流式产生的事件类型 */
export type SSEEvent =
  /** 服务端通知客户端保存 sessionId（用于多轮上下文） */
  | { type: 'session'; sessionId: string }
  /** 文本片段（拼接到当前 assistant message 内容尾部） */
  | { type: 'text'; text: string }
  /** 服务端推送的错误信息 */
  | { type: 'error'; error: string }

/**
 * 把 fetch 拿到的 SSE Response.body 转换为 SSEEvent 异步迭代器。
 * 调用方用 `for await (const evt of parseSSEStream(res.body)) { ... }` 即可。
 *
 * 不抛错：网络/解析异常都会以 `{ type: 'error' }` 形式产出，由调用方决定 UI 表现。
 */
export async function* parseSSEStream(
  body: ReadableStream<Uint8Array> | null,
): AsyncGenerator<SSEEvent, void, unknown> {
  if (!body) {
    yield { type: 'error', error: '响应体为空' }
    return
  }

  const reader = body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const blocks = buffer.split('\n\n')
      buffer = blocks.pop() ?? ''

      for (const block of blocks) {
        const event = parseBlock(block)
        if (event === 'DONE') return
        if (event) yield event
      }
    }
  } catch (err) {
    yield { type: 'error', error: String(err) }
  } finally {
    try {
      reader.releaseLock()
    } catch {
      /* ignore */
    }
  }
}

/**
 * 解析单个 SSE 块。内部使用，导出仅为单测。
 * 返回值：
 * - 'DONE' -> 流结束信号
 * - SSEEvent -> 业务事件
 * - null -> 该块无有效内容（跳过）
 */
export function parseBlock(block: string): SSEEvent | 'DONE' | null {
  // 找到 data: 开头的那一行（SSE 也允许 event:/id:/retry: 等其他字段，目前未使用）
  const dataLine = block.split('\n').find(line => line.startsWith('data:'))
  if (!dataLine) return null

  const raw = dataLine.replace(/^data:\s*/, '').trim()
  if (!raw) return null
  if (raw === '[DONE]') return 'DONE'

  try {
    const parsed = JSON.parse(raw)

    // session 事件
    if (parsed && typeof parsed === 'object' && parsed.type === 'session' && parsed.sessionId) {
      return { type: 'session', sessionId: String(parsed.sessionId) }
    }

    // 错误事件
    if (parsed && typeof parsed === 'object' && parsed.type === 'error') {
      return { type: 'error', error: String(parsed.error ?? 'unknown error') }
    }

    // 纯文本片段（最常见情况，服务端 JSON.stringify 一段 Coze chunk）
    if (typeof parsed === 'string') {
      return { type: 'text', text: parsed }
    }

    return null
  } catch {
    // 非 JSON 数据（理论上不该出现），静默跳过
    return null
  }
}
