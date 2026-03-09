import { NextRequest, NextResponse } from 'next/server'
import { createSuccessResponse, createErrorResponse } from '@/lib/utils/response'
import { chatNonStream, isCozeConfigured } from '@/lib/ai/coze'
import type { RunCodeRequest } from '@/types/api'

// POST /api/code/run - 运行代码（通过 Coze 代码审查 Bot 分析）
export async function POST(request: NextRequest) {
  try {
    const body: RunCodeRequest = await request.json()
    const { code, language, input } = body

    if (!code || !language) {
      return NextResponse.json(createErrorResponse('缺少必要参数'), { status: 400 })
    }

    if (isCozeConfigured('codeReview')) {
      const prompt = `请分析以下 ${language === 'cpp' ? 'C++' : 'C'} 代码，模拟运行并给出预期输出：\n\n\`\`\`${language}\n${code}\n\`\`\`${input ? `\n\n输入：${input}` : ''}\n\n请返回以下 JSON 格式：{"output": "程序输出", "analysis": "简要分析"}`

      try {
        const { answer } = await chatNonStream('codeReview', prompt)
        return NextResponse.json(createSuccessResponse({
          output: answer,
          executionTime: 0,
          memoryUsed: 0,
        }, '分析完成'))
      } catch {
        // Coze 调用失败时降级到 Mock
      }
    }

    // Mock 模式
    return NextResponse.json(createSuccessResponse({
      output: '代码审查 Bot 未配置，无法运行代码。请在扣子平台创建代码审查 Bot 并配置环境变量。',
      executionTime: 0,
      memoryUsed: 0,
    }, '提示'))
  } catch (error) {
    console.error('Run code error:', error)
    return NextResponse.json(createErrorResponse('服务器错误'), { status: 500 })
  }
}
