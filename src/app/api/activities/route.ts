import { NextRequest, NextResponse } from 'next/server'
import { mockActivities, createSuccessResponse, createErrorResponse, delay, paginate } from '@/lib/mock-data'

// GET /api/activities - 获取用户活动日志
export async function GET(request: NextRequest) {
  try {
    await delay(300)

    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '20')
    const type = searchParams.get('type')
    const userId = searchParams.get('userId') || '1'

    // 筛选逻辑
    let filteredActivities = mockActivities.filter(a => a.userId === userId)

    if (type && type !== 'all') {
      filteredActivities = filteredActivities.filter(a => a.type === type)
    }

    // 分页
    const result = paginate(filteredActivities, page, pageSize)

    return NextResponse.json(createSuccessResponse(result))
  } catch (error) {
    console.error('Get activities error:', error)
    return NextResponse.json(
      createErrorResponse('服务器错误'),
      { status: 500 }
    )
  }
}
