"use client"

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

// 模拟面试会话数据
const interviewSessions = [
  {
    id: '1',
    title: 'C++ 智能指针与内存管理',
    type: 'technical',
    status: 'completed',
    duration: '45分钟',
    score: 85,
    date: '2024-02-05',
    messages: 15
  },
  {
    id: '2',
    title: '多线程与并发编程',
    type: 'technical',
    status: 'completed',
    duration: '38分钟',
    score: 78,
    date: '2024-02-03',
    messages: 12
  },
  {
    id: '3',
    title: 'STL 容器底层原理',
    type: 'technical',
    status: 'in_progress',
    duration: '12分钟',
    score: null,
    date: '2024-02-06',
    messages: 5
  },
]

const interviewTemplates = [
  {
    id: 'cpp-basics',
    title: 'C++ 基础面试',
    description: '涵盖 C++ 基础语法、类与对象、继承多态等核心概念',
    difficulty: 'Easy',
    estimatedTime: '30-45分钟',
    topics: ['语法基础', '面向对象', '继承多态']
  },
  {
    id: 'memory-management',
    title: '内存管理专项',
    description: '深入考察指针、内存分配、智能指针、RAII等内存相关知识',
    difficulty: 'Medium',
    estimatedTime: '40-60分钟',
    topics: ['指针', '智能指针', 'RAII', '内存泄漏']
  },
  {
    id: 'stl-advanced',
    title: 'STL 深度剖析',
    description: 'STL 容器底层实现、迭代器失效、算法复杂度分析',
    difficulty: 'Medium',
    estimatedTime: '45-60分钟',
    topics: ['容器', '迭代器', '算法', '性能优化']
  },
  {
    id: 'concurrency',
    title: '并发编程挑战',
    description: '多线程、线程同步、死锁、条件变量、原子操作等高级主题',
    difficulty: 'Hard',
    estimatedTime: '60-90分钟',
    topics: ['多线程', '互斥锁', '条件变量', '原子操作']
  },
]

export default function InterviewPage() {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800'
      case 'Medium': return 'bg-yellow-100 text-yellow-800'
      case 'Hard': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

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
              <div className="text-2xl font-bold">8 次</div>
              <p className="text-xs text-gray-500 mt-1">累计时长 6.5 小时</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-500">平均分数</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <div className="text-2xl font-bold">82</div>
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-600">+5</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">较上周提升</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-500">强项领域</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">STL</div>
              <p className="text-xs text-gray-500 mt-1">平均得分 88 分</p>
            </CardContent>
          </Card>
        </div>

        {/* 面试模板 */}
        <div>
          <h2 className="text-xl font-semibold mb-4">面试模板</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {interviewTemplates.map((template) => (
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
        </div>

        {/* 历史记录 */}
        <Card>
          <CardHeader>
            <CardTitle>面试历史</CardTitle>
            <CardDescription>查看你的面试记录和表现</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {interviewSessions.map((session) => (
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
                        {session.status === 'in_progress' && (
                          <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                            进行中
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                        <span>{session.date}</span>
                        <span>•</span>
                        <span>{session.duration}</span>
                        <span>•</span>
                        <span>{session.messages} 条对话</span>
                      </div>
                    </div>

                    {session.score && (
                      <div className="text-right">
                        <div className="text-2xl font-bold text-blue-600">{session.score}</div>
                        <div className="text-xs text-gray-500">分</div>
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
