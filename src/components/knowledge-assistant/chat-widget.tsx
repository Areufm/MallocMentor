"use client"

import {
  useState,
  useRef,
  useCallback,
  useEffect,
  type FormEvent,
  type KeyboardEvent,
} from 'react'
import { usePathname } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { cn } from '@/lib/utils'
import {
  MessageCircleQuestion,
  X,
  Send,
  Loader2,
  Trash2,
} from 'lucide-react'

// ---------- 类型 ----------

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

// ---------- 可拖拽悬浮按钮 ----------

function useDraggable() {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null)
  const dragging = useRef(false)
  const offset = useRef({ x: 0, y: 0 })
  const dragMoved = useRef(false)

  // SSR 安全：在客户端挂载后设定初始位置
  useEffect(() => {
    setPos({ x: window.innerWidth - 80, y: window.innerHeight - 80 })
  }, [])

  const currentPos = pos ?? { x: -200, y: -200 }

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    dragging.current = true
    dragMoved.current = false
    const p = pos ?? { x: 0, y: 0 }
    offset.current = { x: e.clientX - p.x, y: e.clientY - p.y }
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }, [pos])

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging.current) return
    const nx = Math.max(0, Math.min(e.clientX - offset.current.x, window.innerWidth - 56))
    const ny = Math.max(0, Math.min(e.clientY - offset.current.y, window.innerHeight - 56))
    dragMoved.current = true
    setPos({ x: nx, y: ny })
  }, [])

  const onPointerUp = useCallback(() => {
    dragging.current = false
  }, [])

  return { pos: currentPos, ready: pos !== null, dragMoved, onPointerDown, onPointerMove, onPointerUp }
}

// ---------- 主组件 ----------

export function KnowledgeAssistantWidget() {
  const pathname = usePathname()

  // 面试页面和登录页隐藏
  const hidden = pathname.startsWith('/interview/') || pathname === '/login' || pathname === '/'

  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)

  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const { pos, ready, dragMoved, onPointerDown, onPointerMove, onPointerUp } = useDraggable()

  // 自动滚动到底部
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  // 打开对话框时聚焦输入框
  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus()
    }
  }, [open])

  const handleToggle = useCallback(() => {
    if (dragMoved.current) return
    setOpen(prev => !prev)
  }, [dragMoved])

  const handleClear = useCallback(() => {
    setMessages([])
    setSessionId(null)
  }, [])

  // 发送消息（流式接收）
  const handleSend = useCallback(async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || loading) return

    const userMsg: Message = { id: `u_${Date.now()}`, role: 'user', content: trimmed }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    const assistantId = `a_${Date.now()}`
    setMessages(prev => [...prev, { id: assistantId, role: 'assistant', content: '' }])

    try {
      const res = await fetch('/api/knowledge/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed, sessionId }),
      })

      if (!res.ok || !res.body) {
        throw new Error(`请求失败: ${res.status}`)
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const blocks = buffer.split('\n\n')
        buffer = blocks.pop() ?? ''

        for (const block of blocks) {
          const line = block.replace(/^data:\s*/, '').trim()
          if (!line || line === '[DONE]') continue

          try {
            const parsed = JSON.parse(line)
            // sessionId 事件
            if (parsed?.type === 'session' && parsed.sessionId) {
              setSessionId(parsed.sessionId)
              continue
            }
            if (parsed?.type === 'error') continue
            // 文本片段
            if (typeof parsed === 'string') {
              setMessages(prev =>
                prev.map(m =>
                  m.id === assistantId
                    ? { ...m, content: m.content + parsed }
                    : m
                )
              )
            }
          } catch {
            // 非 JSON，跳过
          }
        }
      }
    } catch (err) {
      setMessages(prev =>
        prev.map(m =>
          m.id === assistantId
            ? { ...m, content: '抱歉，请求出错了，请稍后重试。' }
            : m
        )
      )
      console.error('Knowledge chat error:', err)
    } finally {
      setLoading(false)
    }
  }, [loading, sessionId])

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    handleSend(input)
  }

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend(input)
    }
  }

  if (hidden || !ready) return null

  return (
    <>
      {/* 悬浮按钮 */}
      <div
        className="group fixed z-50 select-none touch-none"
        style={{ left: pos.x, top: pos.y }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        <button
          onClick={handleToggle}
          className={cn(
            'flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all',
            'bg-linear-to-br from-blue-500 to-indigo-600 text-white',
            'hover:shadow-xl hover:scale-105 active:scale-95',
          )}
          title="打开知识小助手"
        >
          {open ? (
            <X className="h-6 w-6" />
          ) : (
            <MessageCircleQuestion className="h-6 w-6" />
          )}
        </button>
        {/* Tooltip */}
        {!open && (
          <span className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-gray-800 px-2.5 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
            打开知识小助手
          </span>
        )}
      </div>

      {/* 对话框 */}
      {open && (
        <div
          className={cn(
            'fixed z-50 flex flex-col overflow-hidden rounded-2xl border bg-white shadow-2xl',
            'w-[380px] h-[540px]',
            'animate-in fade-in slide-in-from-bottom-4 duration-200',
          )}
          style={{
            right: 24,
            bottom: 24,
          }}
        >
          {/* 头部 */}
          <div className="flex items-center justify-between border-b bg-linear-to-r from-blue-500 to-indigo-600 px-4 py-3 text-white">
            <div className="flex items-center gap-2">
              <MessageCircleQuestion className="h-5 w-5" />
              <span className="font-semibold text-sm">C/C++ 知识小助手</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={handleClear}
                className="rounded-md p-1.5 transition-colors hover:bg-white/20"
                title="清空对话"
              >
                <Trash2 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setOpen(false)}
                className="rounded-md p-1.5 transition-colors hover:bg-white/20"
                title="关闭"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* 消息列表 */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-3 space-y-3">
            {messages.length === 0 && (
              <div className="flex h-full flex-col items-center justify-center text-center text-gray-400">
                <MessageCircleQuestion className="h-10 w-10 mb-3 text-blue-300" />
                <p className="text-sm font-medium text-gray-500">有什么 C/C++ 问题？</p>
                <p className="text-xs mt-1">随时输入你的问题，我来帮你解答</p>
                <div className="mt-4 flex flex-wrap gap-2 justify-center">
                  {['指针和引用的区别？', 'vector 扩容机制', 'RAII 是什么？'].map(q => (
                    <button
                      key={q}
                      onClick={() => handleSend(q)}
                      className="rounded-full border px-3 py-1 text-xs text-gray-600 hover:bg-blue-50 hover:border-blue-300 transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {messages.map(msg => (
              <div
                key={msg.id}
                className={cn(
                  'flex',
                  msg.role === 'user' ? 'justify-end' : 'justify-start',
                )}
              >
                <div
                  className={cn(
                    'max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm',
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white rounded-br-md'
                      : 'bg-gray-100 text-gray-800 rounded-bl-md',
                  )}
                >
                  {msg.role === 'assistant' ? (
                    <div className="prose prose-sm max-w-none overflow-hidden prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-pre:my-2 prose-pre:overflow-x-auto prose-headings:my-2 prose-code:text-blue-700 prose-code:bg-blue-50 prose-code:px-1 prose-code:rounded">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {msg.content || '思考中…'}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <span className="whitespace-pre-wrap">{msg.content}</span>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md bg-gray-100 px-4 py-2.5 text-sm text-gray-500">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>正在思考…</span>
                </div>
              </div>
            )}
          </div>

          {/* 输入区 */}
          <form onSubmit={onSubmit} className="border-t p-3">
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="输入你的 C/C++ 问题…"
                rows={1}
                className="flex-1 resize-none rounded-xl border bg-gray-50 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className={cn(
                  'flex h-9 w-9 items-center justify-center rounded-xl transition-colors',
                  input.trim() && !loading
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed',
                )}
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  )
}
