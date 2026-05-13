/**
 * 统一日志输出
 *
 * 替代散落在 30 个 route 文件中的 `console.error('xxx error:', err)`。
 * 保留 console 作为底层（Next.js / Vercel 都能正常采集），但提供一致的 prefix。
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

const isDev = process.env.NODE_ENV !== 'production'

function format(level: LogLevel, scope: string, message: string): string {
  const ts = new Date().toISOString()
  return `[${ts}] [${level.toUpperCase()}] [${scope}] ${message}`
}

export const logger = {
  debug(scope: string, message: string, meta?: unknown) {
    if (!isDev) return
    console.debug(format('debug', scope, message), meta ?? '')
  },
  info(scope: string, message: string, meta?: unknown) {
    console.info(format('info', scope, message), meta ?? '')
  },
  warn(scope: string, message: string, meta?: unknown) {
    console.warn(format('warn', scope, message), meta ?? '')
  },
  error(scope: string, message: string, err?: unknown) {
    const errInfo =
      err instanceof Error
        ? { name: err.name, message: err.message, stack: err.stack }
        : err
    console.error(format('error', scope, message), errInfo ?? '')
  },
}
