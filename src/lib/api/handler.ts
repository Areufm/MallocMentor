/**
 * Route Handler 公共封装
 *
 * 解决 30 个 route 文件中重复的 auth / try-catch / error response 模板：
 *   - withAuth:           需要登录态的 handler，自动鉴权 + 错误兜底
 *   - withErrorBoundary:  无需登录的 handler，仅做错误兜底
 *
 * 行为细节：
 * 1. 自动 await `params`（Next 15+ 异步 params 约定）
 * 2. 未登录返回 401 `{ success:false, error:'未登录' }`
 * 3. handler 内可抛 `ApiError(status, message)` 走自定义错误码
 * 4. 其他异常自动捕获 → logger.error → 500 `{ success:false, error:'服务器错误' }`
 * 5. 如果 handler 直接返回 `Response`（用于 SSE），原样透传，不会被 JSON 二次包装
 */

import { NextRequest, NextResponse } from 'next/server'
import {
  createErrorResponse,
  getCurrentUserId,
} from '@/lib/utils/response'
import { logger } from '@/lib/utils/logger'
import { ApiError } from '@/lib/utils/api-error'

// Next.js Route Handler 中，segment params 是 Promise（Next 15+）
type SegmentContext<P> = { params: Promise<P> }

interface AuthHandlerCtx<P> {
  userId: string
  req: NextRequest
  params: P
}

interface PlainHandlerCtx<P> {
  req: NextRequest
  params: P
}

type RouteHandler<P> = (
  req: NextRequest,
  ctx: SegmentContext<P>,
) => Promise<Response>

/**
 * 解析 Promise 化的 params；如果路由没有 params，调用方传 `{}` 即可。
 */
async function resolveParams<P>(ctx: SegmentContext<P> | undefined): Promise<P> {
  if (!ctx) return {} as P
  return (await ctx.params) ?? ({} as P)
}

/**
 * 把 handler 抛出的错误转为合适的 HTTP Response。
 * - ApiError → 用其 statusCode 与 message
 * - 其他    → 500 服务器错误
 */
function toErrorResponse(scope: string, err: unknown): Response {
  if (err instanceof ApiError) {
    return NextResponse.json(createErrorResponse(err.message), {
      status: err.statusCode,
    })
  }
  logger.error(scope, 'unhandled exception', err)
  return NextResponse.json(createErrorResponse('服务器错误'), { status: 500 })
}

/**
 * 需要登录的 handler 封装。
 *
 * @example
 *   export const GET = withAuth(async ({ userId }) => {
 *     const stats = await prisma.user.findUnique({ where: { id: userId } })
 *     return NextResponse.json(createSuccessResponse(stats))
 *   })
 *
 *   // 带路径参数：
 *   export const GET = withAuth<{ id: string }>(async ({ userId, params }) => {
 *     const item = await prisma.item.findFirst({ where: { id: params.id, userId } })
 *     if (!item) throw new ApiError(404, '资源不存在')
 *     return NextResponse.json(createSuccessResponse(item))
 *   })
 */
export function withAuth<P = Record<string, never>>(
  handler: (ctx: AuthHandlerCtx<P>) => Promise<Response>,
): RouteHandler<P> {
  return async (req, ctx) => {
    const scope = req.nextUrl.pathname
    try {
      const userId = await getCurrentUserId()
      if (!userId) {
        return NextResponse.json(createErrorResponse('未登录'), { status: 401 })
      }
      const params = await resolveParams(ctx)
      return await handler({ userId, req, params })
    } catch (err) {
      return toErrorResponse(scope, err)
    }
  }
}

/**
 * 无需登录的 handler 封装（仅做错误兜底）。
 *
 * @example
 *   export const POST = withErrorBoundary(async ({ req }) => {
 *     const body = await req.json()
 *     ...
 *     return NextResponse.json(createSuccessResponse(result))
 *   })
 */
export function withErrorBoundary<P = Record<string, never>>(
  handler: (ctx: PlainHandlerCtx<P>) => Promise<Response>,
): RouteHandler<P> {
  return async (req, ctx) => {
    const scope = req.nextUrl.pathname
    try {
      const params = await resolveParams(ctx)
      return await handler({ req, params })
    } catch (err) {
      return toErrorResponse(scope, err)
    }
  }
}
