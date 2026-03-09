import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { createSuccessResponse, createErrorResponse, getCurrentUserId } from '@/lib/utils/response'

// GET /api/interviews/stats - 获取面试统计数据
export async function GET(request: NextRequest) {
  try {
    const userId = await getCurrentUserId()
    if (!userId) {
      return NextResponse.json(createErrorResponse('未登录'), { status: 401 })
    }

    const completedSessions = await prisma.interviewSession.findMany({
      where: { userId, status: 'completed' },
      select: { evaluation: true, createdAt: true, updatedAt: true },
    })

    const completedCount = completedSessions.length

    // 从 evaluation JSON 中提取分数
    let totalScore = 0
    let scoreCount = 0
    const domainScores: Record<string, number[]> = {}

    for (const s of completedSessions) {
      if (s.evaluation) {
        try {
          const evalData = JSON.parse(s.evaluation)
          if (evalData.overallScore) {
            totalScore += evalData.overallScore
            scoreCount++
          }
        } catch { /* ignore parse errors */ }
      }
    }

    const averageScore = scoreCount > 0 ? Math.round(totalScore / scoreCount) : 0

    // 估算总时长（用 createdAt 和 updatedAt 差值）
    let totalMinutes = 0
    for (const s of completedSessions) {
      const diff = (s.updatedAt.getTime() - s.createdAt.getTime()) / 60000
      totalMinutes += Math.min(diff, 120) // 上限 2 小时
    }
    const totalDurationHours = Math.round(totalMinutes / 60 * 10) / 10

    return NextResponse.json(createSuccessResponse({
      completedCount,
      totalDurationHours,
      averageScore,
      scoreTrend: 0,
      topDomain: 'C++',
      topDomainScore: averageScore,
    }))
  } catch (error) {
    console.error('Get interview stats error:', error)
    return NextResponse.json(createErrorResponse('服务器错误'), { status: 500 })
  }
}
