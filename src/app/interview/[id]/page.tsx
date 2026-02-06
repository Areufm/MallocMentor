"use client"

import { useState } from 'react'
import { AppLayout } from '@/components/layout/app-layout'
import { ChatWindow } from '@/components/interview/chat-window'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  ChevronLeft, 
  Clock, 
  Target,
  Brain,
  Code,
  MessageSquare,
  Flag
} from 'lucide-react'
import Link from 'next/link'

export default function InterviewSessionPage() {
  const [elapsedTime, setElapsedTime] = useState(1245) // 秒

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <AppLayout>
      <div className="space-y-4">
        {/* 返回按钮 */}
        <Link href="/interview">
          <Button variant="ghost" size="sm">
            <ChevronLeft className="h-4 w-4 mr-1" />
            返回面试列表
          </Button>
        </Link>

        <div className="grid gap-4 lg:grid-cols-4">
          {/* 左侧：聊天窗口 */}
          <div className="lg:col-span-3">
            <Card className="h-[calc(100vh-12rem)]">
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>C++ 智能指针与内存管理</CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="bg-purple-50 text-purple-700">
                        技术面试
                      </Badge>
                      <Badge variant="outline" className="bg-green-50 text-green-700">
                        进行中
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                      <Clock className="h-4 w-4" />
                      <span>{formatTime(elapsedTime)}</span>
                    </div>
                    <Button variant="destructive" size="sm">
                      <Flag className="h-4 w-4 mr-2" />
                      结束面试
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0 h-[calc(100%-5rem)]">
                <ChatWindow />
              </CardContent>
            </Card>
          </div>

          {/* 右侧：面试信息 */}
          <div className="space-y-4">
            {/* 面试进度 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">面试进度</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">问题进度</span>
                    <span className="text-sm font-medium">3/8</span>
                  </div>
                  <Progress value={37.5} />
                </div>

                <div className="space-y-2 pt-2 border-t">
                  <div className="flex items-center gap-2 text-sm">
                    <Target className="h-4 w-4 text-blue-600" />
                    <span className="text-gray-600">预计剩余</span>
                    <span className="font-medium ml-auto">25 分钟</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MessageSquare className="h-4 w-4 text-purple-600" />
                    <span className="text-gray-600">对话轮次</span>
                    <span className="font-medium ml-auto">12 轮</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 考察要点 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">考察要点</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <div className="h-2 w-2 rounded-full bg-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">基础概念</p>
                      <p className="text-xs text-gray-500 mt-0.5">已覆盖</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <div className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">智能指针原理</p>
                      <p className="text-xs text-gray-500 mt-0.5">进行中</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <div className="h-2 w-2 rounded-full bg-gray-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">内存泄漏排查</p>
                      <p className="text-xs text-gray-500 mt-0.5">待考察</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <div className="h-2 w-2 rounded-full bg-gray-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">RAII 机制</p>
                      <p className="text-xs text-gray-500 mt-0.5">待考察</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 实时评估 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">实时评估</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-600">表达能力</span>
                      <span className="text-xs font-medium">85/100</span>
                    </div>
                    <Progress value={85} className="h-1.5" />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-600">技术深度</span>
                      <span className="text-xs font-medium">78/100</span>
                    </div>
                    <Progress value={78} className="h-1.5" />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-600">逻辑思维</span>
                      <span className="text-xs font-medium">82/100</span>
                    </div>
                    <Progress value={82} className="h-1.5" />
                  </div>

                  <div className="pt-3 border-t">
                    <div className="flex items-center gap-2">
                      <Brain className="h-4 w-4 text-purple-600" />
                      <span className="text-sm font-medium">综合得分</span>
                      <span className="text-lg font-bold text-purple-600 ml-auto">82</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 快捷提示 */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-4">
                <div className="flex gap-2">
                  <Code className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-blue-900 mb-1">小提示</p>
                    <p className="text-blue-700 text-xs">
                      回答时可以结合具体代码示例，这样能更好地展示你的理解。
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
