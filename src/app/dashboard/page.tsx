"use client"

import { AppLayout } from '@/components/layout/app-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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

// 模拟数据
const radarData = [
  { subject: '基础语法', A: 85, fullMark: 100 },
  { subject: '内存管理', A: 65, fullMark: 100 },
  { subject: '数据结构', A: 90, fullMark: 100 },
  { subject: '面向对象', A: 75, fullMark: 100 },
  { subject: 'STL使用', A: 80, fullMark: 100 },
  { subject: '系统编程', A: 60, fullMark: 100 },
]

const stats = [
  { 
    label: '已完成题目', 
    value: '48', 
    change: '+12%', 
    icon: Code,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50'
  },
  { 
    label: '学习时长', 
    value: '127h', 
    change: '+5h', 
    icon: Clock,
    color: 'text-green-600',
    bgColor: 'bg-green-50'
  },
  { 
    label: '通过率', 
    value: '78%', 
    change: '+8%', 
    icon: TrendingUp,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50'
  },
  { 
    label: '获得成就', 
    value: '15', 
    change: '+3', 
    icon: Trophy,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50'
  },
]

const recentActivities = [
  { 
    title: '完成了《链表反转》', 
    description: '通过率：100%，用时：15分钟',
    time: '2小时前',
    type: 'success'
  },
  { 
    title: '参与了模拟面试', 
    description: '技术面试 - C++并发编程',
    time: '5小时前',
    type: 'interview'
  },
  { 
    title: '学习了新知识', 
    description: '智能指针与RAII机制',
    time: '1天前',
    type: 'learn'
  },
]

const learningGoals = [
  { title: '掌握智能指针', progress: 75, total: 10, completed: 7 },
  { title: 'STL容器深入', progress: 40, total: 15, completed: 6 },
  { title: '多线程编程', progress: 20, total: 20, completed: 4 },
]

export default function DashboardPage() {
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
          {stats.map((stat) => (
            <Card key={stat.label}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
                <div className={`${stat.bgColor} p-2 rounded-lg`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-gray-500 mt-1">
                  <span className="text-green-600">{stat.change}</span> 较上周
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* 能力雷达图 */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>能力雷达图</CardTitle>
              <CardDescription>全方位评估你的 C/C++ 技能</CardDescription>
            </CardHeader>
            <CardContent>
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
              <div className="mt-4 grid grid-cols-2 gap-2">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-blue-600" />
                  <span className="text-sm">综合评分：<strong>76/100</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm">提升最快：数据结构</span>
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
              {learningGoals.map((goal) => (
                <div key={goal.title} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{goal.title}</span>
                    <span className="text-xs text-gray-500">
                      {goal.completed}/{goal.total} 完成
                    </span>
                  </div>
                  <Progress value={goal.progress} className="h-2" />
                </div>
              ))}
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
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-start gap-4 pb-4 last:pb-0 border-b last:border-0">
                  <div className={`mt-1 h-2 w-2 rounded-full ${
                    activity.type === 'success' ? 'bg-green-500' :
                    activity.type === 'interview' ? 'bg-purple-500' :
                    'bg-blue-500'
                  }`} />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">{activity.title}</p>
                    <p className="text-xs text-gray-500">{activity.description}</p>
                  </div>
                  <span className="text-xs text-gray-400">{activity.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
