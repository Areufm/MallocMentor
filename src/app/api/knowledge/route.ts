import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { createSuccessResponse, createErrorResponse } from '@/lib/utils/response'

// GET /api/knowledge - 获取知识库文章列表
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
        { summary: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [articles, total] = await Promise.all([
      prisma.knowledgeArticle.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.knowledgeArticle.count({ where }),
    ])

    const parsed = articles.map(a => ({
      ...a,
      tags: JSON.parse(a.tags),
    }))

    return NextResponse.json(createSuccessResponse({
      data: parsed,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    }))
  } catch (error) {
    console.error('Get knowledge articles error:', error)
    return NextResponse.json(createErrorResponse('服务器错误'), { status: 500 })
  }
}
