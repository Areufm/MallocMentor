"use client"

import { useState, useEffect } from 'react'
import { AppLayout } from '@/components/layout/app-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { 
  TrendingUp, 
  Code, 
  Trophy, 
  Clock,
  Target,
  Zap
} from 'lucide-react'
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Legend } from 'recharts'
import { userApi, capabilityApi, activityApi, learningPathApi } from '@/lib/api'
import type { UserStats, CapabilityRadar, ActivityLog, LearningPath } from '@/types/api'

// 雷达图数据项类型
interface RadarDataItem {
  subject: string
  A: number
  fullMark: number
}

// 统计卡片配置（图标、颜色等 UI 属性保留在前端）
const STAT_CONFIG = [
  { key: 'problemsCompleted' as const, label: '已完成题目', unit: '', icon: Code, color: 'text-blue-600', bgColor: 'bg-blue-50' },
  { key: 'studyHours' as const,        label: '学习时长',   unit: 'h', icon: Clock, color: 'text-green-600', bgColor: 'bg-green-50' },
  { key: 'passRate' as const,          label: '通过率',     unit: '%', icon: TrendingUp, color: 'text-purple-600', bgColor: 'bg-purple-50' },
  { key: 'achievements' as const,      label: '获得成就',   unit: '', icon: Trophy, color: 'text-yellow-600', bgColor: 'bg-yellow-50' },
]

/** 将 CapabilityRadar 对象转换为雷达图所需格式 */
function toRadarData(radar: CapabilityRadar): RadarDataItem[] {
  return [
    { subject: '基础语法', A: radar.basicSyntax,        fullMark: 100 },
    { subject: '内存管理', A: radar.memoryManagement,   fullMark: 100 },
    { subject: '数据结构', A: radar.dataStructures,     fullMark: 100 },
    { subject: '面向对象', A: radar.oop,                fullMark: 100 },
    { subject: 'STL使用',  A: radar.stlLibrary,         fullMark: 100 },
    { subject: '系统编程', A: radar.systemProgramming,  fullMark: 100 },
  ]
}

/** 计算雷达图综合评分（六项均值） */
function calcOverallScore(radar: CapabilityRadar): number {
  const values = [
    radar.basicSyntax, radar.memoryManagement, radar.dataStructures,
    radar.oop, radar.stlLibrary, radar.systemProgramming,
  ]
  return Math.round(values.reduce((a, b) => a + b, 0) / values.length)
}

/** 找出雷达图中得分最高的维度 */
function findTopDimension(radar: CapabilityRadar): string {
  const dims = [
    { name: '基础语法', value: radar.basicSyntax },
    { name: '内存管理', value: radar.memoryManagement },
    { name: '数据结构', value: radar.dataStructures },
    { name: '面向对象', value: radar.oop },
    { name: 'STL使用',  value: radar.stlLibrary },
    { name: '系统编程', value: radar.systemProgramming },
  ]
  return dims.reduce((prev, curr) => (curr.value > prev.value ? curr : prev)).name
}

/** 将 ISO 时间字符串转为相对时间描述 */
function formatRelativeTime(dateString: string): string {
  const diffMs = Date.now() - new Date(dateString).getTime()
  const hours = Math.floor(diffMs / 3600000)
  if (hours < 1) return '刚刚'
  if (hours < 24) return `${hours}小时前`
  const days = Math.floor(hours / 24)
  return `${days}天前`
}

/** 将学习路径转换为目标进度格式 */
function toLearningGoal(path: LearningPath) {
  const completed = path.steps.filter(s => s.status === 'completed').length
  return {
    title: path.title,
    progress: path.progress,
    total: path.steps.length,
    completed,
  }
}

export default function DashboardPage() {
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [radarData, setRadarData] = useState<RadarDataItem[]>([])
  const [radarMeta, setRadarMeta] = useState({ overallScore: 0, topDimension: '' })
  const [activities, setActivities] = useState<ActivityLog[]>([])
  const [learningGoals, setLearningGoals] = useState<ReturnType<typeof toLearningGoal>[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, radarRes, activitiesRes, pathsRes] = await Promise.all([
          userApi.getStats(),
          capabilityApi.get(),
          activityApi.getList({ pageSize: 5 }),
          learningPathApi.getList(),
        ])

        if (statsRes.success && statsRes.data) {
          setUserStats(statsRes.data)
        }

        if (radarRes.success && radarRes.data) {
          setRadarData(toRadarData(radarRes.data))
          setRadarMeta({
            overallScore: calcOverallScore(radarRes.data),
            topDimension: findTopDimension(radarRes.data),
          })
        }

        if (activitiesRes.success && activitiesRes.data) {
          setActivities(activitiesRes.data.data)
        }

        if (pathsRes.success && pathsRes.data) {
          setLearningGoals(pathsRes.data.map(toLearningGoal))
        }
      } catch (err) {
        console.error('Dashboard data fetch error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  // 活动类型映射为点颜色样式
  const getActivityDotClass = (type: string) => {
    if (type === 'problem')  return 'bg-green-500'
    if (type === 'interview') return 'bg-purple-500'
    return 'bg-blue-500'
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* 欢迎区域 */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">欢迎回来！</h1>
          <p className="text-gray-500 mt-1">继续你的 C/C++ 学习之旅</p>
        </div>

        {/* 统计卡片 */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {STAT_CONFIG.map((cfg) => {
            const raw = userStats?.[cfg.key] ?? 0
            const displayValue = `${raw}${cfg.unit}`
            return (
              <Card key={cfg.label}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{cfg.label}</CardTitle>
                  <div className={`${cfg.bgColor} p-2 rounded-lg`}>
                    <cfg.icon className={`h-4 w-4 ${cfg.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="h-8 w-16 bg-gray-100 rounded animate-pulse" />
                  ) : (
                    <div className="text-2xl font-bold">{displayValue}</div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* 能力雷达图 */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>能力雷达图</CardTitle>
              <CardDescription>全方位评估你的 C/C++ 技能</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-[300px] bg-gray-50 rounded animate-pulse" />
              ) : (
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="subject" />
                      <PolarRadiusAxis angle={90} domain={[0, 100]} />
                      <Radar 
                        name="能力值" 
                        dataKey="A" 
                        stroke="#8884d8" 
                        fill="#8884d8" 
                        fillOpacity={0.6} 
                      />
                      <Legend />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              )}
              <div className="mt-4 grid grid-cols-2 gap-2">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-blue-600" />
                  <span className="text-sm">
                    综合评分：<strong>{loading ? '--' : `${radarMeta.overallScore}/100`}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm">
                    最强维度：{loading ? '--' : radarMeta.topDimension}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 学习目标 */}
          <Card>
            <CardHeader>
              <CardTitle>学习目标</CardTitle>
              <CardDescription>追踪你的学习进度</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="space-y-2">
                      <div className="h-4 bg-gray-100 rounded animate-pulse w-3/4" />
                      <div className="h-2 bg-gray-100 rounded animate-pulse" />
                    </div>
                  ))}
                </div>
              ) : (
                learningGoals.map((goal) => (
                  <div key={goal.title} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{goal.title}</span>
                      <span className="text-xs text-gray-500">
                        {goal.completed}/{goal.total} 完成
                      </span>
                    </div>
                    <Progress value={goal.progress} className="h-2" />
                  </div>
                ))
              )}
              <div className="pt-4 border-t">
                <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                  查看全部目标 →
                </button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 最近活动 */}
        <Card>
          <CardHeader>
            <CardTitle>最近活动</CardTitle>
            <CardDescription>你的学习动态</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex items-start gap-4 pb-4 border-b last:border-0">
                    <div className="mt-1 h-2 w-2 rounded-full bg-gray-100" />
                    <div className="flex-1 space-y-1">
                      <div className="h-4 bg-gray-100 rounded animate-pulse w-1/2" />
                      <div className="h-3 bg-gray-100 rounded animate-pulse w-3/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {activities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-4 pb-4 last:pb-0 border-b last:border-0">
                    <div className={`mt-1 h-2 w-2 rounded-full ${getActivityDotClass(activity.type)}`} />
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">{activity.title}</p>
                      <p className="text-xs text-gray-500">{activity.description}</p>
                    </div>
                    <span className="text-xs text-gray-400 shrink-0">
                      {formatRelativeTime(activity.createdAt)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
