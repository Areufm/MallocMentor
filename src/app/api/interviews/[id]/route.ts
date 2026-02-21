import { NextRequest, NextResponse } from 'next/server'
import { mockInterviewSessions, createSuccessResponse, createErrorResponse, delay } from '@/lib/mock-data'

// GET /api/interviews/[id] - 获取面试会话详情
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await delay(300)
    const session = mockInterviewSessions.find(s => s.id === id)

    if (!session) {
      return NextResponse.json(
        createErrorResponse('面试会话不存在'),
        { status: 404 }
      )
    }

    return NextResponse.json(createSuccessResponse(session))
  } catch (error) {
    console.error('Get interview detail error:', error)
    return NextResponse.json(
      createErrorResponse('服务器错误'),
      { status: 500 }
    )
  }
}

// DELETE /api/interviews/[id] - 删除面试会话
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await delay(300)

    return NextResponse.json(createSuccessResponse({ id }, '删除成功'))
  } catch (error) {
    console.error('Delete interview error:', error)
    return NextResponse.json(
      createErrorResponse('服务器错误'),
      { status: 500 }
    )
  }
}
