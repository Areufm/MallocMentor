import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { createSuccessResponse, createErrorResponse, getCurrentUserId } from '@/lib/utils/response'

// GET /api/capability-radar - 获取用户能力雷达图
export async function GET(request: NextRequest) {
  try {
    const userId = await getCurrentUserId()
    if (!userId) {
      return NextResponse.json(createErrorResponse('未登录'), { status: 401 })
    }

    let radar = await prisma.capabilityRadar.findUnique({ where: { userId } })

    // 如果不存在，创建默认的初始值
    if (!radar) {
      radar = await prisma.capabilityRadar.create({
        data: {
          userId,
          basicSyntax: 0,
          memoryManagement: 0,
          dataStructures: 0,
          oop: 0,
          stlLibrary: 0,
          systemProgramming: 0,
        },
      })
    }

    return NextResponse.json(createSuccessResponse(radar))
  } catch (error) {
    console.error('Get capability radar error:', error)
    return NextResponse.json(createErrorResponse('服务器错误'), { status: 500 })
  }
}

// POST /api/capability-radar - 更新能力雷达图
export async function POST(request: NextRequest) {
  try {
    const userId = await getCurrentUserId()
    if (!userId) {
      return NextResponse.json(createErrorResponse('未登录'), { status: 401 })
    }

    const body = await request.json()
    const { basicSyntax, memoryManagement, dataStructures, oop, stlLibrary, systemProgramming } = body

    const radar = await prisma.capabilityRadar.upsert({
      where: { userId },
      update: { basicSyntax, memoryManagement, dataStructures, oop, stlLibrary, systemProgramming },
      create: { userId, basicSyntax, memoryManagement, dataStructures, oop, stlLibrary, systemProgramming },
    })

    return NextResponse.json(createSuccessResponse(radar, '能力雷达图更新成功'))
  } catch (error) {
    console.error('Update capability radar error:', error)
    return NextResponse.json(createErrorResponse('服务器错误'), { status: 500 })
  }
}
