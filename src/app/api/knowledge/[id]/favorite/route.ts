import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { createSuccessResponse } from '@/lib/utils/response'
import { withAuth, withErrorBoundary } from '@/lib/api/handler'
import { getCurrentUserId } from '@/lib/utils/response'
import { ApiError } from '@/lib/utils/api-error'

// POST /api/knowledge/[id]/favorite - 切换收藏状态
export const POST = withAuth<{ id: string }>(async ({ userId, params }) => {
  const { id } = params

  const article = await prisma.knowledgeArticle.findUnique({ where: { id } })
  if (!article) {
    throw new ApiError(404, '文章不存在')
  }

  const existing = await prisma.userFavorite.findUnique({
    where: { userId_articleId: { userId, articleId: id } },
  })

  if (existing) {
    // 取消收藏
    await prisma.userFavorite.delete({ where: { id: existing.id } })
    await prisma.knowledgeArticle.update({
      where: { id },
      data: { likes: { decrement: 1 } },
    })
    return NextResponse.json(createSuccessResponse({ favorited: false }, '已取消收藏'))
  }

  // 添加收藏
  await prisma.userFavorite.create({
    data: { userId, articleId: id },
  })
  await prisma.knowledgeArticle.update({
    where: { id },
    data: { likes: { increment: 1 } },
  })
  return NextResponse.json(createSuccessResponse({ favorited: true }, '收藏成功'))
})

// GET /api/knowledge/[id]/favorite - 查询当前用户是否已收藏
// 未登录返回 favorited:false（不是 401），所以用 withErrorBoundary 而非 withAuth
export const GET = withErrorBoundary<{ id: string }>(async ({ params }) => {
  const { id } = params
  const userId = await getCurrentUserId()
  if (!userId) {
    return NextResponse.json(createSuccessResponse({ favorited: false }))
  }

  const existing = await prisma.userFavorite.findUnique({
    where: { userId_articleId: { userId, articleId: id } },
  })
  return NextResponse.json(createSuccessResponse({ favorited: !!existing }))
})
