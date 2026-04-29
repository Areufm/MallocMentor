"use client"

import { useState, useCallback } from 'react'
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
  AlertTriangle,
  CheckCircle2,
  Info,
  AlertCircle,
  Terminal,
  Copy,
} from 'lucide-react'
import Link from 'next/link'
import { useProblem, useRunCode, useSubmitCode } from '@/hooks/use-api'

type Language = 'c' | 'cpp'

const templates: Record<Language, string> = {
  cpp: `#include <iostream>
using namespace std;

int main() {
    // 请在这里编写你的代码

    return 0;
}`,
  c: `#include <stdio.h>

int main() {
    // 请在这里编写你的代码

    return 0;
}`,
}

/** 代码审查 Agent 返回的结构化结果 */
interface ReviewIssue {
  type: 'error' | 'warning' | 'info'
  line?: number
  message: string
  suggestion?: string
}

interface ReviewData {
  overallScore: number
  feedback: string
  issues: ReviewIssue[]
  suggestions: string[]
  strengths: string[]
}

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

/** 尝试从 AI 回复中解析结构化 JSON，失败则返回 null */
function parseReviewJson(raw: string): ReviewData | null {
  try {
    const cleaned = raw
      .replace(/^```json\s*/i, '')
      .replace(/```\s*$/, '')
      .trim()
    const obj = JSON.parse(cleaned)
    if (obj && typeof obj.overallScore === 'number') return obj as ReviewData
    return null
  } catch {
    return null
  }
}

export default function ProblemDetailPage() {
  const params = useParams()
  const id = params.id as string

  const { data: problemData, isLoading: loading } = useProblem(id)
  const problem = problemData as unknown as ProblemData | undefined
  const runCode = useRunCode()
  const submitCode = useSubmitCode()
  const isRunning = runCode.isLoading
  const isSubmitting = submitCode.isLoading

  const [language, setLanguage] = useState<Language>('cpp')
  const [code, setCode] = useState(templates.cpp)
  const [stdinInput, setStdinInput] = useState('')
  const [runResult, setRunResult] = useState<string | null>(null)
  const [reviewRaw, setReviewRaw] = useState<string | null>(null)
  const [showHints, setShowHints] = useState(false)

  const handleLanguageChange = useCallback((lang: Language) => {
    setLanguage(lang)
    setCode(templates[lang])
  }, [])

  const handleRun = async () => {
    setRunResult(null)
    try {
      const data = (await runCode.trigger({ code, language, input: stdinInput || undefined })) as unknown as {
        output: string; compiled?: boolean; exitCode?: number; executionTime?: number
      }
      let display = data.output
      if (data.compiled && data.executionTime != null) {
        display += `\n\n--- 退出码: ${data.exitCode ?? 0} | 耗时: ${data.executionTime}ms ---`
      }
      setRunResult(display)
    } catch (err) {
      setRunResult(err instanceof Error ? err.message : '运行失败，请稍后重试')
    }
  }

  /** 从测试用例 input 字段提取纯数据作为 stdin */
  const extractStdinFromTestCase = (tcInput: string): string => {
    // 测试用例格式如 "nums = [2,7,11,15], target = 9" 或 "5 1 2 3 4 5"
    // 如果是 "key = value" 格式，提取 value 部分并用换行连接
    const parts = tcInput.split(',').map(s => s.trim())
    const values: string[] = []
    for (const part of parts) {
      const eqIdx = part.indexOf('=')
      if (eqIdx !== -1) {
        values.push(part.slice(eqIdx + 1).trim())
      } else {
        values.push(part)
      }
    }
    return values.join('\n')
  }

  const handleSubmit = async () => {
    if (!problem) return
    setReviewRaw(null)
    try {
      const data = (await submitCode.trigger({ problemId: problem.id, code, language })) as unknown as {
        aiReview?: string; status?: string; overallScore?: number
      }
      setReviewRaw(data.aiReview || `提交状态：${data.status}`)
    } catch {
      setReviewRaw('提交失败，请稍后重试')
    }
  }

  const handleReset = () => {
    setCode(templates[language])
    setRunResult(null)
    setReviewRaw(null)
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
                            <span className="text-blue-600 shrink-0">*</span>
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
            {reviewRaw && <ReviewResultCard raw={reviewRaw} />}
          </div>

          {/* 右侧：代码编辑器 */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CardTitle>代码编辑器</CardTitle>
                    {/* 语言选择器 */}
                    <div className="flex rounded-lg border overflow-hidden text-sm">
                      <button
                        className={`px-3 py-1 transition-colors ${language === 'c' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                        onClick={() => handleLanguageChange('c')}
                      >
                        C
                      </button>
                      <button
                        className={`px-3 py-1 transition-colors ${language === 'cpp' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                        onClick={() => handleLanguageChange('cpp')}
                      >
                        C++
                      </button>
                    </div>
                  </div>
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
                  language={language}
                  height="500px"
                />
              </CardContent>
            </Card>

            {/* stdin 输入区 */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Terminal className="h-4 w-4" />
                    标准输入 (stdin)
                  </CardTitle>
                  {problem.testCases.length > 0 && (
                    <div className="flex gap-1">
                      {problem.testCases.map((tc, i) => (
                        <Button
                          key={i}
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs"
                          onClick={() => setStdinInput(extractStdinFromTestCase(tc.input))}
                          title={`填入测试用例 ${i + 1} 的输入`}
                        >
                          <Copy className="h-3 w-3 mr-1" />
                          用例 {i + 1}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <textarea
                  value={stdinInput}
                  onChange={(e) => setStdinInput(e.target.value)}
                  placeholder="程序运行时需要读取的输入数据（如 scanf 读取的内容）&#10;点击右上角「用例」按钮可一键填入测试数据"
                  className="w-full h-20 p-2 text-sm font-mono bg-gray-50 dark:bg-gray-900 border rounded-lg resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
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

            <Card className="bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800">
              <CardContent className="pt-4">
                <div className="flex gap-3">
                  <Lightbulb className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-blue-900 dark:text-blue-200 mb-1">AI 代码审查</p>
                    <p className="text-blue-700 dark:text-blue-400">
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

// ============================================
// 结构化审查结果展示组件
// ============================================

const issueIconMap = {
  error: <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />,
  warning: <AlertTriangle className="h-4 w-4 text-yellow-500 shrink-0 mt-0.5" />,
  info: <Info className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />,
}

const issueBgMap = {
  error: 'bg-red-50 border-red-200',
  warning: 'bg-yellow-50 border-yellow-200',
  info: 'bg-blue-50 border-blue-200',
}

function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 80 ? 'bg-green-100 text-green-800' :
    score >= 60 ? 'bg-yellow-100 text-yellow-800' :
    'bg-red-100 text-red-800'
  return <span className={`inline-flex items-center px-3 py-1 rounded-full text-lg font-bold ${color}`}>{score}</span>
}

function ReviewResultCard({ raw }: { raw: string }) {
  const review = parseReviewJson(raw)

  // 解析失败时退回纯文本展示
  if (!review) {
    return (
      <Card>
        <CardHeader><CardTitle className="text-base">AI 代码审查</CardTitle></CardHeader>
        <CardContent>
          <div className="text-sm whitespace-pre-wrap bg-blue-50 p-3 rounded-lg">{raw}</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">AI 代码审查</CardTitle>
          <ScoreBadge score={review.overallScore} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 总体评价 */}
        <p className="text-sm text-gray-700">{review.feedback}</p>

        {/* 问题列表 */}
        {review.issues.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">问题</h4>
            {review.issues.map((issue, i) => (
              <div key={i} className={`border rounded-lg p-3 text-sm ${issueBgMap[issue.type] || issueBgMap.info}`}>
                <div className="flex gap-2">
                  {issueIconMap[issue.type] || issueIconMap.info}
                  <div className="space-y-1 flex-1">
                    <p className="font-medium">
                      {issue.line != null && <span className="text-gray-500 mr-1">第 {issue.line} 行</span>}
                      {issue.message}
                    </p>
                    {issue.suggestion && (
                      <p className="text-gray-600">建议：{issue.suggestion}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 优化建议 */}
        {review.suggestions.length > 0 && (
          <div className="space-y-1">
            <h4 className="text-sm font-semibold">优化建议</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              {review.suggestions.map((s, i) => (
                <li key={i} className="flex gap-2">
                  <Lightbulb className="h-4 w-4 text-yellow-500 shrink-0 mt-0.5" />
                  {s}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 代码优点 */}
        {review.strengths.length > 0 && (
          <div className="space-y-1">
            <h4 className="text-sm font-semibold">代码优点</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              {review.strengths.map((s, i) => (
                <li key={i} className="flex gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                  {s}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
