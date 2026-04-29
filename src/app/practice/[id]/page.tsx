"use client";

import { useCallback, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, Lightbulb, Loader2 } from "lucide-react";
import { useProblem, useRunCode, useSubmitCode } from "@/hooks/use-api";
import { CODE_TEMPLATES, type Language, type ProblemData } from "./_lib/practice-types";
import { ProblemDescription } from "./_components/problem-description";
import { CodeEditorPanel } from "./_components/code-editor-panel";
import { StdinInput } from "./_components/stdin-input";
import { ActionButtons } from "./_components/action-buttons";
import { RunResult } from "./_components/run-result";
import { ReviewResultCard } from "./_components/review-result-card";

export default function ProblemDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const { data: problemData, isLoading: loading } = useProblem(id);
  const problem = problemData as unknown as ProblemData | undefined;
  const runCode = useRunCode();
  const submitCode = useSubmitCode();
  const isRunning = runCode.isLoading;
  const isSubmitting = submitCode.isLoading;

  const [language, setLanguage] = useState<Language>("cpp");
  const [code, setCode] = useState(CODE_TEMPLATES.cpp);
  const [stdinInput, setStdinInput] = useState("");
  const [runResult, setRunResult] = useState<string | null>(null);
  const [reviewRaw, setReviewRaw] = useState<string | null>(null);

  const handleLanguageChange = useCallback((lang: Language) => {
    setLanguage(lang);
    setCode(CODE_TEMPLATES[lang]);
  }, []);

  async function handleRun() {
    setRunResult(null);
    try {
      const data = (await runCode.trigger({
        code,
        language,
        input: stdinInput || undefined,
      })) as unknown as {
        output: string;
        compiled?: boolean;
        exitCode?: number;
        executionTime?: number;
      };
      let display = data.output;
      if (data.compiled && data.executionTime != null) {
        display += `\n\n--- 退出码: ${data.exitCode ?? 0} | 耗时: ${data.executionTime}ms ---`;
      }
      setRunResult(display);
    } catch (err) {
      setRunResult(err instanceof Error ? err.message : "运行失败，请稍后重试");
    }
  }

  async function handleSubmit() {
    if (!problem) return;
    setReviewRaw(null);
    try {
      const data = (await submitCode.trigger({
        problemId: problem.id,
        code,
        language,
      })) as unknown as { aiReview?: string; status?: string; overallScore?: number };
      setReviewRaw(data.aiReview || `提交状态：${data.status}`);
    } catch {
      setReviewRaw("提交失败，请稍后重试");
    }
  }

  function handleReset() {
    setCode(CODE_TEMPLATES[language]);
    setRunResult(null);
    setReviewRaw(null);
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      </AppLayout>
    );
  }

  if (!problem) {
    return (
      <AppLayout>
        <div className="text-center py-20">
          <p className="text-gray-500 mb-4">题目不存在</p>
          <Link href="/practice">
            <Button>返回题目列表</Button>
          </Link>
        </div>
      </AppLayout>
    );
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
          {/* 左侧：题目描述 + 运行结果 + AI 审查 */}
          <div className="space-y-4">
            <ProblemDescription problem={problem} />
            {runResult && <RunResult output={runResult} />}
            {reviewRaw && <ReviewResultCard raw={reviewRaw} />}
          </div>

          {/* 右侧：代码编辑器 + stdin + 操作按钮 */}
          <div className="space-y-4">
            <CodeEditorPanel
              code={code}
              language={language}
              onCodeChange={setCode}
              onLanguageChange={handleLanguageChange}
              onReset={handleReset}
            />
            <StdinInput
              value={stdinInput}
              onChange={setStdinInput}
              testCases={problem.testCases}
            />
            <ActionButtons
              isRunning={isRunning}
              isSubmitting={isSubmitting}
              onRun={handleRun}
              onSubmit={handleSubmit}
            />

            <Card className="bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800">
              <CardContent className="pt-4">
                <div className="flex gap-3">
                  <Lightbulb className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-blue-900 dark:text-blue-200 mb-1">
                      AI 代码审查
                    </p>
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
  );
}
