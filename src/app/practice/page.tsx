"use client"

import { useState } from 'react'
import { AppLayout } from '@/components/layout/app-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Filter, Clock, CheckCircle2, Circle } from 'lucide-react'
import Link from 'next/link'

// 模拟题目数据
const problems = [
  {
    id: '1',
    title: '两数之和',
    difficulty: 'Easy',
    category: '数组',
    tags: ['数组', '哈希表'],
    acceptanceRate: 85,
    status: 'completed'
  },
  {
    id: '2',
    title: '链表反转',
    difficulty: 'Easy',
    category: '链表',
    tags: ['链表', '指针'],
    acceptanceRate: 78,
    status: 'completed'
  },
  {
    id: '3',
    title: '智能指针实现',
    difficulty: 'Medium',
    category: '内存管理',
    tags: ['C++', '智能指针', 'RAII'],
    acceptanceRate: 62,
    status: null
  },
  {
    id: '4',
    title: '线程池设计',
    difficulty: 'Hard',
    category: '并发编程',
    tags: ['多线程', 'C++11'],
    acceptanceRate: 45,
    status: null
  },
  {
    id: '5',
    title: '二叉树遍历',
    difficulty: 'Easy',
    category: '数据结构',
    tags: ['树', '递归'],
    acceptanceRate: 82,
    status: 'attempted'
  },
  {
    id: '6',
    title: '内存池实现',
    difficulty: 'Hard',
    category: '内存管理',
    tags: ['内存管理', '性能优化'],
    acceptanceRate: 38,
    status: null
  },
]

const categories = ['全部', '数组', '链表', '树', '内存管理', '并发编程', 'STL']
const difficulties = ['全部', 'Easy', 'Medium', 'Hard']

export default function PracticePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('全部')
  const [selectedDifficulty, setSelectedDifficulty] = useState('全部')

  const filteredProblems = problems.filter(problem => {
    const matchesSearch = problem.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === '全部' || problem.category === selectedCategory
    const matchesDifficulty = selectedDifficulty === '全部' || problem.difficulty === selectedDifficulty
    return matchesSearch && matchesCategory && matchesDifficulty
  })

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800'
      case 'Medium': return 'bg-yellow-100 text-yellow-800'
      case 'Hard': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string | null) => {
    if (status === 'completed') return <CheckCircle2 className="h-5 w-5 text-green-600" />
    if (status === 'attempted') return <Clock className="h-5 w-5 text-yellow-600" />
    return <Circle className="h-5 w-5 text-gray-300" />
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* 头部 */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">代码练习</h1>
          <p className="text-gray-500 mt-1">通过实战题目提升你的编程能力</p>
        </div>

        {/* 统计概览 */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-500">已完成</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2 / {problems.length}</div>
              <div className="mt-2 h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-green-600" style={{ width: `${(2/problems.length)*100}%` }} />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-500">平均通过率</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">81%</div>
              <p className="text-xs text-gray-500 mt-2">高于平均水平 15%</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-500">连续刷题</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">7 天</div>
              <p className="text-xs text-gray-500 mt-2">继续保持！🔥</p>
            </CardContent>
          </Card>
        </div>

        {/* 筛选区域 */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {/* 搜索 */}
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="搜索题目..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* 分类筛选 */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium">分类：</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <Badge
                      key={cat}
                      variant={selectedCategory === cat ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => setSelectedCategory(cat)}
                    >
                      {cat}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* 难度筛选 */}
              <div className="space-y-2">
                <span className="text-sm font-medium">难度：</span>
                <div className="flex flex-wrap gap-2">
                  {difficulties.map((diff) => (
                    <Badge
                      key={diff}
                      variant={selectedDifficulty === diff ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => setSelectedDifficulty(diff)}
                    >
                      {diff}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 题目列表 */}
        <Card>
          <CardHeader>
            <CardTitle>题目列表</CardTitle>
            <CardDescription>共 {filteredProblems.length} 道题目</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {filteredProblems.map((problem) => (
                <Link key={problem.id} href={`/practice/${problem.id}`}>
                  <div className="flex items-center gap-4 p-4 rounded-lg border hover:border-blue-500 hover:bg-blue-50/50 transition-all cursor-pointer">
                    {/* 状态图标 */}
                    <div className="flex-shrink-0">
                      {getStatusIcon(problem.status)}
                    </div>

                    {/* 题目信息 */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium">{problem.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={getDifficultyColor(problem.difficulty)} variant="outline">
                          {problem.difficulty}
                        </Badge>
                        <span className="text-xs text-gray-500">{problem.category}</span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-500">通过率 {problem.acceptanceRate}%</span>
                      </div>
                    </div>

                    {/* 标签 */}
                    <div className="hidden md:flex items-center gap-2 flex-shrink-0">
                      {problem.tags.slice(0, 2).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    {/* 开始按钮 */}
                    <Button size="sm" className="flex-shrink-0">
                      {problem.status === 'completed' ? '再次练习' : '开始'}
                    </Button>
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
