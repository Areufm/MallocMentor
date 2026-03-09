"use client"

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { AppLayout } from '@/components/layout/app-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ChevronLeft, Clock, BookOpen, Eye, Loader2, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { knowledgeApi } from '@/lib/api'
import type { KnowledgeArticle } from '@/types/api'

export default function KnowledgeArticlePage() {
  const params = useParams()
  const id = params.id as string

  const [article, setArticle] = useState<(KnowledgeArticle & { content?: string }) | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const res = await knowledgeApi.getById(id)
        if (res.success && res.data) {
          setArticle(res.data)
        }
      } catch (err) {
        console.error('Load article error:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800'
      case 'Medium': return 'bg-yellow-100 text-yellow-800'
      case 'Hard': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      </AppLayout>
    )
  }

  if (!article) {
    return (
      <AppLayout>
        <div className="text-center py-20">
          <p className="text-gray-500 mb-4">文章不存在</p>
          <Link href="/knowledge">
            <Button>返回知识库</Button>
          </Link>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="space-y-4">
        <Link href="/knowledge">
          <Button variant="ghost" size="sm">
            <ChevronLeft className="h-4 w-4 mr-1" />
            返回知识库
          </Button>
        </Link>

        <div className="grid gap-6 lg:grid-cols-4">
          {/* 主内容区 */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader className="border-b">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge className={getDifficultyColor(article.difficulty)} variant="outline">
                      {article.difficulty}
                    </Badge>
                    {Array.isArray(article.tags) && article.tags.map((tag: string) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <CardTitle className="text-2xl">{article.title}</CardTitle>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <BookOpen className="h-4 w-4" />
                      {article.author}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      {article.views} 次浏览
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      约 {'estimatedTime' in article ? String(article.estimatedTime) : '15'} 分钟
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="prose prose-gray max-w-none dark:prose-invert prose-headings:scroll-mt-20 prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-code:text-pink-600 prose-code:before:content-none prose-code:after:content-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {article.content || `# ${article.title}\n\n内容正在编写中...`}
                  </ReactMarkdown>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 右侧信息栏 */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">文章信息</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">难度</span>
                  <Badge className={getDifficultyColor(article.difficulty)} variant="outline">
                    {article.difficulty}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">分类</span>
                  <span className="font-medium">{article.category}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">浏览量</span>
                  <span className="font-medium">{article.views}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-green-50 border-green-200">
              <CardContent className="pt-4">
                <div className="flex gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-green-900 mb-1">学习提示</p>
                    <p className="text-green-700 text-xs">
                      阅读完本文后，建议尝试相关的练习题来巩固知识。
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
