import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { createSuccessResponse, createErrorResponse } from '@/lib/utils/response'

// GET /api/interviews/templates - 获取面试模板列表
export async function GET(request: NextRequest) {
  try {
    const templates = await prisma.interviewTemplate.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'asc' },
    })

    const parsed = templates.map(t => ({
      ...t,
      topics: JSON.parse(t.topics),
    }))

    return NextResponse.json(createSuccessResponse(parsed))
  } catch (error) {
    console.error('Get interview templates error:', error)
    return NextResponse.json(createErrorResponse('服务器错误'), { status: 500 })
  }
}
