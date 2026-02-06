"use client"

import { useState } from 'react'
import { AppLayout } from '@/components/layout/app-layout'
import { MonacoEditor } from '@/components/code-editor/monaco-editor'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Play, 
  Send, 
  RotateCcw, 
  ChevronLeft,
  Lightbulb,
  CheckCircle2,
  XCircle,
  Loader2
} from 'lucide-react'
import Link from 'next/link'

const defaultCode = `#include <iostream>
#include <vector>
using namespace std;

class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        // 请在这里实现你的代码
        
    }
};

int main() {
    Solution solution;
    vector<int> nums = {2, 7, 11, 15};
    int target = 9;
    vector<int> result = solution.twoSum(nums, target);
    
    cout << "[" << result[0] << ", " << result[1] << "]" << endl;
    return 0;
}`

// 模拟题目数据
const problemData = {
  id: '1',
  title: '两数之和',
  difficulty: 'Easy',
  category: '数组',
  tags: ['数组', '哈希表'],
  description: `给定一个整数数组 nums 和一个整数目标值 target，请你在该数组中找出和为目标值 target 的那两个整数，并返回它们的数组下标。

你可以假设每种输入只会对应一个答案。但是，数组中同一个元素在答案里不能重复出现。

你可以按任意顺序返回答案。`,
  examples: [
    {
      input: 'nums = [2,7,11,15], target = 9',
      output: '[0,1]',
      explanation: '因为 nums[0] + nums[1] == 9 ，返回 [0, 1]'
    },
    {
      input: 'nums = [3,2,4], target = 6',
      output: '[1,2]',
      explanation: '因为 nums[1] + nums[2] == 6 ，返回 [1, 2]'
    }
  ],
  constraints: [
    '2 <= nums.length <= 10^4',
    '-10^9 <= nums[i] <= 10^9',
    '-10^9 <= target <= 10^9',
    '只会存在一个有效答案'
  ],
  hints: [
    '可以使用哈希表来存储已经遍历过的数字',
    '时间复杂度可以优化到 O(n)'
  ]
}

export default function ProblemDetailPage() {
  const [code, setCode] = useState(defaultCode)
  const [isRunning, setIsRunning] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [testResults, setTestResults] = useState<any>(null)
  const [showHints, setShowHints] = useState(false)

  const handleRun = async () => {
    setIsRunning(true)
    // 模拟运行代码
    setTimeout(() => {
      setTestResults({
        passed: 2,
        total: 3,
        cases: [
          { input: '[2,7,11,15], 9', expected: '[0,1]', output: '[0,1]', passed: true },
          { input: '[3,2,4], 6', expected: '[1,2]', output: '[1,2]', passed: true },
          { input: '[3,3], 6', expected: '[0,1]', output: 'null', passed: false }
        ]
      })
      setIsRunning(false)
    }, 2000)
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    // 模拟提交代码
    setTimeout(() => {
      setIsSubmitting(false)
      alert('代码已提交！AI正在审查你的代码...')
    }, 1500)
  }

  const handleReset = () => {
    setCode(defaultCode)
    setTestResults(null)
  }

  return (
    <AppLayout>
      <div className="space-y-4">
        {/* 返回按钮 */}
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
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <CardTitle className="text-2xl">{problemData.title}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge className={
                        problemData.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                        problemData.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }>
                        {problemData.difficulty}
                      </Badge>
                      {problemData.tags.map(tag => (
                        <Badge key={tag} variant="secondary">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">题目描述</h3>
                  <p className="text-sm text-gray-600 whitespace-pre-line">
                    {problemData.description}
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">示例</h3>
                  {problemData.examples.map((example, index) => (
                    <div key={index} className="mb-3 p-3 bg-gray-50 rounded-lg text-sm">
                      <div className="space-y-1">
                        <div><strong>输入：</strong>{example.input}</div>
                        <div><strong>输出：</strong>{example.output}</div>
                        <div className="text-gray-600">{example.explanation}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div>
                  <h3 className="font-semibold mb-2">约束条件</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                    {problemData.constraints.map((constraint, index) => (
                      <li key={index}>{constraint}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowHints(!showHints)}
                  >
                    <Lightbulb className="h-4 w-4 mr-2" />
                    {showHints ? '隐藏提示' : '查看提示'}
                  </Button>
                  {showHints && (
                    <ul className="mt-2 space-y-1 text-sm text-gray-600">
                      {problemData.hints.map((hint, index) => (
                        <li key={index} className="flex gap-2">
                          <span className="text-blue-600">💡</span>
                          {hint}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* 测试结果 */}
            {testResults && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    测试结果
                    <Badge variant={testResults.passed === testResults.total ? "default" : "destructive"}>
                      {testResults.passed}/{testResults.total} 通过
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {testResults.cases.map((testCase: any, index: number) => (
                      <div key={index} className={`p-3 rounded-lg border ${
                        testCase.passed ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                      }`}>
                        <div className="flex items-start gap-2">
                          {testCase.passed ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                          )}
                          <div className="flex-1 text-sm">
                            <div><strong>输入：</strong>{testCase.input}</div>
                            <div><strong>期望：</strong>{testCase.expected}</div>
                            <div><strong>输出：</strong>{testCase.output}</div>
                          </div>
                        </div>
                      </div>
                    ))}
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

            {/* 操作按钮 */}
            <div className="flex gap-2">
              <Button 
                onClick={handleRun} 
                disabled={isRunning}
                variant="outline"
                className="flex-1"
              >
                {isRunning ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    运行中...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    运行代码
                  </>
                )}
              </Button>
              <Button 
                onClick={handleSubmit} 
                disabled={isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    提交中...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    提交并审查
                  </>
                )}
              </Button>
            </div>

            {/* AI 审查提示 */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-4">
                <div className="flex gap-3">
                  <Lightbulb className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-blue-900 mb-1">AI 代码审查</p>
                    <p className="text-blue-700">
                      提交后，AI审查员会分析你的代码质量、内存安全性和算法效率，并给出专业建议。
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
