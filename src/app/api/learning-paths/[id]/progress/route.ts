import { NextRequest, NextResponse } from 'next/server'
import { createSuccessResponse, createErrorResponse, delay } from '@/lib/mock-data'
import type { UpdateProgressRequest } from '@/types/api'

// POST /api/learning-paths/[id]/progress - 更新学习进度
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await delay(300)

    const body: UpdateProgressRequest = await request.json()
    const { stepId, completed } = body

    if (stepId === undefined || completed === undefined) {
      return NextResponse.json(
        createErrorResponse('缺少必要参数'),
        { status: 400 }
      )
    }

    // Mock 更新成功
    return NextResponse.json(createSuccessResponse({ updated: true }, '进度更新成功'))
  } catch (error) {
    console.error('Update progress error:', error)
    return NextResponse.json(
      createErrorResponse('服务器错误'),
      { status: 500 }
    )
  }
}
