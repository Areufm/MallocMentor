/**
 * API 客户端工具
 * 基于 Next.js 增强的 fetch API
 */

import type { ApiResponse } from '@/types/api'

// API 基础 URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api'

// 请求配置类型
interface RequestConfig extends RequestInit {
  params?: Record<string, any>
}

/**
 * API 错误类
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: any
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

/**
 * 构建 URL（含查询参数）
 */
function buildUrl(endpoint: string, params?: Record<string, any>): string {
  const url = new URL(endpoint, API_BASE_URL)
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value))
      }
    })
  }
  
  return url.toString()
}

/**
 * 统一请求处理
 * NextAuth 通过 HTTP-only Cookie 自动传递会话信息
 */
async function request<T = any>(
  endpoint: string,
  config: RequestConfig = {}
): Promise<ApiResponse<T>> {
  const { params, headers, ...restConfig } = config
  
  const url = buildUrl(endpoint, params)
  
  const requestHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    ...headers,
  }
  
  try {
    const response = await fetch(url, {
      ...restConfig,
      headers: requestHeaders,
    })
    
    // 解析响应
    const data = await response.json()
    
    // 处理错误响应
    if (!response.ok) {
      throw new ApiError(
        data.message || data.error || '请求失败',
        response.status,
        data
      )
    }
    
    return data
  } catch (error) {
    // 网络错误或其他错误
    if (error instanceof ApiError) {
      throw error
    }
    
    throw new ApiError(
      error instanceof Error ? error.message : '网络错误',
      0
    )
  }
}

/**
 * GET 请求
 */
export async function get<T = any>(
  endpoint: string,
  params?: Record<string, any>,
  config?: RequestConfig
): Promise<ApiResponse<T>> {
  return request<T>(endpoint, {
    method: 'GET',
    ...config,
    params,
  })
}

/**
 * POST 请求
 */
export async function post<T = any>(
  endpoint: string,
  data?: any,
  config?: RequestConfig
): Promise<ApiResponse<T>> {
  return request<T>(endpoint, {
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
    ...config,
  })
}

/**
 * PUT 请求
 */
export async function put<T = any>(
  endpoint: string,
  data?: any,
  config?: RequestConfig
): Promise<ApiResponse<T>> {
  return request<T>(endpoint, {
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined,
    ...config,
  })
}

/**
 * DELETE 请求
 */
export async function del<T = any>(
  endpoint: string,
  config?: RequestConfig
): Promise<ApiResponse<T>> {
  return request<T>(endpoint, {
    method: 'DELETE',
    ...config,
  })
}

/**
 * PATCH 请求
 */
export async function patch<T = any>(
  endpoint: string,
  data?: any,
  config?: RequestConfig
): Promise<ApiResponse<T>> {
  return request<T>(endpoint, {
    method: 'PATCH',
    body: data ? JSON.stringify(data) : undefined,
    ...config,
  })
}

// 默认导出
const apiClient = {
  get,
  post,
  put,
  delete: del,
  patch,
}

export default apiClient
