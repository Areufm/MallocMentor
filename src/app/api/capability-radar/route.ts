import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { createSuccessResponse } from '@/lib/utils/response'
import { withAuth } from '@/lib/api/handler'

// GET /api/capability-radar - 获取用户能力雷达图
export const GET = withAuth(async ({ userId }) => {
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
})

// POST /api/capability-radar - 更新能力雷达图
export const POST = withAuth(async ({ userId, req }) => {
  const body = await req.json()
  const { basicSyntax, memoryManagement, dataStructures, oop, stlLibrary, systemProgramming } = body

  const radar = await prisma.capabilityRadar.upsert({
    where: { userId },
    update: { basicSyntax, memoryManagement, dataStructures, oop, stlLibrary, systemProgramming },
    create: { userId, basicSyntax, memoryManagement, dataStructures, oop, stlLibrary, systemProgramming },
  })

  return NextResponse.json(createSuccessResponse(radar, '能力雷达图更新成功'))
})
