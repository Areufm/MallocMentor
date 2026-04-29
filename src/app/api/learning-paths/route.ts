import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { createSuccessResponse } from '@/lib/utils/response'
import { withAuth } from '@/lib/api/handler'
import { ApiError } from '@/lib/utils/api-error'
import {
  LEARNING_PATH_TEMPLATES,
  getTemplate,
  buildStepsJson,
} from '@/lib/learning-path-templates'

// GET /api/learning-paths - 获取学习路径列表（含所有阶段）
export const GET = withAuth(async ({ userId }) => {
  let paths = await prisma.learningPath.findMany({
    where: { userId },
    orderBy: { order: 'asc' },
  })

  // 新用户 — 自动创建第一条路径
  if (paths.length === 0) {
    const firstTemplate = LEARNING_PATH_TEMPLATES[0]
    const created = await prisma.learningPath.create({
      data: {
        userId,
        title: firstTemplate.title,
        description: firstTemplate.description,
        steps: buildStepsJson(firstTemplate),
        currentStep: 1,
        progress: 0,
        status: 'active',
        order: firstTemplate.order,
        templateId: firstTemplate.templateId,
      },
    })
    paths = [created]
  }

  // 已存在的路径 templateId 集合
  const existingTemplateIds = new Set(paths.map(p => p.templateId).filter(Boolean))

  // 构建完整路径列表：已有路径 + 待解锁路径（占位）
  const result = LEARNING_PATH_TEMPLATES.map(tpl => {
    const existing = paths.find(p => p.templateId === tpl.templateId)
    if (existing) {
      return {
        ...existing,
        steps: JSON.parse(existing.steps),
      }
    }

    // 检查前置路径是否已完成
    const prereqDone = tpl.prerequisite
      ? paths.some(p => p.templateId === tpl.prerequisite && p.status === 'completed')
      : true

    // 占位：尚未创建的路径
    return {
      id: `pending-${tpl.templateId}`,
      userId,
      title: tpl.title,
      description: tpl.description,
      steps: tpl.steps.map(s => ({ ...s, status: 'locked' })),
      currentStep: 0,
      progress: 0,
      status: prereqDone ? 'unlocked' : 'locked',
      order: tpl.order,
      templateId: tpl.templateId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  })

  // 追加不在模板中的自定义/AI路径
  for (const p of paths) {
    if (!p.templateId || !existingTemplateIds.has(p.templateId) || !LEARNING_PATH_TEMPLATES.some(t => t.templateId === p.templateId)) {
      // 已经在上面模板映射中处理过的跳过
      if (LEARNING_PATH_TEMPLATES.some(t => t.templateId === p.templateId)) continue
      result.push({ ...p, steps: JSON.parse(p.steps) })
    }
  }

  return NextResponse.json(createSuccessResponse(result))
})

// POST /api/learning-paths - 根据模板创建新路径（用于"开始学习"按钮）
export const POST = withAuth(async ({ userId, req }) => {
  const body = await req.json()
  const { templateId } = body as { templateId?: string }

  if (!templateId) {
    throw new ApiError(400, '缺少 templateId')
  }

  const tpl = getTemplate(templateId)
  if (!tpl) {
    throw new ApiError(404, '模板不存在')
  }

  // 检查是否已存在
  const existing = await prisma.learningPath.findFirst({
    where: { userId, templateId },
  })
  if (existing) {
    return NextResponse.json(createSuccessResponse({
      ...existing,
      steps: JSON.parse(existing.steps),
    }))
  }

  // 检查前置路径是否已完成
  if (tpl.prerequisite) {
    const prereq = await prisma.learningPath.findFirst({
      where: { userId, templateId: tpl.prerequisite, status: 'completed' },
    })
    if (!prereq) {
      throw new ApiError(400, '前置路径尚未完成')
    }
  }

  const created = await prisma.learningPath.create({
    data: {
      userId,
      title: tpl.title,
      description: tpl.description,
      steps: buildStepsJson(tpl),
      currentStep: 1,
      progress: 0,
      status: 'active',
      order: tpl.order,
      templateId: tpl.templateId,
    },
  })

  return NextResponse.json(createSuccessResponse({
    ...created,
    steps: JSON.parse(created.steps),
  }))
})
