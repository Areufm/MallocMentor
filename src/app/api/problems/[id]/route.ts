import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { createSuccessResponse, createErrorResponse } from '@/lib/utils/response'

// GET /api/problems/[id] - 获取单个题目详情
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const problem = await prisma.problem.findUnique({ where: { id } })

    if (!problem) {
      return NextResponse.json(
        createErrorResponse('题目不存在', `找不到 ID 为 ${id} 的题目`),
        { status: 404 }
      )
    }

    const parsed = {
      ...problem,
      tags: JSON.parse(problem.tags),
      testCases: JSON.parse(problem.testCases),
      hints: problem.hints ? JSON.parse(problem.hints) : [],
    }

    return NextResponse.json(createSuccessResponse(parsed))
  } catch (error) {
    console.error('Get problem detail error:', error)
    return NextResponse.json(createErrorResponse('服务器错误'), { status: 500 })
  }
}
