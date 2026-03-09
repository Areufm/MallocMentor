import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { createSuccessResponse, createErrorResponse, getCurrentUserId } from '@/lib/utils/response'

// GET /api/users/stats - 获取用户统计数据
export async function GET(request: NextRequest) {
  try {
    const userId = await getCurrentUserId()
    if (!userId) {
      return NextResponse.json(createErrorResponse('未登录'), { status: 401 })
    }

    const [problemsCompleted, totalProblems, interviewCount, learningPaths, activityDays] = await Promise.all([
      prisma.codeSubmission.count({ where: { userId, status: 'Passed' } }),
      prisma.problem.count(),
      prisma.interviewSession.count({ where: { userId, status: 'completed' } }),
      prisma.learningPath.findMany({ where: { userId } }),
      // 计算连续学习天数：查最近活动日期
      prisma.activityLog.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        select: { createdAt: true },
        take: 60,
      }),
    ])

    const totalSubmissions = await prisma.codeSubmission.count({ where: { userId } })
    const passRate = totalSubmissions > 0 ? Math.round((problemsCompleted / totalSubmissions) * 100) : 0

    // 计算连续天数
    let streak = 0
    if (activityDays.length > 0) {
      const dates = [...new Set(activityDays.map(a => a.createdAt.toISOString().split('T')[0]))]
      const today = new Date().toISOString().split('T')[0]
      if (dates[0] === today || dates[0] === getYesterday()) {
        streak = 1
        for (let i = 1; i < dates.length; i++) {
          const prev = new Date(dates[i - 1])
          const curr = new Date(dates[i])
          const diff = (prev.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24)
          if (Math.round(diff) === 1) streak++
          else break
        }
      }
    }

    // 估算学习时长：面试数 * 0.75h + 活动记录天数 * 1h
    const studyHours = Math.round(interviewCount * 0.75 + activityDays.length * 0.5)

    return NextResponse.json(createSuccessResponse({
      problemsCompleted,
      totalProblems,
      studyHours,
      passRate,
      achievements: interviewCount + problemsCompleted,
      streak,
    }))
  } catch (error) {
    console.error('Get user stats error:', error)
    return NextResponse.json(createErrorResponse('服务器错误'), { status: 500 })
  }
}

function getYesterday(): string {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return d.toISOString().split('T')[0]
}
