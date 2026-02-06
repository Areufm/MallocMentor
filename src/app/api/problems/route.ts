import { NextRequest, NextResponse } from 'next/server'
import { mockProblems, createSuccessResponse, createErrorResponse, delay, paginate } from '@/lib/mock-data'
import type { ProblemsFilter } from '@/types/api'

// GET /api/problems - 获取题目列表（支持筛选和分页）
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
    let filteredProblems = mockProblems

    if (category && category !== 'all') {
      filteredProblems = filteredProblems.filter(p => p.category === category)
    }

    if (difficulty && difficulty !== 'all') {
      filteredProblems = filteredProblems.filter(p => p.difficulty === difficulty)
    }

    if (search) {
      const searchLower = search.toLowerCase()
      filteredProblems = filteredProblems.filter(p => 
        p.title.toLowerCase().includes(searchLower) ||
        p.description.toLowerCase().includes(searchLower) ||
        p.tags.some(tag => tag.toLowerCase().includes(searchLower))
      )
    }

    // 分页
    const result = paginate(filteredProblems, page, pageSize)

    return NextResponse.json(createSuccessResponse(result))
  } catch (error) {
    console.error('Get problems error:', error)
    return NextResponse.json(
      createErrorResponse('服务器错误'),
      { status: 500 }
    )
  }
}
