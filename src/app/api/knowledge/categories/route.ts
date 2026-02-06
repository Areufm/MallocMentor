import { NextRequest, NextResponse } from 'next/server'
import { createSuccessResponse, createErrorResponse, delay } from '@/lib/mock-data'
import type { KnowledgeCategory } from '@/types/api'

// GET /api/knowledge/categories - 获取知识库分类
export async function GET(request: NextRequest) {
  try {
    await delay(300)

    const categories: KnowledgeCategory[] = [
      { id: 'all', name: '全部', count: 156 },
      { id: 'basics', name: '基础语法', count: 42 },
      { id: 'pointer', name: '指针与内存', count: 38 },
      { id: 'oop', name: '面向对象', count: 28 },
      { id: 'stl', name: 'STL', count: 31 },
      { id: 'concurrency', name: '并发编程', count: 17 },
    ]

    return NextResponse.json(createSuccessResponse(categories))
  } catch (error) {
    console.error('Get knowledge categories error:', error)
    return NextResponse.json(
      createErrorResponse('服务器错误'),
      { status: 500 }
    )
  }
}
