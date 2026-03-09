import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { createSuccessResponse, createErrorResponse, getCurrentUserId } from '@/lib/utils/response'

// POST /api/learning-paths/[id]/progress - 更新学习进度
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const userId = await getCurrentUserId()
    if (!userId) {
      return NextResponse.json(createErrorResponse('未登录'), { status: 401 })
    }

    const body = await request.json()
    const { stepId, completed } = body

    if (stepId === undefined || completed === undefined) {
      return NextResponse.json(createErrorResponse('缺少必要参数'), { status: 400 })
    }

    const path = await prisma.learningPath.findFirst({ where: { id, userId } })
    if (!path) {
      return NextResponse.json(createErrorResponse('学习路径不存在'), { status: 404 })
    }

    // 更新步骤状态
    const steps = JSON.parse(path.steps) as Array<{ id: number; status: string; [k: string]: unknown }>
    const stepIndex = steps.findIndex(s => s.id === stepId)
    if (stepIndex === -1) {
      return NextResponse.json(createErrorResponse('步骤不存在'), { status: 404 })
    }

    if (completed) {
      steps[stepIndex].status = 'completed'
      // 解锁下一步
      if (stepIndex + 1 < steps.length && steps[stepIndex + 1].status === 'locked') {
        steps[stepIndex + 1].status = 'in_progress'
      }
    }

    const completedCount = steps.filter(s => s.status === 'completed').length
    const progress = Math.round((completedCount / steps.length) * 100)
    const currentStep = completed ? Math.min(stepId + 1, steps.length) : stepId
    const status = progress === 100 ? 'completed' : 'active'

    await prisma.learningPath.update({
      where: { id },
      data: {
        steps: JSON.stringify(steps),
        currentStep,
        progress,
        status,
      },
    })

    // 写入活动日志
    if (completed) {
      await prisma.activityLog.create({
        data: {
          userId,
          type: 'learning',
          title: `完成了学习章节「${steps[stepIndex].title}」`,
          description: `学习路径进度：${progress}%`,
          metadata: JSON.stringify({ pathId: id, stepId, progress }),
        },
      }).catch(() => {})
    }

    return NextResponse.json(createSuccessResponse({ updated: true, progress, currentStep }, '进度更新成功'))
  } catch (error) {
    console.error('Update progress error:', error)
    return NextResponse.json(createErrorResponse('服务器错误'), { status: 500 })
  }
}
