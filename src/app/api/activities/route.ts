import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { createSuccessResponse, createErrorResponse, getCurrentUserId } from '@/lib/utils/response'

// GET /api/activities - 获取用户活动日志
export async function GET(request: NextRequest) {
  try {
    const userId = await getCurrentUserId()
    if (!userId) {
      return NextResponse.json(createErrorResponse('未登录'), { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '20')
    const type = searchParams.get('type')

    const where: Record<string, unknown> = { userId }
    if (type && type !== 'all') {
      where.type = type
    }

    const [activities, total] = await Promise.all([
      prisma.activityLog.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.activityLog.count({ where }),
    ])

    return NextResponse.json(createSuccessResponse({
      data: activities,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    }))
  } catch (error) {
    console.error('Get activities error:', error)
    return NextResponse.json(createErrorResponse('服务器错误'), { status: 500 })
  }
}
