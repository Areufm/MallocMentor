import { NextRequest, NextResponse } from 'next/server'
import { mockInterviewStats, createSuccessResponse, createErrorResponse, delay } from '@/lib/mock-data'

// GET /api/interviews/stats - 获取面试统计数据
export async function GET(request: NextRequest) {
  try {
    await delay(300)

    return NextResponse.json(createSuccessResponse(mockInterviewStats))
  } catch (error) {
    console.error('Get interview stats error:', error)
    return NextResponse.json(
      createErrorResponse('服务器错误'),
      { status: 500 }
    )
  }
}
