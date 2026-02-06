import { NextRequest, NextResponse } from 'next/server'
import { mockUsers, createSuccessResponse, createErrorResponse, delay } from '@/lib/mock-data'

// GET /api/auth/me - 获取当前用户信息
export async function GET(request: NextRequest) {
  try {
    await delay(300)

    // 从 header 中获取 token
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json(
        createErrorResponse('未授权', '请先登录'),
        { status: 401 }
      )
    }

    // Mock: 返回第一个用户
    const user = mockUsers[0]

    return NextResponse.json(createSuccessResponse(user))
  } catch (error) {
    console.error('Get current user error:', error)
    return NextResponse.json(
      createErrorResponse('服务器错误'),
      { status: 500 }
    )
  }
}
