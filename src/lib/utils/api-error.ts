/**
 * 业务错误：在 route handler 内抛出，由 withAuth/withErrorBoundary 自动捕获并转为 HTTP 响应。
 *
 * 用法：
 *   throw new ApiError(404, '题目不存在')
 *   throw new ApiError(400, '缺少必要参数')
 */
export class ApiError extends Error {
  readonly statusCode: number

  constructor(statusCode: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.statusCode = statusCode
  }
}
