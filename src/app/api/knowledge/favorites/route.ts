import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { createSuccessResponse } from '@/lib/utils/response'
import { withAuth } from '@/lib/api/handler'
import { parseTags } from '@/lib/utils/json-fields'

// GET /api/knowledge/favorites - 获取当前用户的收藏文章列表
export const GET = withAuth(async ({ userId, req }) => {
  const searchParams = req.nextUrl.searchParams
  const page = parseInt(searchParams.get('page') || '1')
  const pageSize = parseInt(searchParams.get('pageSize') || '20')

  const [favorites, total] = await Promise.all([
    prisma.userFavorite.findMany({
      where: { userId },
      include: { article: true },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.userFavorite.count({ where: { userId } }),
  ])

  const articles = favorites.map(f => ({
    ...f.article,
    tags: parseTags(f.article.tags),
    favoritedAt: f.createdAt,
  }))

  return NextResponse.json(createSuccessResponse({
    data: articles,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  }))
})
