/**
 * 认证工具函数
 */

import type { User } from '@/types/api'

const TOKEN_KEY = 'auth_token'
const USER_KEY = 'auth_user'

/**
 * 保存认证信息
 */
export function setAuth(token: string, user: User) {
  if (typeof window === 'undefined') return
  
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

/**
 * 获取 Token
 */
export function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(TOKEN_KEY)
}

/**
 * 获取用户信息
 */
export function getUser(): User | null {
  if (typeof window === 'undefined') return null
  
  const userStr = localStorage.getItem(USER_KEY)
  if (!userStr) return null
  
  try {
    return JSON.parse(userStr)
  } catch {
    return null
  }
}

/**
 * 清除认证信息
 */
export function clearAuth() {
  if (typeof window === 'undefined') return
  
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

/**
 * 检查是否已登录
 */
export function isAuthenticated(): boolean {
  return !!getToken()
}
