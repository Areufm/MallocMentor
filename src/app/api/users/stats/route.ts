import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { createSuccessResponse } from '@/lib/utils/response'
import { withAuth } from '@/lib/api/handler'
import { checkAndAwardAchievements } from '@/lib/domain/achievements'

// GET /api/users/stats - 获取用户统计数据
export const GET = withAuth(async ({ userId }) => {
  const [passedProblems, totalProblems, totalSubmissions, passedSubmissions, activityDays, achievementCount] = await Promise.all([
    // 按 problemId 去重，统计通过的不同题目数
    prisma.codeSubmission.findMany({
      where: { userId, status: 'Passed' },
      select: { problemId: true },
      distinct: ['problemId'],
    }),
    prisma.problem.count(),
    prisma.codeSubmission.count({ where: { userId } }),
    prisma.codeSubmission.count({ where: { userId, status: 'Passed' } }),
    prisma.activityLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: { createdAt: true },
      take: 60,
    }),
    prisma.userAchievement.count({ where: { userId } }),
  ])

  const problemsCompleted = passedProblems.length
  const passRate = totalSubmissions > 0 ? Math.round((passedSubmissions / totalSubmissions) * 100) : 0

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

  // 顺带检测 streak / 阅读量相关成就（不阻塞返回）
  checkAndAwardAchievements(userId, { type: 'stats', streak }).catch(() => {})

  return NextResponse.json(createSuccessResponse({
    problemsCompleted,
    totalProblems,
    passRate,
    achievements: achievementCount,
    streak,
  }))
})

function getYesterday(): string {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return d.toISOString().split('T')[0]
}
