import prisma from '@/lib/prisma'

// ============================================
// 成就定义
// ============================================

export type AchievementCategory = 'practice' | 'interview' | 'learning' | 'streak'

export interface AchievementDef {
  key: string
  title: string
  description: string
  icon: string       // Lucide 图标名
  category: AchievementCategory
}

export const ACHIEVEMENTS: AchievementDef[] = [
  // --- 练习类 ---
  { key: 'first_attempt',   title: '初出茅庐',   description: '首次提交代码',         icon: 'Rocket',        category: 'practice' },
  { key: 'first_pass',      title: '首战告捷',   description: '首次通过题目',         icon: 'CheckCircle',   category: 'practice' },
  { key: 'score_80',        title: '精益求精',   description: '首次获得 80+ 评分',    icon: 'Star',          category: 'practice' },
  { key: 'score_95',        title: '近乎完美',   description: '首次获得 95+ 评分',    icon: 'Crown',         category: 'practice' },
  { key: 'problems_5',      title: '小试牛刀',   description: '完成 5 道不同题目',    icon: 'Swords',        category: 'practice' },
  { key: 'problems_all',    title: '题库征服者', description: '完成题库所有题目',     icon: 'Trophy',        category: 'practice' },

  // --- 面试类 ---
  { key: 'first_interview',  title: '面试初体验', description: '完成首次模拟面试',     icon: 'MessageSquare', category: 'interview' },
  { key: 'interviews_5',     title: '面试达人',   description: '完成 5 次模拟面试',    icon: 'Award',         category: 'interview' },

  // --- 学习类 ---
  { key: 'path_complete',    title: '阶段通关',   description: '完成一条学习路径',     icon: 'GraduationCap', category: 'learning' },
  { key: 'articles_10',      title: '求知若渴',   description: '阅读 10 篇知识库文章', icon: 'BookOpen',      category: 'learning' },

  // --- 坚持类 ---
  { key: 'streak_3',   title: '持之以恒', description: '连续学习 3 天',  icon: 'Flame',    category: 'streak' },
  { key: 'streak_7',   title: '一周坚持', description: '连续学习 7 天',  icon: 'Zap',      category: 'streak' },
  { key: 'streak_30',  title: '月度学霸', description: '连续学习 30 天', icon: 'Calendar', category: 'streak' },
]

export const ACHIEVEMENT_MAP = Object.fromEntries(
  ACHIEVEMENTS.map(a => [a.key, a]),
) as Record<string, AchievementDef>

// ============================================
// 触发上下文
// ============================================

export type AchievementTrigger =
  | { type: 'submission'; score: number | null; status: string }
  | { type: 'interview_end' }
  | { type: 'learning_progress'; pathCompleted: boolean }
  | { type: 'stats'; streak: number }

// ============================================
// 核心检测与颁发
// ============================================

/**
 * 检测并颁发成就，返回本次新解锁的成就 key 列表。
 * 只检测与当前 trigger 相关的成就，避免不必要的数据库查询。
 */
export async function checkAndAwardAchievements(
  userId: string,
  trigger: AchievementTrigger,
): Promise<string[]> {
  const newlyUnlocked: string[] = []

  const candidateKeys = getCandidateKeys(trigger)
  if (candidateKeys.length === 0) return newlyUnlocked

  // 查出已解锁的成就（只查候选集合内的），减少逐个查询
  const existing = await prisma.userAchievement.findMany({
    where: { userId, achievementKey: { in: candidateKeys } },
    select: { achievementKey: true },
  })
  const existingSet = new Set(existing.map(e => e.achievementKey))

  // 过滤掉已拥有的
  const toCheck = candidateKeys.filter(k => !existingSet.has(k))
  if (toCheck.length === 0) return newlyUnlocked

  // 逐个检测条件
  for (const key of toCheck) {
    const satisfied = await isConditionMet(userId, key, trigger)
    if (satisfied) {
      try {
        await prisma.userAchievement.create({
          data: { userId, achievementKey: key },
        })

        const def = ACHIEVEMENT_MAP[key]
        if (def) {
          await prisma.activityLog.create({
            data: {
              userId,
              type: 'achievement',
              title: `解锁成就「${def.title}」`,
              description: def.description,
              metadata: JSON.stringify({ achievementKey: key }),
            },
          })
        }

        newlyUnlocked.push(key)
      } catch {
        // unique constraint violation → 已存在，跳过
      }
    }
  }

  return newlyUnlocked
}

// ============================================
// 内部工具函数
// ============================================

/** 根据触发类型返回需要检测的成就 key 列表 */
function getCandidateKeys(trigger: AchievementTrigger): string[] {
  switch (trigger.type) {
    case 'submission':
      return ['first_attempt', 'first_pass', 'score_80', 'score_95', 'problems_5', 'problems_all']
    case 'interview_end':
      return ['first_interview', 'interviews_5']
    case 'learning_progress':
      return trigger.pathCompleted ? ['path_complete', 'articles_10'] : ['articles_10']
    case 'stats':
      return ['streak_3', 'streak_7', 'streak_30', 'articles_10']
    default:
      return []
  }
}

/** 判断单个成就条件是否满足 */
async function isConditionMet(
  userId: string,
  key: string,
  trigger: AchievementTrigger,
): Promise<boolean> {
  switch (key) {
    // --- 练习类 ---
    case 'first_attempt': {
      const count = await prisma.codeSubmission.count({ where: { userId } })
      return count >= 1
    }
    case 'first_pass': {
      if (trigger.type === 'submission' && trigger.status !== 'Passed') return false
      const count = await prisma.codeSubmission.count({ where: { userId, status: 'Passed' } })
      return count >= 1
    }
    case 'score_80': {
      if (trigger.type === 'submission' && trigger.score !== null && trigger.score >= 80) return true
      return false
    }
    case 'score_95': {
      if (trigger.type === 'submission' && trigger.score !== null && trigger.score >= 95) return true
      return false
    }
    case 'problems_5': {
      const passed = await prisma.codeSubmission.findMany({
        where: { userId, status: 'Passed' },
        select: { problemId: true },
        distinct: ['problemId'],
      })
      return passed.length >= 5
    }
    case 'problems_all': {
      const [passed, total] = await Promise.all([
        prisma.codeSubmission.findMany({
          where: { userId, status: 'Passed' },
          select: { problemId: true },
          distinct: ['problemId'],
        }),
        prisma.problem.count(),
      ])
      return total > 0 && passed.length >= total
    }

    // --- 面试类 ---
    case 'first_interview': {
      const count = await prisma.interviewSession.count({ where: { userId, status: 'completed' } })
      return count >= 1
    }
    case 'interviews_5': {
      const count = await prisma.interviewSession.count({ where: { userId, status: 'completed' } })
      return count >= 5
    }

    // --- 学习类 ---
    case 'path_complete': {
      const count = await prisma.learningPath.count({ where: { userId, status: 'completed' } })
      return count >= 1
    }
    case 'articles_10': {
      const count = await prisma.userLearningProgress.count({
        where: { userId, status: 'completed' },
      })
      return count >= 10
    }

    // --- 坚持类 ---
    case 'streak_3':
      return trigger.type === 'stats' && trigger.streak >= 3
    case 'streak_7':
      return trigger.type === 'stats' && trigger.streak >= 7
    case 'streak_30':
      return trigger.type === 'stats' && trigger.streak >= 30

    default:
      return false
  }
}
