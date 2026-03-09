import { auth } from '@/auth'

export function createSuccessResponse<T>(data: T, message?: string) {
  return { success: true, data, message }
}

export function createErrorResponse(error: string, message?: string) {
  return { success: false, error, message }
}

/**
 * 获取当前登录用户 ID，未登录返回 null
 */
export async function getCurrentUserId(): Promise<string | null> {
  const session = await auth()
  return session?.user?.id ?? null
}
