"use client"

import { useState, useEffect } from 'react'
import { AppLayout } from '@/components/layout/app-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Filter, Circle, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { problemApi } from '@/lib/api'

interface ProblemItem {
  id: string
  title: string
  difficulty: string
  category: string
  tags: string[]
}

const difficulties = ['全部', 'Easy', 'Medium', 'Hard']

export default function PracticePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDifficulty, setSelectedDifficulty] = useState('全部')
  const [problems, setProblems] = useState<ProblemItem[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    async function loadProblems() {
      setLoading(true)
      try {
        const params: Record<string, string | number> = { page: 1, pageSize: 50 }
        if (selectedDifficulty !== '全部') params.difficulty = selectedDifficulty
        if (searchQuery) params.search = searchQuery

        const res = await problemApi.getList(params as Parameters<typeof problemApi.getList>[0])
        if (res.success && res.data) {
          setProblems(res.data.data as unknown as ProblemItem[])
          setTotal(res.data.total)
        }
      } catch (err) {
        console.error('Load problems error:', err)
      } finally {
        setLoading(false)
      }
    }
    loadProblems()
  }, [selectedDifficulty, searchQuery])

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
        <div>
          <h1 className="text-3xl font-bold tracking-tight">代码练习</h1>
          <p className="text-gray-500 mt-1">通过实战题目提升你的编程能力</p>
        </div>

        {/* 筛选区域 */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="搜索题目..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium">难度：</span>
                </div>
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
            <CardDescription>共 {total} 道题目</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : problems.length === 0 ? (
              <p className="text-center text-gray-500 py-12">暂无题目</p>
            ) : (
              <div className="space-y-2">
                {problems.map((problem) => (
                  <Link key={problem.id} href={`/practice/${problem.id}`}>
                    <div className="flex items-center gap-4 p-4 rounded-lg border hover:border-blue-500 hover:bg-blue-50/50 transition-all cursor-pointer">
                      <div className="flex-shrink-0">
                        <Circle className="h-5 w-5 text-gray-300" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium">{problem.title}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={getDifficultyColor(problem.difficulty)} variant="outline">
                            {problem.difficulty}
                          </Badge>
                          <span className="text-xs text-gray-500">{problem.category}</span>
                        </div>
                      </div>
                      <div className="hidden md:flex items-center gap-2 flex-shrink-0">
                        {problem.tags.slice(0, 2).map((tag: string) => (
                          <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                        ))}
                      </div>
                      <Button size="sm" className="flex-shrink-0">开始</Button>
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
