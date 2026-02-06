import { NextRequest, NextResponse } from 'next/server'
import { mockLearningPaths, createSuccessResponse, createErrorResponse, delay } from '@/lib/mock-data'

// GET /api/learning-paths - 获取学习路径列表
export async function GET(request: NextRequest) {
  try {
    await delay(300)

    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')

    let paths = mockLearningPaths

    if (userId) {
      paths = paths.filter(p => p.userId === userId)
    }

    return NextResponse.json(createSuccessResponse(paths))
  } catch (error) {
    console.error('Get learning paths error:', error)
    return NextResponse.json(
      createErrorResponse('服务器错误'),
      { status: 500 }
    )
  }
}
