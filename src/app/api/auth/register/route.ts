import { NextRequest, NextResponse } from 'next/server'
import { mockUsers, createSuccessResponse, createErrorResponse, delay } from '@/lib/mock-data'
import type { RegisterRequest, AuthResponse } from '@/types/api'

// POST /api/auth/register
export async function POST(request: NextRequest) {
  try {
    await delay(500)

    const body: RegisterRequest = await request.json()
    const { email, password, name } = body

    // 验证输入
    if (!email || !password || !name) {
      return NextResponse.json(
        createErrorResponse('缺少必要参数', '请提供完整的注册信息'),
        { status: 400 }
      )
    }

    // 检查邮箱是否已存在
    const existingUser = mockUsers.find(u => u.email === email)
    if (existingUser) {
      return NextResponse.json(
        createErrorResponse('邮箱已被注册', '请使用其他邮箱'),
        { status: 409 }
      )
    }

    // 创建新用户（Mock）
    const newUser = {
      id: `user_${Date.now()}`,
      email,
      name,
      avatar: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // 生成 token
    const token = `mock_token_${Date.now()}_${newUser.id}`

    const response: AuthResponse = {
      user: newUser,
      token,
    }

    return NextResponse.json(createSuccessResponse(response, '注册成功'))
  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json(
      createErrorResponse('服务器错误', '注册失败，请稍后重试'),
      { status: 500 }
    )
  }
}
