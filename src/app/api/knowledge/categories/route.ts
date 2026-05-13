import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { createSuccessResponse } from '@/lib/utils/response'
import { withErrorBoundary } from '@/lib/api/handler'

// GET /api/knowledge/categories - 获取知识库分类
export const GET = withErrorBoundary(async () => {
  const categories = await prisma.knowledgeCategory.findMany({
    orderBy: { sortOrder: 'asc' },
  })

  // 在最前面插入「全部」分类
  const totalCount = await prisma.knowledgeArticle.count()
  const result = [
    { id: 'all', name: 'all', label: '全部', icon: null, description: null, articleCount: totalCount, sortOrder: 0 },
    ...categories,
  ]

  return NextResponse.json(createSuccessResponse(result))
})
