import { NextRequest, NextResponse } from 'next/server'
import { mockUserStats, createSuccessResponse, createErrorResponse, delay } from '@/lib/mock-data'

// GET /api/users/stats - 获取用户统计数据
export async function GET(request: NextRequest) {
  try {
    await delay(300)

    return NextResponse.json(createSuccessResponse(mockUserStats))
  } catch (error) {
    console.error('Get user stats error:', error)
    return NextResponse.json(
      createErrorResponse('服务器错误'),
      { status: 500 }
    )
  }
}
