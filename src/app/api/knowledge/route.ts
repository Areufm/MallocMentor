import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { createSuccessResponse } from '@/lib/utils/response'
import { withErrorBoundary } from '@/lib/api/handler'
import { parseTags } from '@/lib/utils/json-fields'

// GET /api/knowledge - 获取知识库文章列表
export const GET = withErrorBoundary(async ({ req }) => {
  const searchParams = req.nextUrl.searchParams
  const page = parseInt(searchParams.get('page') || '1')
  const pageSize = parseInt(searchParams.get('pageSize') || '10')
  const category = searchParams.get('category')
  const difficulty = searchParams.get('difficulty')
  const search = searchParams.get('search')
  const sort = searchParams.get('sort') // views | likes | newest (default)

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

  // 排序：浏览量 / 收藏量 / 最新（默认）
  let orderBy: Record<string, string> = { createdAt: 'desc' }
  if (sort === 'views') orderBy = { views: 'desc' }
  else if (sort === 'likes') orderBy = { likes: 'desc' }

  const [articles, total] = await Promise.all([
    prisma.knowledgeArticle.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy,
    }),
    prisma.knowledgeArticle.count({ where }),
  ])

  const parsed = articles.map(a => ({
    ...a,
    tags: parseTags(a.tags),
  }))

  return NextResponse.json(createSuccessResponse({
    data: parsed,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  }))
})
