"use client"

import { useState } from 'react'
import { AppLayout } from '@/components/layout/app-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Search, 
  BookOpen, 
  FileText,
  Star,
  TrendingUp,
  MessageCircle
} from 'lucide-react'

// 模拟知识库数据
const categories = [
  { id: 'all', name: '全部', count: 156 },
  { id: 'basics', name: '基础语法', count: 42 },
  { id: 'pointer', name: '指针与内存', count: 38 },
  { id: 'oop', name: '面向对象', count: 28 },
  { id: 'stl', name: 'STL', count: 31 },
  { id: 'concurrency', name: '并发编程', count: 17 },
]

const knowledgeArticles = [
  {
    id: '1',
    title: 'C++ 智能指针完全指南',
    category: 'pointer',
    description: '深入理解 unique_ptr、shared_ptr 和 weak_ptr 的使用场景和实现原理',
    views: 1523,
    likes: 234,
    comments: 45,
    difficulty: 'Medium',
    tags: ['智能指针', 'RAII', '内存管理'],
    lastUpdated: '2024-02-05'
  },
  {
    id: '2',
    title: 'STL 容器底层实现原理',
    category: 'stl',
    description: 'vector、list、map 等常用容器的内部结构和性能分析',
    views: 2103,
    likes: 312,
    comments: 67,
    difficulty: 'Medium',
    tags: ['STL', '容器', '数据结构'],
    lastUpdated: '2024-02-04'
  },
  {
    id: '3',
    title: '多线程编程入门',
    category: 'concurrency',
    description: 'C++11 中的 thread、mutex、condition_variable 使用指南',
    views: 1876,
    likes: 289,
    comments: 52,
    difficulty: 'Hard',
    tags: ['多线程', 'C++11', '并发'],
    lastUpdated: '2024-02-03'
  },
  {
    id: '4',
    title: '虚函数与多态性',
    category: 'oop',
    description: '理解虚函数表、虚函数指针和动态绑定机制',
    views: 1654,
    likes: 201,
    comments: 38,
    difficulty: 'Medium',
    tags: ['面向对象', '多态', '虚函数'],
    lastUpdated: '2024-02-02'
  },
  {
    id: '5',
    title: '左值、右值与移动语义',
    category: 'basics',
    description: 'C++11 引入的右值引用和完美转发',
    views: 1432,
    likes: 187,
    comments: 29,
    difficulty: 'Hard',
    tags: ['C++11', '右值引用', '移动语义'],
    lastUpdated: '2024-02-01'
  },
  {
    id: '6',
    title: '内存对齐与结构体大小',
    category: 'pointer',
    description: '深入理解内存对齐规则和编译器优化',
    views: 987,
    likes: 143,
    comments: 21,
    difficulty: 'Easy',
    tags: ['内存', '结构体', '优化'],
    lastUpdated: '2024-01-31'
  },
]

const hotTopics = [
  { name: 'C++20 新特性', count: 234 },
  { name: '智能指针', count: 189 },
  { name: 'STL 源码', count: 156 },
  { name: '内存泄漏', count: 142 },
  { name: '模板编程', count: 128 },
]

export default function KnowledgePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  const filteredArticles = knowledgeArticles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         article.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory
    return matchesSearch && matchesCategory
  })

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
          {/* 左侧：分类和热门话题 */}
          <div className="space-y-4">
            {/* 分类 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">分类</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-blue-100 text-blue-700 font-medium'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    <span>{category.name}</span>
                    <span className="text-xs text-gray-500">{category.count}</span>
                  </button>
                ))}
              </CardContent>
            </Card>

            {/* 热门话题 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  热门话题
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {hotTopics.map((topic, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className={`text-xs font-bold ${
                      index < 3 ? 'text-red-500' : 'text-gray-400'
                    }`}>
                      #{index + 1}
                    </span>
                    <button className="flex-1 text-left text-sm hover:text-blue-600 transition-colors">
                      {topic.name}
                    </button>
                    <span className="text-xs text-gray-400">{topic.count}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* AI 助手 */}
            <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
              <CardContent className="pt-6">
                <div className="text-center space-y-3">
                  <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center mx-auto">
                    <MessageCircle className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-purple-900">AI 知识助手</h3>
                    <p className="text-xs text-purple-700 mt-1">
                      有问题？随时问我
                    </p>
                  </div>
                  <Button size="sm" className="w-full bg-purple-600 hover:bg-purple-700">
                    开始对话
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 右侧：文章列表 */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>知识文章</CardTitle>
                <CardDescription>
                  共找到 {filteredArticles.length} 篇文章
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredArticles.map((article) => (
                    <div
                      key={article.id}
                      className="p-4 border rounded-lg hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                          {article.title}
                        </h3>
                        <Badge className={getDifficultyColor(article.difficulty)} variant="outline">
                          {article.difficulty}
                        </Badge>
                      </div>

                      <p className="text-sm text-gray-600 mb-3">
                        {article.description}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex flex-wrap gap-1">
                          {article.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
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
                          <span className="flex items-center gap-1">
                            <MessageCircle className="h-3 w-3" />
                            {article.comments}
                          </span>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t text-xs text-gray-400">
                        最后更新：{article.lastUpdated}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
