import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { createSuccessResponse } from '@/lib/utils/response'
import { withAuth } from '@/lib/api/handler'
import { ApiError } from '@/lib/utils/api-error'
import { logger } from '@/lib/utils/logger'
import { chatNonStream, isCozeConfigured, parseJsonAnswer } from '@/lib/ai/coze'

/** AI 生成的题目结构 */
interface GeneratedProblem {
  title: string
  description: string
  difficulty: string
  category: string
  tags: string[]
  testCases: Array<{ input: string; expectedOutput: string; explanation?: string }>
  hints: string[]
  solution: string
  templateCode: { c: string; cpp: string }
}

const CATEGORIES = ['数组', '链表', '指针', '内存管理', 'STL', '字符串', '排序', '树', '面向对象', '并发']
const DIFFICULTIES = ['Easy', 'Medium', 'Hard']

/**
 * POST /api/problems/generate
 *
 * AI 自动出题：根据分类和难度，调用 codeReview Bot 生成一道结构化 C/C++ 练习题。
 */
export const POST = withAuth(async ({ req }) => {
  const body = await req.json()
  const { category, difficulty, count = 1 } = body as {
    category?: string
    difficulty?: string
    count?: number
  }

  if (category && !CATEGORIES.includes(category)) {
    throw new ApiError(400, `无效分类，可选：${CATEGORIES.join('、')}`)
  }
  if (difficulty && !DIFFICULTIES.includes(difficulty)) {
    throw new ApiError(400, '无效难度，可选：Easy、Medium、Hard')
  }

  if (!isCozeConfigured('codeReview')) {
    throw new ApiError(503, '代码审查 Bot 未配置，无法生成题目')
  }

  const generated: GeneratedProblem[] = []
  const batchSize = Math.min(count, 5)

  for (let i = 0; i < batchSize; i++) {
    const prompt = buildGeneratePrompt(category, difficulty)
    try {
      const { answer } = await chatNonStream('codeReview', prompt)
      const parsed = parseJsonAnswer<GeneratedProblem>(answer)

      if (!parsed.title || !parsed.description) continue

      // 去重：按标题检查是否已存在
      const existing = await prisma.problem.findFirst({ where: { title: parsed.title } })
      if (existing) continue

      const problem = await prisma.problem.create({
        data: {
          title: parsed.title,
          description: parsed.description,
          difficulty: parsed.difficulty || difficulty || 'Medium',
          category: parsed.category || category || '综合',
          tags: JSON.stringify(parsed.tags || []),
          testCases: JSON.stringify(parsed.testCases || []),
          hints: JSON.stringify(parsed.hints || []),
          solution: parsed.solution ? JSON.stringify(parsed.solution) : null,
        },
      })

      generated.push({ ...parsed, title: problem.title })
    } catch (err) {
      logger.error('problems/generate', `generate problem ${i + 1} failed`, err)
    }
  }

  if (generated.length === 0) {
    throw new ApiError(500, '生成失败，请稍后重试')
  }

  return NextResponse.json(createSuccessResponse(
    { count: generated.length, problems: generated.map(p => p.title) },
    `成功生成 ${generated.length} 道题目`,
  ))
})

function buildGeneratePrompt(category?: string, difficulty?: string): string {
  const catHint = category ? `分类为「${category}」` : '任意 C/C++ 相关分类'
  const diffHint = difficulty ? `难度为 ${difficulty}` : '难度自选（Easy/Medium/Hard）'

  return `你是一位 C/C++ 编程教学专家。请生成一道${catHint}、${diffHint}的编程练习题。

要求：
1. 题目要有明确的输入输出要求
2. 至少提供 2 个测试用例
3. 提供 1-2 条提示
4. 提供参考解法

请严格以 JSON 格式返回，不要包含其他内容：
{
  "title": "题目标题（简洁，10字以内）",
  "description": "完整的题目描述，包含输入输出格式说明",
  "difficulty": "Easy 或 Medium 或 Hard",
  "category": "分类名称",
  "tags": ["标签1", "标签2"],
  "testCases": [
    { "input": "输入示例", "expectedOutput": "期望输出", "explanation": "可选解释" }
  ],
  "hints": ["提示1", "提示2"],
  "solution": "参考解法代码（C++）",
  "templateCode": {
    "c": "C 语言模板代码",
    "cpp": "C++ 模板代码"
  }
}`
}
