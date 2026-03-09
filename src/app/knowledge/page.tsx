"use client"

import { useState, useEffect } from 'react'
import { AppLayout } from '@/components/layout/app-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Search,
  BookOpen,
  Star,
  TrendingUp,
  Loader2,
} from 'lucide-react'
import Link from 'next/link'
import { knowledgeApi } from '@/lib/api'

interface ArticleItem {
  id: string
  title: string
  slug: string
  category: string
  summary: string
  difficulty: string
  tags: string[]
  views: number
  likes: number
  author: string
  estimatedTime?: number
  updatedAt: string
}

interface CategoryItem {
  id: string
  name: string
  label: string
  articleCount: number
}

export default function KnowledgePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [articles, setArticles] = useState<ArticleItem[]>([])
  const [categories, setCategories] = useState<CategoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await knowledgeApi.getCategories()
        if (res.success && res.data) {
          setCategories(res.data as unknown as CategoryItem[])
        }
      } catch (err) {
        console.error('Load categories error:', err)
      }
    }
    loadCategories()
  }, [])

  useEffect(() => {
    async function loadArticles() {
      setLoading(true)
      try {
        const params: Record<string, string | number> = { page: 1, pageSize: 50 }
        if (selectedCategory !== 'all') params.category = selectedCategory
        if (searchQuery) params.search = searchQuery
        const res = await knowledgeApi.getList(params as Parameters<typeof knowledgeApi.getList>[0])
        if (res.success && res.data) {
          setArticles(res.data.data as unknown as ArticleItem[])
          setTotal(res.data.total)
        }
      } catch (err) {
        console.error('Load articles error:', err)
      } finally {
        setLoading(false)
      }
    }
    loadArticles()
  }, [selectedCategory, searchQuery])

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
          <h1 className="text-3xl font-bold tracking-tight">知识库</h1>
          <p className="text-gray-500 mt-1">深入学习 C/C++ 核心概念和最佳实践</p>
        </div>

        {/* 搜索框 */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <Input
                placeholder="搜索知识点、概念、关键词..."
                className="pl-10 h-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-4">
          {/* 左侧：分类 */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">分类</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                {categories.map((category) => (
                  <button
                    key={category.name}
                    onClick={() => setSelectedCategory(category.name)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                      selectedCategory === category.name
                        ? 'bg-blue-100 text-blue-700 font-medium'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    <span>{category.label}</span>
                    <span className="text-xs text-gray-500">{category.articleCount}</span>
                  </button>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  热门话题
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {['智能指针', 'STL 容器', '内存管理', '多线程', '模板编程'].map((topic, index) => (
                  <div key={topic} className="flex items-center gap-2">
                    <span className={`text-xs font-bold ${index < 3 ? 'text-red-500' : 'text-gray-400'}`}>
                      #{index + 1}
                    </span>
                    <button
                      className="flex-1 text-left text-sm hover:text-blue-600 transition-colors"
                      onClick={() => setSearchQuery(topic)}
                    >
                      {topic}
                    </button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* 右侧：文章列表 */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>知识文章</CardTitle>
                <CardDescription>
                  共 {total} 篇文章
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                  </div>
                ) : articles.length === 0 ? (
                  <p className="text-center text-gray-500 py-12">暂无文章</p>
                ) : (
                  <div className="space-y-4">
                    {articles.map((article) => (
                      <Link key={article.id} href={`/knowledge/${article.id}`}>
                        <div className="p-4 border rounded-lg hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                              {article.title}
                            </h3>
                            <Badge className={getDifficultyColor(article.difficulty)} variant="outline">
                              {article.difficulty}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{article.summary}</p>
                          <div className="flex items-center justify-between">
                            <div className="flex flex-wrap gap-1">
                              {article.tags.map((tag: string) => (
                                <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                              ))}
                            </div>
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <BookOpen className="h-3 w-3" />
                                {article.views}
                              </span>
                              <span className="flex items-center gap-1">
                                <Star className="h-3 w-3" />
                                {article.likes}
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
