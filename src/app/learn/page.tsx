"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AppLayout } from '@/components/layout/app-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  BookOpen,
  CheckCircle2,
  Circle,
  Lock,
  Play,
  Trophy,
  Clock,
  Loader2,
} from 'lucide-react'
import Link from 'next/link'
import { learningPathApi, knowledgeApi } from '@/lib/api'

interface LearningStep {
  id: number
  title: string
  description: string
  duration: string
  status: string
  articleSlug?: string
}

interface LearningPathData {
  id: string
  title: string
  description: string
  steps: LearningStep[]
  currentStep: number
  progress: number
  status: string
}

export default function LearnPage() {
  const router = useRouter()
  const [paths, setPaths] = useState<LearningPathData[]>([])
  const [loading, setLoading] = useState(true)
  const [articleMap, setArticleMap] = useState<Record<string, string>>({}) // slug -> id

  useEffect(() => {
    async function loadData() {
      try {
        const [pathsRes, articlesRes] = await Promise.all([
          learningPathApi.getList(),
          knowledgeApi.getList({ page: 1, pageSize: 100 }),
        ])

        if (pathsRes.success && pathsRes.data) {
          setPaths(pathsRes.data as unknown as LearningPathData[])
        }

        // 建立 slug -> id 映射
        if (articlesRes.success && articlesRes.data?.data) {
          const map: Record<string, string> = {}
          for (const a of articlesRes.data.data as unknown as Array<{ slug: string; id: string }>) {
            map[a.slug] = a.id
          }
          setArticleMap(map)
        }
      } catch (err) {
        console.error('Load learn data error:', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const currentPath = paths[0]
  const steps: LearningStep[] = currentPath?.steps ?? []

  // 获取当前进行中的步骤对应的文章链接
  const getCurrentArticleLink = () => {
    const currentStep = steps.find(s => s.status === 'in_progress')
    if (currentStep?.articleSlug && articleMap[currentStep.articleSlug]) {
      return `/knowledge/${articleMap[currentStep.articleSlug]}`
    }
    return '/knowledge'
  }

  const getStepArticleLink = (step: LearningStep) => {
    if (step.articleSlug && articleMap[step.articleSlug]) {
      return `/knowledge/${articleMap[step.articleSlug]}`
    }
    return '/knowledge'
  }

  // 标记步骤完成
  const handleCompleteStep = async (pathId: string, stepId: number) => {
    try {
      const res = await learningPathApi.updateProgress(pathId, { pathId, stepId, completed: true })
      if (res.success) {
        // 重新加载数据
        const pathsRes = await learningPathApi.getList()
        if (pathsRes.success && pathsRes.data) {
          setPaths(pathsRes.data as unknown as LearningPathData[])
        }
      }
    } catch (err) {
      console.error('Update progress error:', err)
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

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">学习路径</h1>
          <p className="text-gray-500 mt-1">系统化学习 C/C++ 编程知识</p>
        </div>

        {/* 当前学习路径 */}
        {currentPath && (
          <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 dark:border-blue-900 dark:from-blue-950/60 dark:to-indigo-950/60">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <Badge className="bg-blue-600 text-white mb-2">当前学习</Badge>
                  <CardTitle className="text-2xl">{currentPath.title}</CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400 mt-2">
                    {currentPath.description}
                  </CardDescription>
                </div>
                <Trophy className="h-12 w-12 text-yellow-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">学习进度</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {steps.filter(s => s.status === 'completed').length}/{steps.length} 章节
                    </span>
                  </div>
                  <Progress value={currentPath.progress} className="h-2" />
                </div>

                <div className="grid grid-cols-3 gap-4 pt-2">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {steps.filter(s => s.status === 'completed').length}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">已完成</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {steps.filter(s => s.status !== 'completed').length}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">待学习</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {currentPath.progress}%
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">完成率</div>
                  </div>
                </div>

                <Link href={getCurrentArticleLink()}>
                  <Button className="w-full" size="lg">
                    <Play className="h-4 w-4 mr-2" />
                    继续学习
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          {/* 左侧：学习步骤 */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>课程大纲</CardTitle>
                <CardDescription>按顺序完成以下学习内容</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {steps.map((step) => (
                    <div
                      key={step.id}
                      className={`flex items-center gap-4 p-3 rounded-lg border transition-all ${
                        step.status === 'completed' ? 'bg-green-50 border-green-200 dark:bg-green-950/40 dark:border-green-900' :
                        step.status === 'in_progress' ? 'bg-blue-50 border-blue-200 dark:bg-blue-950/40 dark:border-blue-900' :
                        'bg-gray-50 border-gray-200 dark:bg-muted/30 dark:border-border'
                      } ${step.status === 'locked' ? 'opacity-60' : 'hover:shadow-sm cursor-pointer'}`}
                      onClick={() => {
                        if (step.status !== 'locked') {
                          router.push(getStepArticleLink(step))
                        }
                      }}
                    >
                      <div className="flex-shrink-0">
                        {step.status === 'completed' ? (
                          <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
                        ) : step.status === 'in_progress' ? (
                          <Circle className="h-6 w-6 text-blue-600 dark:text-blue-400 animate-pulse" />
                        ) : (
                          <Lock className="h-6 w-6 text-gray-400 dark:text-gray-500" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500 dark:text-gray-400">第 {step.id} 章</span>
                          {step.status === 'in_progress' && (
                            <Badge variant="outline" className="bg-blue-100 text-blue-700 text-xs dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-800">
                              进行中
                            </Badge>
                          )}
                        </div>
                        <h4 className="font-medium mt-1">{step.title}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Clock className="h-3 w-3 text-gray-400 dark:text-gray-500" />
                          <span className="text-xs text-gray-500 dark:text-gray-400">{step.duration}</span>
                        </div>
                      </div>

                      {step.status !== 'locked' && (
                        <div className="flex gap-2">
                          {step.status === 'in_progress' && currentPath && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleCompleteStep(currentPath.id, step.id)
                              }}
                            >
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              完成
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant={step.status === 'in_progress' ? 'default' : 'outline'}
                            onClick={(e) => {
                              e.stopPropagation()
                              router.push(getStepArticleLink(step))
                            }}
                          >
                            {step.status === 'completed' ? '复习' : '学习'}
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 右侧 */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">快速入口</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/knowledge" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <BookOpen className="h-4 w-4 mr-2" />
                    浏览知识库
                  </Button>
                </Link>
                <Link href="/practice" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <BookOpen className="h-4 w-4 mr-2" />
                    代码练习
                  </Button>
                </Link>
                <Link href="/interview" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <BookOpen className="h-4 w-4 mr-2" />
                    模拟面试
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
