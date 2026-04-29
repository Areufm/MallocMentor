import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { createSuccessResponse } from '@/lib/utils/response'
import { withAuth } from '@/lib/api/handler'
import { ACHIEVEMENTS } from '@/lib/domain/achievements'

// GET /api/achievements - 返回全量成就定义 + 用户解锁状态
export const GET = withAuth(async ({ userId }) => {
  const unlocked = await prisma.userAchievement.findMany({
    where: { userId },
    select: { achievementKey: true, unlockedAt: true },
  })

  const unlockedMap = new Map(
    unlocked.map(u => [u.achievementKey, u.unlockedAt.toISOString()]),
  )

  const list = ACHIEVEMENTS.map(def => ({
    ...def,
    unlocked: unlockedMap.has(def.key),
    unlockedAt: unlockedMap.get(def.key) ?? null,
  }))

  return NextResponse.json(createSuccessResponse({
    achievements: list,
    total: ACHIEVEMENTS.length,
    unlocked: unlocked.length,
  }))
})
