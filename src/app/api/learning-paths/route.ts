import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { createSuccessResponse, createErrorResponse, getCurrentUserId } from '@/lib/utils/response'

// GET /api/learning-paths - 获取学习路径列表
export async function GET(request: NextRequest) {
  try {
    const userId = await getCurrentUserId()
    if (!userId) {
      return NextResponse.json(createErrorResponse('未登录'), { status: 401 })
    }

    let paths = await prisma.learningPath.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })

    // 如果用户没有学习路径，自动创建默认路径
    if (paths.length === 0) {
      const defaultPath = await prisma.learningPath.create({
        data: {
          userId,
          title: 'C++ 从入门到精通',
          description: '系统学习 C++ 编程语言，掌握核心概念和最佳实践',
          steps: JSON.stringify([
            { id: 1, title: 'C++ 简介与环境搭建', description: '了解 C++ 历史、特性，搭建开发环境', duration: '15分钟', status: 'in_progress', articleSlug: 'cpp-intro' },
            { id: 2, title: '基本数据类型和变量', description: '学习 C++ 的基本数据类型、变量声明和初始化', duration: '20分钟', status: 'locked', articleSlug: 'data-types' },
            { id: 3, title: '控制流语句', description: '掌握 if、switch、循环等控制流语句', duration: '25分钟', status: 'locked', articleSlug: 'control-flow' },
            { id: 4, title: '函数与参数传递', description: '理解函数定义、参数传递方式、返回值', duration: '30分钟', status: 'locked', articleSlug: 'functions' },
            { id: 5, title: '指针基础', description: '深入理解指针的概念、使用和常见陷阱', duration: '40分钟', status: 'locked', articleSlug: 'pointer-basics' },
            { id: 6, title: '智能指针', description: '掌握 unique_ptr、shared_ptr、weak_ptr', duration: '45分钟', status: 'locked', articleSlug: 'smart-pointers' },
          ]),
          currentStep: 1,
          progress: 0,
          status: 'active',
        },
      })
      paths = [defaultPath]
    }

    const parsed = paths.map(p => ({
      ...p,
      steps: JSON.parse(p.steps),
    }))

    return NextResponse.json(createSuccessResponse(parsed))
  } catch (error) {
    console.error('Get learning paths error:', error)
    return NextResponse.json(createErrorResponse('服务器错误'), { status: 500 })
  }
}
