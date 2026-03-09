import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { createSuccessResponse, createErrorResponse } from '@/lib/utils/response'

// GET /api/knowledge/categories - 获取知识库分类
export async function GET(request: NextRequest) {
  try {
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
  } catch (error) {
    console.error('Get knowledge categories error:', error)
    return NextResponse.json(createErrorResponse('服务器错误'), { status: 500 })
  }
}
