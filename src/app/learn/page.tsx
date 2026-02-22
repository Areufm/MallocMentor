"use client"

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
  Clock
} from 'lucide-react'

// 模拟学习路径数据
const learningPaths = [
  {
    id: '1',
    title: 'C++ 从入门到精通',
    description: '系统学习 C++ 编程语言，掌握核心概念和最佳实践',
    level: 'beginner',
    totalSteps: 30,
    completedSteps: 12,
    estimatedHours: 40,
    enrolled: true,
    progress: 40
  },
  {
    id: '2',
    title: '现代 C++ 高级特性',
    description: '深入学习 C++11/14/17/20 的新特性和高级编程技巧',
    level: 'advanced',
    totalSteps: 25,
    completedSteps: 0,
    estimatedHours: 35,
    enrolled: false,
    progress: 0
  },
  {
    id: '3',
    title: '数据结构与算法',
    description: '使用 C++ 实现经典数据结构和算法',
    level: 'intermediate',
    totalSteps: 40,
    completedSteps: 15,
    estimatedHours: 50,
    enrolled: true,
    progress: 37.5
  },
]

const currentPath = learningPaths[0]

const pathSteps = [
  { id: 1, title: 'C++ 简介与环境搭建', status: 'completed', duration: '30分钟' },
  { id: 2, title: '基本数据类型和变量', status: 'completed', duration: '45分钟' },
  { id: 3, title: '控制流语句', status: 'completed', duration: '60分钟' },
  { id: 4, title: '函数与参数传递', status: 'completed', duration: '90分钟' },
  { id: 5, title: '指针基础', status: 'in_progress', duration: '120分钟' },
  { id: 6, title: '引用与指针对比', status: 'locked', duration: '60分钟' },
  { id: 7, title: '数组与字符串', status: 'locked', duration: '90分钟' },
  { id: 8, title: '结构体与联合体', status: 'locked', duration: '75分钟' },
]

export default function LearnPage() {
  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800'
      case 'intermediate': return 'bg-yellow-100 text-yellow-800'
      case 'advanced': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getLevelText = (level: string) => {
    switch (level) {
      case 'beginner': return '入门'
      case 'intermediate': return '进阶'
      case 'advanced': return '高级'
      default: return '未知'
    }
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* 头部 */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">学习路径</h1>
          <p className="text-gray-500 mt-1">系统化学习 C/C++ 编程知识</p>
        </div>

        {/* 当前学习路径 */}
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
                    {currentPath.completedSteps}/{currentPath.totalSteps} 章节
                  </span>
                </div>
                <Progress value={currentPath.progress} className="h-2" />
              </div>

              <div className="grid grid-cols-3 gap-4 pt-2">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {currentPath.completedSteps}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">已完成</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {currentPath.totalSteps - currentPath.completedSteps}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">待学习</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {currentPath.estimatedHours}h
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">预计时长</div>
                </div>
              </div>

              <Button className="w-full" size="lg">
                <Play className="h-4 w-4 mr-2" />
                继续学习
              </Button>
            </div>
          </CardContent>
        </Card>

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
                  {pathSteps.map((step, index) => (
                    <div
                      key={step.id}
                      className={`flex items-center gap-4 p-3 rounded-lg border transition-all ${
                        step.status === 'completed' ? 'bg-green-50 border-green-200 dark:bg-green-950/40 dark:border-green-900' :
                        step.status === 'in_progress' ? 'bg-blue-50 border-blue-200 dark:bg-blue-950/40 dark:border-blue-900' :
                        'bg-gray-50 border-gray-200 dark:bg-muted/30 dark:border-border'
                      } ${step.status === 'locked' ? 'opacity-60' : 'hover:shadow-sm cursor-pointer'}`}
                    >
                      {/* 状态图标 */}
                      <div className="flex-shrink-0">
                        {step.status === 'completed' ? (
                          <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
                        ) : step.status === 'in_progress' ? (
                          <Circle className="h-6 w-6 text-blue-600 dark:text-blue-400 animate-pulse" />
                        ) : (
                          <Lock className="h-6 w-6 text-gray-400 dark:text-gray-500" />
                        )}
                      </div>

                      {/* 步骤信息 */}
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

                      {/* 操作按钮 */}
                      {step.status !== 'locked' && (
                        <Button 
                          size="sm" 
                          variant={step.status === 'in_progress' ? 'default' : 'outline'}
                        >
                          {step.status === 'completed' ? '复习' : '继续'}
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 右侧：其他学习路径 */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">更多学习路径</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {learningPaths.slice(1).map((path) => (
                  <div key={path.id} className="p-3 border rounded-lg hover:border-blue-300 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-sm">{path.title}</h4>
                      <Badge className={getLevelColor(path.level)} variant="outline">
                        {getLevelText(path.level)}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600 mb-3">{path.description}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{path.totalSteps} 章节</span>
                      <span>{path.estimatedHours}h</span>
                    </div>
                    {!path.enrolled && (
                      <Button size="sm" variant="outline" className="w-full mt-3">
                        开始学习
                      </Button>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* 学习统计 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">学习统计</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">本周学习</span>
                  <span className="font-semibold">8.5 小时</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">连续天数</span>
                  <span className="font-semibold">12 天 🔥</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">完成课程</span>
                  <span className="font-semibold">3 门</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">获得徽章</span>
                  <span className="font-semibold">15 个</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
