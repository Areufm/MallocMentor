import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { createSuccessResponse } from '@/lib/utils/response'
import { withAuth } from '@/lib/api/handler'

// GET /api/activities - 获取用户活动日志
export const GET = withAuth(async ({ userId, req }) => {
  const searchParams = req.nextUrl.searchParams
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
})
