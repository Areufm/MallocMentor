import { NextRequest, NextResponse } from 'next/server'
import { createSuccessResponse, createErrorResponse, delay } from '@/lib/mock-data'
import type { RunCodeRequest, RunCodeResponse } from '@/types/api'

// POST /api/code/run - 运行代码
export async function POST(request: NextRequest) {
  try {
    await delay(1500) // 模拟代码执行时间

    const body: RunCodeRequest = await request.json()
    const { code, language, input } = body

    if (!code || !language) {
      return NextResponse.json(
        createErrorResponse('缺少必要参数'),
        { status: 400 }
      )
    }

    // Mock 运行结果
    const result: RunCodeResponse = {
      output: '[0, 1]\n',
      executionTime: 15,
      memoryUsed: 2048,
    }

    return NextResponse.json(createSuccessResponse(result, '运行成功'))
  } catch (error) {
    console.error('Run code error:', error)
    return NextResponse.json(
      createErrorResponse('服务器错误', '运行失败，请稍后重试'),
      { status: 500 }
    )
  }
}
