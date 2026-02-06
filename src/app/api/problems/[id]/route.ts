import { NextRequest, NextResponse } from 'next/server'
import { mockProblems, createSuccessResponse, createErrorResponse, delay } from '@/lib/mock-data'

// GET /api/problems/[id] - 获取单个题目详情
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await delay(300)

    const { id } = params
    const problem = mockProblems.find(p => p.id === id)

    if (!problem) {
      return NextResponse.json(
        createErrorResponse('题目不存在', `找不到 ID 为 ${id} 的题目`),
        { status: 404 }
      )
    }

    return NextResponse.json(createSuccessResponse(problem))
  } catch (error) {
    console.error('Get problem detail error:', error)
    return NextResponse.json(
      createErrorResponse('服务器错误'),
      { status: 500 }
    )
  }
}
