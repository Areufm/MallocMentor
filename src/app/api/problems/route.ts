import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { createSuccessResponse, createErrorResponse } from '@/lib/utils/response'

// GET /api/problems - 获取题目列表（支持筛选和分页）
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '10')
    const category = searchParams.get('category')
    const difficulty = searchParams.get('difficulty')
    const search = searchParams.get('search')

    const where: Record<string, unknown> = {}

    if (category && category !== 'all') {
      where.category = category
    }
    if (difficulty && difficulty !== 'all') {
      where.difficulty = difficulty
    }
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [problems, total] = await Promise.all([
      prisma.problem.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.problem.count({ where }),
    ])

    // 将 JSON 字符串字段解析为对象
    const parsed = problems.map(p => ({
      ...p,
      tags: JSON.parse(p.tags),
      testCases: JSON.parse(p.testCases),
      hints: p.hints ? JSON.parse(p.hints) : [],
    }))

    return NextResponse.json(createSuccessResponse({
      data: parsed,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    }))
  } catch (error) {
    console.error('Get problems error:', error)
    return NextResponse.json(createErrorResponse('服务器错误'), { status: 500 })
  }
}
