import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import prisma from '@/lib/prisma'
import { createSuccessResponse, getCurrentUserId } from '@/lib/utils/response'
import { withErrorBoundary } from '@/lib/api/handler'
import { ApiError } from '@/lib/utils/api-error'
import { parseTags } from '@/lib/utils/json-fields'

// GET /api/knowledge/[id] - 获取知识库文章详情（含 Markdown 内容）
// 未登录也可读，使用 withErrorBoundary
export const GET = withErrorBoundary<{ id: string }>(async ({ params }) => {
  const { id } = params

  const article = await prisma.knowledgeArticle.findUnique({ where: { id } })

  if (!article) {
    throw new ApiError(404, '文章不存在')
  }

  // 增加浏览次数
  await prisma.knowledgeArticle.update({
    where: { id },
    data: { views: { increment: 1 } },
  })

  // 读取 Markdown 文件内容
  let content = ''
  try {
    const filePath = path.join(process.cwd(), 'content', 'articles', article.filePath)
    const rawContent = await fs.readFile(filePath, 'utf-8')
    // 去掉 frontmatter（--- 之间的部分）
    const fmMatch = rawContent.match(/^---\n[\s\S]*?\n---\n([\s\S]*)$/)
    content = fmMatch ? fmMatch[1].trim() : rawContent
  } catch {
    content = `# ${article.title}\n\n内容正在编写中...`
  }

  // 记录阅读活动（同一篇文章 30 分钟内不重复记录）
  const userId = await getCurrentUserId()
  if (userId) {
    const thirtyMinAgo = new Date(Date.now() - 30 * 60 * 1000)
    const recent = await prisma.activityLog.findFirst({
      where: {
        userId,
        type: 'learning',
        title: `阅读了文章「${article.title}」`,
        createdAt: { gte: thirtyMinAgo },
      },
      orderBy: { createdAt: 'desc' },
    }).catch(() => null)

    if (!recent) {
      await prisma.activityLog.create({
        data: {
          userId,
          type: 'learning',
          title: `阅读了文章「${article.title}」`,
          description: article.summary || '',
          metadata: JSON.stringify({ articleId: article.id }),
        },
      }).catch(() => { /* 活动日志写入失败不影响主流程 */ })
    }
  }

  return NextResponse.json(createSuccessResponse({
    ...article,
    tags: parseTags(article.tags),
    content,
  }))
})
