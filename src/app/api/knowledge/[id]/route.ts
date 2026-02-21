import { NextRequest, NextResponse } from 'next/server'
import { mockKnowledgeArticles, createSuccessResponse, createErrorResponse, delay } from '@/lib/mock-data'

// GET /api/knowledge/[id] - 获取知识库文章详情
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await delay(300)
    const article = mockKnowledgeArticles.find(a => a.id === id)

    if (!article) {
      return NextResponse.json(
        createErrorResponse('文章不存在'),
        { status: 404 }
      )
    }

    // Mock: 增加浏览次数
    article.views += 1

    return NextResponse.json(createSuccessResponse(article))
  } catch (error) {
    console.error('Get knowledge article detail error:', error)
    return NextResponse.json(
      createErrorResponse('服务器错误'),
      { status: 500 }
    )
  }
}
