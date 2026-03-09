import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { createSuccessResponse, createErrorResponse, getCurrentUserId } from '@/lib/utils/response'

// GET /api/interviews/[id] - 获取面试会话详情
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const userId = await getCurrentUserId()
    if (!userId) {
      return NextResponse.json(createErrorResponse('未登录'), { status: 401 })
    }

    const session = await prisma.interviewSession.findFirst({
      where: { id, userId },
    })

    if (!session) {
      return NextResponse.json(createErrorResponse('面试会话不存在'), { status: 404 })
    }

    return NextResponse.json(createSuccessResponse({
      ...session,
      messages: JSON.parse(session.messages),
      evaluation: session.evaluation ? JSON.parse(session.evaluation) : undefined,
    }))
  } catch (error) {
    console.error('Get interview detail error:', error)
    return NextResponse.json(createErrorResponse('服务器错误'), { status: 500 })
  }
}

// DELETE /api/interviews/[id] - 删除面试会话
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const userId = await getCurrentUserId()
    if (!userId) {
      return NextResponse.json(createErrorResponse('未登录'), { status: 401 })
    }

    await prisma.interviewSession.deleteMany({ where: { id, userId } })

    return NextResponse.json(createSuccessResponse({ id }, '删除成功'))
  } catch (error) {
    console.error('Delete interview error:', error)
    return NextResponse.json(createErrorResponse('服务器错误'), { status: 500 })
  }
}
