import { NextRequest, NextResponse } from 'next/server'
import { mockInterviewTemplates, createSuccessResponse, createErrorResponse, delay } from '@/lib/mock-data'

// GET /api/interviews/templates - 获取面试模板列表
export async function GET(request: NextRequest) {
  try {
    await delay(300)

    return NextResponse.json(createSuccessResponse(mockInterviewTemplates))
  } catch (error) {
    console.error('Get interview templates error:', error)
    return NextResponse.json(
      createErrorResponse('服务器错误'),
      { status: 500 }
    )
  }
}
