import { NextRequest, NextResponse } from 'next/server'
import { mockCapabilityRadar, createSuccessResponse, createErrorResponse, delay } from '@/lib/mock-data'

// GET /api/capability-radar - 获取用户能力雷达图
export async function GET(request: NextRequest) {
  try {
    await delay(300)

    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId') || '1'

    // Mock: 返回固定的雷达图数据
    return NextResponse.json(createSuccessResponse(mockCapabilityRadar))
  } catch (error) {
    console.error('Get capability radar error:', error)
    return NextResponse.json(
      createErrorResponse('服务器错误'),
      { status: 500 }
    )
  }
}

// POST /api/capability-radar - 更新能力雷达图（系统自动计算后更新）
export async function POST(request: NextRequest) {
  try {
    await delay(300)

    const body = await request.json()

    // Mock: 接受任何更新
    return NextResponse.json(createSuccessResponse(body, '能力雷达图更新成功'))
  } catch (error) {
    console.error('Update capability radar error:', error)
    return NextResponse.json(
      createErrorResponse('服务器错误'),
      { status: 500 }
    )
  }
}
