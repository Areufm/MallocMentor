import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { createSuccessResponse } from '@/lib/utils/response'
import { withAuth } from '@/lib/api/handler'
import { parseInterviewEvaluation } from '@/lib/utils/json-fields'

// GET /api/interviews/stats - 获取面试统计数据
export const GET = withAuth(async ({ userId }) => {
  const completedSessions = await prisma.interviewSession.findMany({
    where: { userId, status: 'completed' },
    select: { evaluation: true, createdAt: true, updatedAt: true },
  })

  const completedCount = completedSessions.length

  // 从 evaluation JSON 中提取分数
  let totalScore = 0
  let scoreCount = 0

  for (const s of completedSessions) {
    const evalData = parseInterviewEvaluation(s.evaluation)
    if (evalData?.overallScore) {
      totalScore += evalData.overallScore
      scoreCount++
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
})
