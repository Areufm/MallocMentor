"use client"

import { useState, useMemo } from 'react'
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
  ChevronRight,
  Sparkles,
  ArrowRight,
  Star,
} from 'lucide-react'
import Link from 'next/link'
import {
  useLearningPaths,
  useKnowledgeArticles,
  useStartLearningPath,
  useUpdateLearningProgress,
  useGetLearningRecommendation,
} from '@/hooks/use-api'

// ---------- 类型 ----------

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
  order: number
  templateId: string | null
}

// ---------- 工具函数 ----------

/** 路径状态对应的中文标签与颜色 */
function pathStatusMeta(status: string) {
  switch (status) {
    case 'completed':
      return { label: '已完成', color: 'bg-green-600 text-white', icon: CheckCircle2 }
    case 'active':
      return { label: '学习中', color: 'bg-blue-600 text-white', icon: Play }
    case 'unlocked':
      return { label: '可开始', color: 'bg-amber-500 text-white', icon: Sparkles }
    default:
      return { label: '未解锁', color: 'bg-gray-400 text-white', icon: Lock }
  }
}

// ---------- AI 推荐类型 ----------

interface Recommendation {
  focusAreas: string[]
  reason: string
  suggestedTemplateId: string | null
  customSteps?: Array<{ title: string; description: string; duration: string }>
}

// ---------- 主组件 ----------

export default function LearnPage() {
  const router = useRouter()
  const { data: pathsData, isLoading: pathsLoading } = useLearningPaths()
  const { data: articlesData, isLoading: articlesLoading } = useKnowledgeArticles({ page: 1, pageSize: 100 })
  const startPath = useStartLearningPath()
  const updateProgress = useUpdateLearningProgress()
  const getRecommendation = useGetLearningRecommendation()
  const recLoading = getRecommendation.isLoading
  const recommendation = getRecommendation.data ?? null

  const allPaths = (pathsData ?? []) as unknown as LearningPathData[]
  const loading = pathsLoading || articlesLoading

  const articleMap = useMemo(() => {
    const map: Record<string, string> = {}
    for (const a of (articlesData?.data ?? []) as unknown as Array<{ slug: string; id: string }>) {
      map[a.slug] = a.id
    }
    return map
  }, [articlesData])

  const [celebratePathId, setCelebratePathId] = useState<string | null>(null)
  const [selectedPathId, setSelectedPathId] = useState<string | null>(null)

  // 当前活跃路径
  const activePath = allPaths.find(p => p.status === 'active')

  // 选中展示的路径（默认为活跃路径）
  const displayPath = selectedPathId
    ? allPaths.find(p => p.id === selectedPathId) ?? activePath
    : activePath
  const displaySteps: LearningStep[] = displayPath?.steps ?? []
  const isDisplayActive = displayPath?.status === 'active'

  // 总体进度
  const totalSteps = allPaths.reduce((sum, p) => sum + p.steps.length, 0)
  const completedSteps = allPaths.reduce(
    (sum, p) => sum + p.steps.filter(s => s.status === 'completed').length,
    0,
  )
  const overallProgress = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0

  const getStepArticleLink = (step: LearningStep) => {
    if (step.articleSlug && articleMap[step.articleSlug]) {
      return `/knowledge/${articleMap[step.articleSlug]}`
    }
    return '/knowledge'
  }

  const getCurrentArticleLink = () => {
    const steps = activePath?.steps ?? []
    const currentStep = steps.find(s => s.status === 'in_progress')
    if (currentStep?.articleSlug && articleMap[currentStep.articleSlug]) {
      return `/knowledge/${articleMap[currentStep.articleSlug]}`
    }
    return '/knowledge'
  }

  // 开始一条"unlocked"路径 — 调 POST 创建后由 hook 自动 invalidate 列表
  const handleStartPath = async (templateId: string) => {
    try {
      await startPath.trigger(templateId)
    } catch (err) {
      console.error('Start path error:', err)
    }
  }

  const handleCompleteStep = async (pathId: string, stepId: number) => {
    try {
      const result = await updateProgress.trigger({
        pathId,
        data: { pathId, stepId, completed: true },
      })
      if (result.pathCompleted) {
        setCelebratePathId(pathId)
      }
    } catch (err) {
      console.error('Update progress error:', err)
    }
  }

  const fetchRecommendation = async () => {
    try {
      await getRecommendation.trigger()
    } catch (err) {
      console.error('Fetch recommendation error:', err)
    }
  }

  // ---------- Loading ----------
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
      <div className="space-y-8">
        {/* 页面标题 */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">学习路径</h1>
          <p className="text-gray-500 mt-1">系统化学习 C/C++ 编程知识，完成一个阶段解锁下一个</p>
        </div>

        {/* ===== 总体进度概览 ===== */}
        <Card className="border-indigo-200 dark:border-indigo-800 bg-linear-to-r from-indigo-50 via-blue-50 to-cyan-50 dark:from-indigo-950/50 dark:via-blue-950/40 dark:to-cyan-950/30">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center">
                  <Star className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-lg">总体学习进度</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    已完成 {allPaths.filter(p => p.status === 'completed').length}/{allPaths.length} 个路径
                  </div>
                </div>
              </div>
              <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                {overallProgress}%
              </div>
            </div>
            <Progress value={overallProgress} className="h-2" />
          </CardContent>
        </Card>

        {/* ===== 路径总览卡片 ===== */}
        <div>
          <h2 className="text-xl font-semibold mb-4">学习阶段总览</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {allPaths.map((p, idx) => {
              const meta = pathStatusMeta(p.status)
              const isActive = p.status === 'active'
              const isCompleted = p.status === 'completed'
              const isLocked = p.status === 'locked'

              const isSelected = displayPath?.id === p.id
              const canSelect = isActive || isCompleted

              return (
                <Card
                  key={p.id}
                  className={`relative transition-all ${
                    isSelected
                      ? 'ring-2 ring-blue-500 shadow-md'
                      : isActive
                        ? 'ring-1 ring-blue-300 dark:ring-blue-700'
                        : isCompleted
                          ? 'border-green-300 dark:border-green-800'
                          : isLocked
                            ? 'opacity-60'
                            : 'border-amber-300 dark:border-amber-800'
                  } ${canSelect ? 'cursor-pointer hover:shadow-md' : ''}`}
                  onClick={() => { if (canSelect) setSelectedPathId(p.id) }}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-gray-400">阶段 {p.order}</span>
                      <Badge className={meta.color}>{meta.label}</Badge>
                    </div>
                    <CardTitle className="text-base leading-snug">{p.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                        <span>{p.steps.length} 章节</span>
                        <span>{p.progress}%</span>
                      </div>
                      <Progress value={p.progress} className="h-1.5" />

                      {isActive && (
                        <Link href={getCurrentArticleLink()}>
                          <Button size="sm" className="w-full mt-1">
                            <Play className="h-3 w-3 mr-1" /> 继续学习
                          </Button>
                        </Link>
                      )}
                      {p.status === 'unlocked' && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full mt-1 border-amber-400 text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/30"
                          onClick={() => handleStartPath(p.templateId ?? '')}
                        >
                          <Sparkles className="h-3 w-3 mr-1" /> 开始学习
                        </Button>
                      )}
                      {isCompleted && (
                        <div className="flex items-center justify-center gap-1 text-sm text-green-600 dark:text-green-400 mt-1">
                          <Trophy className="h-3.5 w-3.5" />
                          <span>已掌握</span>
                        </div>
                      )}
                    </div>
                  </CardContent>

                  {/* 阶段间的连接箭头（非最后一个） */}
                  {idx < allPaths.length - 1 && (
                    <div className="hidden xl:flex absolute -right-4 top-1/2 -translate-y-1/2 z-10 text-gray-300 dark:text-gray-600">
                      <ChevronRight className="h-6 w-6" />
                    </div>
                  )}
                </Card>
              )
            })}
          </div>
        </div>

        {/* ===== 完成庆祝 ===== */}
        {celebratePathId && (
          <Card className="border-yellow-300 bg-linear-to-br from-yellow-50 to-orange-50 dark:border-yellow-800 dark:from-yellow-950/40 dark:to-orange-950/30">
            <CardContent className="pt-6 text-center space-y-4">
              <Trophy className="h-16 w-16 text-yellow-500 mx-auto animate-bounce" />
              <h3 className="text-2xl font-bold">恭喜完成当前路径！</h3>
              <p className="text-gray-600 dark:text-gray-400">
                你已经掌握了本阶段的所有内容，继续挑战下一个目标吧！
              </p>
              <Button onClick={() => setCelebratePathId(null)} className="mt-2">
                <ArrowRight className="h-4 w-4 mr-2" />
                查看下一阶段
              </Button>
            </CardContent>
          </Card>
        )}

        {/* ===== 路径详情（选中的路径 或 当前活跃路径） ===== */}
        {displayPath && (
          <div className="grid gap-6 lg:grid-cols-3">
            {/* 左侧：课程大纲 */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Badge className={displayPath.status === 'completed' ? 'bg-green-600 text-white' : 'bg-blue-600 text-white'}>
                      阶段 {displayPath.order}
                    </Badge>
                    <div>
                      <CardTitle>{displayPath.title}</CardTitle>
                      <CardDescription className="mt-1">{displayPath.description}</CardDescription>
                    </div>
                    {displayPath.status === 'completed' && (
                      <Badge variant="outline" className="ml-auto text-green-700 border-green-400 dark:text-green-300 dark:border-green-700">
                        <CheckCircle2 className="h-3 w-3 mr-1" /> 已完成
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-sm font-medium">本阶段进度</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {displaySteps.filter(s => s.status === 'completed').length}/{displaySteps.length} 章节
                    </span>
                  </div>
                  <Progress value={displayPath.progress} className="h-2" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    {displaySteps.map((step) => (
                      <div
                        key={step.id}
                        className={`flex items-center gap-4 p-3 rounded-lg border transition-all ${
                          step.status === 'completed'
                            ? 'bg-green-50 border-green-200 dark:bg-green-950/40 dark:border-green-900'
                            : step.status === 'in_progress'
                              ? 'bg-blue-50 border-blue-200 dark:bg-blue-950/40 dark:border-blue-900'
                              : 'bg-gray-50 border-gray-200 dark:bg-muted/30 dark:border-border'
                        } ${step.status === 'locked' ? 'opacity-60' : 'hover:shadow-sm cursor-pointer'}`}
                        onClick={() => {
                          if (step.status !== 'locked') {
                            router.push(getStepArticleLink(step))
                          }
                        }}
                      >
                        <div className="shrink-0">
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
                              <Badge
                                variant="outline"
                                className="bg-blue-100 text-blue-700 text-xs dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-800"
                              >
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
                            {step.status === 'in_progress' && isDisplayActive && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleCompleteStep(displayPath.id, step.id)
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

            {/* 右侧面板 */}
            <div className="space-y-4">
              {/* 快速入口 */}
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

              {/* 已完成的路径列表 */}
              {allPaths.some(p => p.status === 'completed') && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Trophy className="h-4 w-4 text-yellow-500" />
                      已完成路径
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {allPaths
                      .filter(p => p.status === 'completed')
                      .map(p => (
                        <div
                          key={p.id}
                          className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors ${
                            displayPath?.id === p.id
                              ? 'bg-green-100 dark:bg-green-900/40 ring-1 ring-green-400'
                              : 'bg-green-50 dark:bg-green-950/30 hover:bg-green-100 dark:hover:bg-green-900/30'
                          }`}
                          onClick={() => setSelectedPathId(p.id)}
                        >
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                            <span className="text-sm font-medium">{p.title}</span>
                          </div>
                          <Badge variant="outline" className="text-xs text-green-700 dark:text-green-300 border-green-300 dark:border-green-700">
                            {p.steps.length} 章
                          </Badge>
                        </div>
                      ))}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}

        {/* ===== AI 学习推荐 ===== */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-500" />
                AI 学习推荐
              </CardTitle>
              <Button
                size="sm"
                variant="outline"
                onClick={fetchRecommendation}
                disabled={recLoading}
              >
                {recLoading ? (
                  <><Loader2 className="h-3 w-3 mr-1 animate-spin" />分析中...</>
                ) : (
                  <><Sparkles className="h-3 w-3 mr-1" />获取推荐</>
                )}
              </Button>
            </div>
            <CardDescription>基于你的学习进度和能力评估，AI 为你量身定制学习建议</CardDescription>
          </CardHeader>
          {recommendation && (
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm font-medium mb-2">推荐理由</div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{recommendation.reason}</p>
              </div>
              <div>
                <div className="text-sm font-medium mb-2">建议重点领域</div>
                <div className="flex flex-wrap gap-2">
                  {recommendation.focusAreas.map((area, i) => (
                    <Badge key={i} variant="outline" className="bg-purple-50 text-purple-700 dark:bg-purple-950/30 dark:text-purple-300 dark:border-purple-700">
                      {area}
                    </Badge>
                  ))}
                </div>
              </div>
              {recommendation.suggestedTemplateId && (
                <div>
                  <div className="text-sm font-medium mb-2">推荐路径</div>
                  <div className="p-3 rounded-lg border bg-purple-50 dark:bg-purple-950/20 dark:border-purple-800">
                    <span className="font-medium">
                      {allPaths.find(p => p.templateId === recommendation.suggestedTemplateId)?.title ?? recommendation.suggestedTemplateId}
                    </span>
                  </div>
                </div>
              )}
              {recommendation.customSteps && recommendation.customSteps.length > 0 && (
                <div>
                  <div className="text-sm font-medium mb-2">进阶建议</div>
                  <div className="space-y-2">
                    {recommendation.customSteps.map((step, i) => (
                      <div key={i} className="p-3 rounded-lg border dark:border-border">
                        <div className="font-medium text-sm">{step.title}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{step.description}</div>
                        <div className="flex items-center gap-1 mt-1">
                          <Clock className="h-3 w-3 text-gray-400" />
                          <span className="text-xs text-gray-400">{step.duration}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          )}
        </Card>

        {/* 没有活跃路径但有已解锁路径时的引导 */}
        {!activePath && allPaths.some(p => p.status === 'unlocked') && (
          <Card className="border-amber-200 dark:border-amber-800 bg-linear-to-r from-amber-50 to-yellow-50 dark:from-amber-950/40 dark:to-yellow-950/30">
            <CardContent className="pt-6 text-center space-y-3">
              <Sparkles className="h-12 w-12 text-amber-500 mx-auto" />
              <h3 className="text-xl font-bold">新的路径已解锁！</h3>
              <p className="text-gray-600 dark:text-gray-400">
                点击上方阶段卡片中的「开始学习」按钮，开启新的学习旅程。
              </p>
            </CardContent>
          </Card>
        )}

        {/* 全部完成 */}
        {!activePath && !allPaths.some(p => p.status === 'unlocked') && allPaths.length > 0 && allPaths.every(p => p.status === 'completed' || p.status === 'locked') && allPaths.some(p => p.status === 'completed') && (
          <Card className="border-green-200 dark:border-green-800 bg-linear-to-r from-green-50 to-emerald-50 dark:from-green-950/40 dark:to-emerald-950/30">
            <CardContent className="pt-6 text-center space-y-3">
              <div className="flex items-center justify-center gap-2">
                <Trophy className="h-12 w-12 text-yellow-500" />
                <Star className="h-8 w-8 text-yellow-400" />
              </div>
              <h3 className="text-xl font-bold">恭喜你完成了所有学习路径！</h3>
              <p className="text-gray-600 dark:text-gray-400">
                你已经系统掌握了 C++ 的核心知识。可以继续刷题练习或尝试模拟面试来巩固提升。
              </p>
              <div className="flex justify-center gap-3 pt-2">
                <Link href="/practice">
                  <Button>去刷题</Button>
                </Link>
                <Link href="/interview">
                  <Button variant="outline">模拟面试</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  )
}
