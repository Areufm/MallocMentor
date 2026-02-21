import { NextRequest, NextResponse } from 'next/server'
import { mockLearningPaths, createSuccessResponse, createErrorResponse, delay } from '@/lib/mock-data'

// GET /api/learning-paths/[id] - 获取学习路径详情
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await delay(300)
    const path = mockLearningPaths.find(p => p.id === id)

    if (!path) {
      return NextResponse.json(
        createErrorResponse('学习路径不存在'),
        { status: 404 }
      )
    }

    return NextResponse.json(createSuccessResponse(path))
  } catch (error) {
    console.error('Get learning path detail error:', error)
    return NextResponse.json(
      createErrorResponse('服务器错误'),
      { status: 500 }
    )
  }
}
