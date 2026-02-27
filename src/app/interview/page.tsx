"use client"

import { useState, useEffect } from 'react'
import { AppLayout } from '@/components/layout/app-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  MessageSquare, 
  Clock, 
  TrendingUp,
  Play,
  Plus
} from 'lucide-react'
import Link from 'next/link'
import { interviewApi } from '@/lib/api'
import type { InterviewSession, InterviewTemplate, InterviewStats } from '@/types/api'

export default function InterviewPage() {
  const [sessions, setSessions] = useState<InterviewSession[]>([])
  const [templates, setTemplates] = useState<InterviewTemplate[]>([])
  const [stats, setStats] = useState<InterviewStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sessionsRes, templatesRes, statsRes] = await Promise.all([
          interviewApi.getList(),
          interviewApi.getTemplates(),
          interviewApi.getStats(),
        ])

        if (sessionsRes.success && sessionsRes.data) {
          setSessions(sessionsRes.data)
        }
        if (templatesRes.success && templatesRes.data) {
          setTemplates(templatesRes.data)
        }
        if (statsRes.success && statsRes.data) {
          setStats(statsRes.data)
        }
      } catch (err) {
        console.error('Interview page fetch error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy':   return 'bg-green-100 text-green-800'
      case 'Medium': return 'bg-yellow-100 text-yellow-800'
      case 'Hard':   return 'bg-red-100 text-red-800'
      default:       return 'bg-gray-100 text-gray-800'
    }
  }

  /** 将 ISO 日期字符串格式化为 YYYY-MM-DD */
  const formatDate = (dateString: string) =>
    new Date(dateString).toISOString().slice(0, 10)

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* 头部 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">模拟面试</h1>
            <p className="text-gray-500 mt-1">与 AI 面试官进行真实的技术面试模拟</p>
          </div>
          <Link href="/interview/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              开始新面试
            </Button>
          </Link>
        </div>

        {/* 统计卡片 */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-500">完成面试</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-8 w-20 bg-gray-100 rounded animate-pulse" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{stats?.completedCount ?? 0} 次</div>
                  <p className="text-xs text-gray-500 mt-1">
                    累计时长 {stats?.totalDurationHours ?? 0} 小时
                  </p>
                </>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-500">平均分数</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-8 w-20 bg-gray-100 rounded animate-pulse" />
              ) : (
                <>
                  <div className="flex items-baseline gap-2">
                    <div className="text-2xl font-bold">{stats?.averageScore ?? '--'}</div>
                    {stats && stats.scoreTrend > 0 && (
                      <>
                        <TrendingUp className="h-4 w-4 text-green-600" />
                        <span className="text-sm text-green-600">+{stats.scoreTrend}</span>
                      </>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">较上周提升</p>
                </>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-500">强项领域</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-8 w-20 bg-gray-100 rounded animate-pulse" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{stats?.topDomain ?? '--'}</div>
                  <p className="text-xs text-gray-500 mt-1">
                    平均得分 {stats?.topDomainScore ?? '--'} 分
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 面试模板 */}
        <div>
          <h2 className="text-xl font-semibold mb-4">面试模板</h2>
          {loading ? (
            <div className="grid gap-4 md:grid-cols-2">
              {[1, 2, 3, 4].map(i => (
                <Card key={i}>
                  <CardHeader>
                    <div className="h-5 bg-gray-100 rounded animate-pulse w-1/2 mb-2" />
                    <div className="h-4 bg-gray-100 rounded animate-pulse w-full" />
                  </CardHeader>
                  <CardContent>
                    <div className="h-9 bg-gray-100 rounded animate-pulse" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {templates.map((template) => (
                <Card key={template.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <CardTitle>{template.title}</CardTitle>
                        <CardDescription>{template.description}</CardDescription>
                      </div>
                      <Badge className={getDifficultyColor(template.difficulty)} variant="outline">
                        {template.difficulty}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="h-4 w-4" />
                        <span>{template.estimatedTime}</span>
                      </div>
                      
                      <div className="flex flex-wrap gap-1">
                        {template.topics.map((topic) => (
                          <Badge key={topic} variant="secondary" className="text-xs">
                            {topic}
                          </Badge>
                        ))}
                      </div>

                      <Link href={`/interview/new?template=${template.id}`}>
                        <Button className="w-full">
                          <Play className="h-4 w-4 mr-2" />
                          开始面试
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* 历史记录 */}
        <Card>
          <CardHeader>
            <CardTitle>面试历史</CardTitle>
            <CardDescription>查看你的面试记录和表现</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex items-center gap-4 p-4 rounded-lg border">
                    <div className="h-11 w-11 bg-gray-100 rounded-lg animate-pulse" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-100 rounded animate-pulse w-1/2" />
                      <div className="h-3 bg-gray-100 rounded animate-pulse w-3/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {sessions.map((session) => (
                  <Link key={session.id} href={`/interview/${session.id}`}>
                    <div className="flex items-center gap-4 p-4 rounded-lg border hover:border-blue-500 hover:bg-blue-50/50 transition-all cursor-pointer">
                      <div className={`p-3 rounded-lg ${
                        session.type === 'technical' ? 'bg-purple-100' : 'bg-blue-100'
                      }`}>
                        <MessageSquare className={`h-5 w-5 ${
                          session.type === 'technical' ? 'text-purple-600' : 'text-blue-600'
                        }`} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{session.title}</h3>
                          {session.status === 'active' && (
                            <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                              进行中
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                          <span>{formatDate(session.createdAt)}</span>
                          {session.duration && (
                            <>
                              <span>•</span>
                              <span>{session.duration}</span>
                            </>
                          )}
                          <span>•</span>
                          <span>{session.messages.length} 条对话</span>
                        </div>
                      </div>

                      {session.evaluation?.overallScore != null && (
                        <div className="text-right shrink-0">
                          <div className="text-2xl font-bold text-blue-600">
                            {session.evaluation.overallScore}
                          </div>
                          <div className="text-xs text-gray-500">分</div>
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
