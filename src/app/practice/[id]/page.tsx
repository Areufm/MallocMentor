"use client"

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { AppLayout } from '@/components/layout/app-layout'
import { MonacoEditor } from '@/components/code-editor/monaco-editor'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Play,
  Send,
  RotateCcw,
  ChevronLeft,
  Lightbulb,
  Loader2,
} from 'lucide-react'
import Link from 'next/link'
import { problemApi, codeApi } from '@/lib/api'

const defaultTemplate = `#include <iostream>
using namespace std;

int main() {
    // 请在这里编写你的代码

    return 0;
}`

interface ProblemData {
  id: string
  title: string
  description: string
  difficulty: string
  category: string
  tags: string[]
  testCases: Array<{ input: string; expectedOutput: string; explanation?: string }>
  hints: string[]
}

export default function ProblemDetailPage() {
  const params = useParams()
  const id = params.id as string

  const [problem, setProblem] = useState<ProblemData | null>(null)
  const [loading, setLoading] = useState(true)
  const [code, setCode] = useState(defaultTemplate)
  const [isRunning, setIsRunning] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [runResult, setRunResult] = useState<string | null>(null)
  const [reviewResult, setReviewResult] = useState<string | null>(null)
  const [showHints, setShowHints] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const res = await problemApi.getById(id)
        if (res.success && res.data) {
          setProblem(res.data as unknown as ProblemData)
        }
      } catch (err) {
        console.error('Load problem error:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  const handleRun = async () => {
    setIsRunning(true)
    setRunResult(null)
    try {
      const res = await codeApi.run({ code, language: 'cpp' })
      if (res.success && res.data) {
        setRunResult(res.data.output)
      }
    } catch (err) {
      setRunResult('运行失败，请稍后重试')
    } finally {
      setIsRunning(false)
    }
  }

  const handleSubmit = async () => {
    if (!problem) return
    setIsSubmitting(true)
    setReviewResult(null)
    try {
      const res = await codeApi.submit({ problemId: problem.id, code, language: 'cpp' })
      if (res.success && res.data) {
        const data = res.data as unknown as { aiReview?: string; status?: string }
        setReviewResult(data.aiReview || `提交状态：${data.status}`)
      }
    } catch (err) {
      setReviewResult('提交失败，请稍后重试')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReset = () => {
    setCode(defaultTemplate)
    setRunResult(null)
    setReviewResult(null)
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      </AppLayout>
    )
  }

  if (!problem) {
    return (
      <AppLayout>
        <div className="text-center py-20">
          <p className="text-gray-500 mb-4">题目不存在</p>
          <Link href="/practice"><Button>返回题目列表</Button></Link>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="space-y-4">
        <Link href="/practice">
          <Button variant="ghost" size="sm">
            <ChevronLeft className="h-4 w-4 mr-1" />
            返回题目列表
          </Button>
        </Link>

        <div className="grid gap-4 lg:grid-cols-2">
          {/* 左侧：题目描述 */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <div className="space-y-2">
                  <CardTitle className="text-2xl">{problem.title}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge className={
                      problem.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                      problem.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }>
                      {problem.difficulty}
                    </Badge>
                    {problem.tags.map((tag: string) => (
                      <Badge key={tag} variant="secondary">{tag}</Badge>
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">题目描述</h3>
                  <p className="text-sm text-gray-600 whitespace-pre-line">{problem.description}</p>
                </div>

                {problem.testCases.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">示例</h3>
                    {problem.testCases.map((tc, i) => (
                      <div key={i} className="mb-3 p-3 bg-gray-50 rounded-lg text-sm">
                        <div className="space-y-1">
                          <div><strong>输入：</strong>{tc.input}</div>
                          <div><strong>输出：</strong>{tc.expectedOutput}</div>
                          {tc.explanation && <div className="text-gray-600">{tc.explanation}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {problem.hints.length > 0 && (
                  <div>
                    <Button variant="outline" size="sm" onClick={() => setShowHints(!showHints)}>
                      <Lightbulb className="h-4 w-4 mr-2" />
                      {showHints ? '隐藏提示' : '查看提示'}
                    </Button>
                    {showHints && (
                      <ul className="mt-2 space-y-1 text-sm text-gray-600">
                        {problem.hints.map((hint: string, i: number) => (
                          <li key={i} className="flex gap-2">
                            <span className="text-blue-600 flex-shrink-0">*</span>
                            {hint}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 运行结果 */}
            {runResult && (
              <Card>
                <CardHeader><CardTitle className="text-base">运行结果</CardTitle></CardHeader>
                <CardContent>
                  <pre className="text-sm bg-gray-900 text-gray-100 p-3 rounded-lg overflow-auto whitespace-pre-wrap">
                    {runResult}
                  </pre>
                </CardContent>
              </Card>
            )}

            {/* AI 审查结果 */}
            {reviewResult && (
              <Card>
                <CardHeader><CardTitle className="text-base">AI 代码审查</CardTitle></CardHeader>
                <CardContent>
                  <div className="text-sm whitespace-pre-wrap bg-blue-50 p-3 rounded-lg">
                    {reviewResult}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* 右侧：代码编辑器 */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>代码编辑器</CardTitle>
                  <Button variant="ghost" size="sm" onClick={handleReset}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    重置代码
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <MonacoEditor
                  value={code}
                  onChange={(value) => setCode(value || '')}
                  language="cpp"
                  height="500px"
                />
              </CardContent>
            </Card>

            <div className="flex gap-2">
              <Button onClick={handleRun} disabled={isRunning} variant="outline" className="flex-1">
                {isRunning ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" />运行中...</>
                ) : (
                  <><Play className="h-4 w-4 mr-2" />运行代码</>
                )}
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting} className="flex-1">
                {isSubmitting ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" />提交中...</>
                ) : (
                  <><Send className="h-4 w-4 mr-2" />提交并审查</>
                )}
              </Button>
            </div>

            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-4">
                <div className="flex gap-3">
                  <Lightbulb className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-blue-900 mb-1">AI 代码审查</p>
                    <p className="text-blue-700">
                      提交后，AI 审查员会分析你的代码质量、内存安全性和算法效率，并给出专业建议。
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
