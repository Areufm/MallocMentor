import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { createSuccessResponse, createErrorResponse, getCurrentUserId } from '@/lib/utils/response'

// GET /api/learning-paths/[id] - 获取学习路径详情
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

    const path = await prisma.learningPath.findFirst({ where: { id, userId } })

    if (!path) {
      return NextResponse.json(createErrorResponse('学习路径不存在'), { status: 404 })
    }

    return NextResponse.json(createSuccessResponse({
      ...path,
      steps: JSON.parse(path.steps),
    }))
  } catch (error) {
    console.error('Get learning path detail error:', error)
    return NextResponse.json(createErrorResponse('服务器错误'), { status: 500 })
  }
}
