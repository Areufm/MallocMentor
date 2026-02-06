import { NextRequest, NextResponse } from 'next/server'
import { createSuccessResponse, createErrorResponse, delay } from '@/lib/mock-data'
import type { SubmitCodeRequest, CodeSubmission } from '@/types/api'

// POST /api/code/submit - 提交代码
export async function POST(request: NextRequest) {
  try {
    await delay(2000) // 模拟代码执行时间

    const body: SubmitCodeRequest = await request.json()
    const { problemId, code, language } = body

    if (!problemId || !code || !language) {
      return NextResponse.json(
        createErrorResponse('缺少必要参数'),
        { status: 400 }
      )
    }

    // Mock 测试结果
    const submission: CodeSubmission = {
      id: `submission_${Date.now()}`,
      userId: '1',
      problemId,
      code,
      language,
      status: 'Passed',
      testResults: [
        {
          testCaseIndex: 0,
          input: '[2,7,11,15], 9',
          expectedOutput: '[0,1]',
          actualOutput: '[0,1]',
          passed: true,
          executionTime: 12,
          memoryUsed: 1024,
        },
        {
          testCaseIndex: 1,
          input: '[3,2,4], 6',
          expectedOutput: '[1,2]',
          actualOutput: '[1,2]',
          passed: true,
          executionTime: 10,
          memoryUsed: 1024,
        },
        {
          testCaseIndex: 2,
          input: '[3,3], 6',
          expectedOutput: '[0,1]',
          actualOutput: '[0,1]',
          passed: true,
          executionTime: 8,
          memoryUsed: 1024,
        },
      ],
      aiReview: {
        overallScore: 85,
        feedback: '代码实现正确，逻辑清晰。使用哈希表优化了时间复杂度到 O(n)。',
        issues: [
          {
            type: 'info',
            line: 5,
            message: '建议添加边界条件检查',
            suggestion: '在访问数组前检查数组是否为空',
          },
        ],
        suggestions: [
          '可以添加更详细的注释说明算法思路',
          '考虑使用 unordered_map 进一步优化性能',
        ],
        strengths: [
          '时间复杂度优秀',
          '代码简洁易读',
          '变量命名规范',
        ],
      },
      createdAt: new Date().toISOString(),
    }

    return NextResponse.json(createSuccessResponse(submission, '提交成功'))
  } catch (error) {
    console.error('Submit code error:', error)
    return NextResponse.json(
      createErrorResponse('服务器错误', '提交失败，请稍后重试'),
      { status: 500 }
    )
  }
}
