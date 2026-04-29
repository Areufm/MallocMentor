import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { createSuccessResponse } from '@/lib/utils/response'
import { withAuth } from '@/lib/api/handler'
import { logger } from '@/lib/utils/logger'
import { isCozeConfigured, chatNonStream, parseJsonAnswer } from '@/lib/ai/coze'
import { LEARNING_PATH_TEMPLATES } from '@/lib/domain/learning-path-templates'

interface RecommendResult {
  focusAreas: string[]
  reason: string
  suggestedTemplateId: string | null
  customSteps?: Array<{ title: string; description: string; duration: string }>
}

/**
 * POST /api/learning-paths/recommend
 *
 * 根据用户能力雷达图 + 已完成路径，调用 Coze AI 生成个性化学习推荐。
 * 若 Coze 未配置则回退为基于规则的简单推荐。
 */
export const POST = withAuth(async ({ userId }) => {
  // 收集用户画像数据
  const [radar, paths] = await Promise.all([
    prisma.capabilityRadar.findUnique({ where: { userId } }),
    prisma.learningPath.findMany({ where: { userId }, orderBy: { order: 'asc' } }),
  ])

  const completedTemplateIds = paths
    .filter(p => p.status === 'completed' && p.templateId)
    .map(p => p.templateId!)

  const activePath = paths.find(p => p.status === 'active')

  // ---------- 基于 Coze AI 的推荐 ----------
  if (isCozeConfigured('learningPath')) {
    const prompt = buildAIPrompt(radar, completedTemplateIds, activePath?.templateId ?? null)
    try {
      const { answer } = await chatNonStream('learningPath', prompt)
      const result = parseJsonAnswer<RecommendResult>(answer)
      return NextResponse.json(createSuccessResponse(result))
    } catch (aiErr) {
      logger.warn('learning-paths/recommend', 'AI recommend failed, fallback to rule-based', aiErr)
    }
  }

  // ---------- 回退：基于规则的推荐 ----------
  const result = ruleBasedRecommend(radar, completedTemplateIds)
  return NextResponse.json(createSuccessResponse(result))
})

/** 构建发给 AI 的 prompt */
function buildAIPrompt(
  radar: { basicSyntax: number; memoryManagement: number; dataStructures: number; oop: number; stlLibrary: number; systemProgramming: number } | null,
  completedTemplateIds: string[],
  activeTemplateId: string | null,
): string {
  const radarStr = radar
    ? `基础语法: ${radar.basicSyntax}, 内存管理: ${radar.memoryManagement}, 数据结构: ${radar.dataStructures}, 面向对象: ${radar.oop}, STL: ${radar.stlLibrary}, 系统编程: ${radar.systemProgramming}`
    : '暂无评估数据'

  const availableTemplates = LEARNING_PATH_TEMPLATES
    .filter(t => !completedTemplateIds.includes(t.templateId) && t.templateId !== activeTemplateId)
    .map(t => `${t.templateId}: ${t.title}`)
    .join(', ')

  return `你是一位 C++ 教学专家。请根据以下学习者画像，推荐下一步学习方向。

学习者能力雷达图（0-100 分）：${radarStr}
已完成的学习路径：${completedTemplateIds.join(', ') || '无'}
当前正在学习：${activeTemplateId || '无'}
可选的预设路径：${availableTemplates || '全部完成'}

请以 JSON 格式返回推荐，包含以下字段：
- focusAreas: string[] — 建议重点强化的 2-3 个领域
- reason: string — 推荐理由（1-2 句话）
- suggestedTemplateId: string | null — 推荐的预设路径 templateId，无则 null
- customSteps: 可选，当所有预设路径都已完成时，给出 2-3 个自定义进阶学习步骤，每个含 title、description、duration

只返回 JSON，不要解释。`
}

/** 基于规则的简单推荐（无需 AI） */
function ruleBasedRecommend(
  radar: { basicSyntax: number; memoryManagement: number; dataStructures: number; oop: number; stlLibrary: number; systemProgramming: number } | null,
  completedTemplateIds: string[],
): RecommendResult {
  // 找到尚未完成的下一个模板
  const nextTemplate = LEARNING_PATH_TEMPLATES.find(
    t => !completedTemplateIds.includes(t.templateId),
  )

  if (!nextTemplate) {
    // 所有路径已完成，根据雷达图推荐薄弱环节
    const weakAreas = findWeakAreas(radar)
    return {
      focusAreas: weakAreas,
      reason: '你已完成所有预设学习路径，建议针对薄弱环节进行强化练习。',
      suggestedTemplateId: null,
      customSteps: [
        { title: '综合练习', description: '通过刷题巩固所学知识', duration: '持续' },
        { title: '模拟面试', description: '在面试场景中检验知识掌握程度', duration: '每次30分钟' },
      ],
    }
  }

  const focusAreas = getFocusAreasForTemplate(nextTemplate.templateId)
  return {
    focusAreas,
    reason: `建议继续按顺序学习「${nextTemplate.title}」，系统性地构建知识体系。`,
    suggestedTemplateId: nextTemplate.templateId,
  }
}

function findWeakAreas(
  radar: { basicSyntax: number; memoryManagement: number; dataStructures: number; oop: number; stlLibrary: number; systemProgramming: number } | null,
): string[] {
  if (!radar) return ['基础语法', '内存管理']
  const dims: [string, number][] = [
    ['基础语法', radar.basicSyntax],
    ['内存管理', radar.memoryManagement],
    ['数据结构', radar.dataStructures],
    ['面向对象', radar.oop],
    ['STL', radar.stlLibrary],
    ['系统编程', radar.systemProgramming],
  ]
  dims.sort((a, b) => a[1] - b[1])
  return dims.slice(0, 3).map(d => d[0])
}

const TEMPLATE_FOCUS_MAP: Record<string, string[]> = {
  basics: ['基础语法', '变量与类型'],
  pointer: ['指针操作', '内存管理'],
  oop: ['面向对象设计', '继承与多态'],
  stl: ['STL容器', '算法运用'],
  concurrency: ['多线程', '线程同步'],
}

function getFocusAreasForTemplate(templateId: string): string[] {
  return TEMPLATE_FOCUS_MAP[templateId] ?? ['C++ 进阶']
}
