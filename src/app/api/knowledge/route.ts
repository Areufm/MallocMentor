import { NextRequest, NextResponse } from 'next/server'
import { mockKnowledgeArticles, createSuccessResponse, createErrorResponse, delay, paginate } from '@/lib/mock-data'

// GET /api/knowledge - 获取知识库文章列表
export async function GET(request: NextRequest) {
  try {
    await delay(400)

    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '10')
    const category = searchParams.get('category')
    const difficulty = searchParams.get('difficulty')
    const search = searchParams.get('search')

    // 筛选逻辑
    let filteredArticles = mockKnowledgeArticles

    if (category && category !== 'all') {
      filteredArticles = filteredArticles.filter(a => a.category === category)
    }

    if (difficulty && difficulty !== 'all') {
      filteredArticles = filteredArticles.filter(a => a.difficulty === difficulty)
    }

    if (search) {
      const searchLower = search.toLowerCase()
      filteredArticles = filteredArticles.filter(a => 
        a.title.toLowerCase().includes(searchLower) ||
        a.content.toLowerCase().includes(searchLower) ||
        a.tags.some(tag => tag.toLowerCase().includes(searchLower))
      )
    }

    // 分页
    const result = paginate(filteredArticles, page, pageSize)

    return NextResponse.json(createSuccessResponse(result))
  } catch (error) {
    console.error('Get knowledge articles error:', error)
    return NextResponse.json(
      createErrorResponse('服务器错误'),
      { status: 500 }
    )
  }
}
