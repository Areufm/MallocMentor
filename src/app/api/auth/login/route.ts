import { NextRequest, NextResponse } from 'next/server'
import { mockUsers, createSuccessResponse, createErrorResponse, delay } from '@/lib/mock-data'
import type { LoginRequest, AuthResponse } from '@/types/api'

// POST /api/auth/login
export async function POST(request: NextRequest) {
  try {
    await delay(500) // 模拟网络延迟

    const body: LoginRequest = await request.json()
    const { email, password } = body

    // 验证输入
    if (!email || !password) {
      return NextResponse.json(
        createErrorResponse('缺少必要参数', '请提供邮箱和密码'),
        { status: 400 }
      )
    }

    // Mock 验证逻辑（任何密码都接受）
    const user = mockUsers.find(u => u.email === email)
    
    if (!user) {
      return NextResponse.json(
        createErrorResponse('用户不存在', '邮箱或密码错误'),
        { status: 401 }
      )
    }

    // 生成 mock token
    const token = `mock_token_${Date.now()}_${user.id}`

    const response: AuthResponse = {
      user,
      token,
    }

    return NextResponse.json(createSuccessResponse(response, '登录成功'))
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      createErrorResponse('服务器错误', '登录失败，请稍后重试'),
      { status: 500 }
    )
  }
}
