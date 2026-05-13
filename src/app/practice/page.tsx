"use client";

import { useState, useMemo } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  Filter,
  Circle,
  Loader2,
  CheckCircle2,
  XCircle,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useProblems, useSubmissionStatus, useGenerateProblem } from "@/hooks/use-api";

interface ProblemItem {
  id: string;
  title: string;
  difficulty: string;
  category: string;
  tags: string[];
}

/** 每道题的做题状态 */
type SolveStatus = "passed" | "failed" | "none";

const difficulties = ["全部", "Easy", "Medium", "Hard"];
const GENERATE_CATEGORIES = [
  "数组", "链表", "指针", "内存管理", "STL",
  "字符串", "排序", "树", "面向对象", "并发",
];

export default function PracticePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("全部");

  // AI 出题弹窗状态
  const [showGenDialog, setShowGenDialog] = useState(false);
  const [genCategory, setGenCategory] = useState("");
  const [genDifficulty, setGenDifficulty] = useState("");
  const [genResult, setGenResult] = useState<string | null>(null);

  const problemsParams = useMemo(() => {
    const p: Record<string, string | number> = { page: 1, pageSize: 50 };
    if (selectedDifficulty !== "全部") p.difficulty = selectedDifficulty;
    if (searchQuery) p.search = searchQuery;
    return p;
  }, [selectedDifficulty, searchQuery]);

  const { data: problemsData, isLoading: loading } = useProblems(problemsParams);
  const { data: statusData } = useSubmissionStatus();
  const generateProblem = useGenerateProblem();

  const problems = (problemsData?.data ?? []) as unknown as ProblemItem[];
  const total = problemsData?.total ?? 0;
  const statusMap = (statusData ?? {}) as Record<string, SolveStatus>;
  const generating = generateProblem.isLoading;

  const handleGenerate = async () => {
    setGenResult(null);
    try {
      const result = await generateProblem.trigger({
        category: genCategory || undefined,
        difficulty: genDifficulty || undefined,
        count: 1,
      });
      setGenResult(`成功生成 ${result.count} 道题目：${result.problems.join("、")}`);
    } catch {
      setGenResult("生成失败，请检查 AI 服务配置");
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "bg-green-100 text-green-800";
      case "Medium":
        return "bg-yellow-100 text-yellow-800";
      case "Hard":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  /** 根据做题状态返回图标 */
  const statusIcon = (problemId: string) => {
    const s = statusMap[problemId];
    if (s === "passed") return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    if (s === "failed") return <XCircle className="h-5 w-5 text-red-400" />;
    return <Circle className="h-5 w-5 text-gray-300" />;
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">代码练习</h1>
            <p className="text-gray-500 mt-1">通过实战题目提升你的编程能力</p>
          </div>
          <Button
            variant="outline"
            onClick={() => setShowGenDialog(!showGenDialog)}
            className="gap-2"
          >
            <Sparkles className="h-4 w-4" />
            AI 出题
          </Button>
        </div>

        {/* AI 出题面板 */}
        {showGenDialog && (
          <Card className="border-purple-200 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-950/20">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-purple-500" />
                AI 智能出题
              </CardTitle>
              <CardDescription>选择分类和难度，AI 自动生成练习题</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-4">
                <div className="space-y-2">
                  <span className="text-sm font-medium">分类</span>
                  <div className="flex flex-wrap gap-1.5">
                    <Badge
                      variant={genCategory === "" ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => setGenCategory("")}
                    >
                      随机
                    </Badge>
                    {GENERATE_CATEGORIES.map((cat) => (
                      <Badge
                        key={cat}
                        variant={genCategory === cat ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => setGenCategory(cat)}
                      >
                        {cat}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <span className="text-sm font-medium">难度</span>
                  <div className="flex gap-1.5">
                    <Badge
                      variant={genDifficulty === "" ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => setGenDifficulty("")}
                    >
                      随机
                    </Badge>
                    {["Easy", "Medium", "Hard"].map((d) => (
                      <Badge
                        key={d}
                        variant={genDifficulty === d ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => setGenDifficulty(d)}
                      >
                        {d}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button onClick={handleGenerate} disabled={generating} size="sm">
                  {generating ? (
                    <><Loader2 className="h-3 w-3 mr-1 animate-spin" />生成中...</>
                  ) : (
                    <><Sparkles className="h-3 w-3 mr-1" />生成题目</>
                  )}
                </Button>
                {genResult && (
                  <span className="text-sm text-gray-600 dark:text-gray-400">{genResult}</span>
                )}
              </div>
            </CardContent>
          </Card>
        )}

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
                      variant={
                        selectedDifficulty === diff ? "default" : "outline"
                      }
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
                  <Link
                    className="block"
                    key={problem.id}
                    href={`/practice/${problem.id}`}
                  >
                    <div className="flex items-center gap-4 p-4 rounded-lg border hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 transition-all cursor-pointer">
                      <div className="shrink-0">
                        {statusIcon(problem.id)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium">{problem.title}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge
                            className={getDifficultyColor(problem.difficulty)}
                            variant="outline"
                          >
                            {problem.difficulty}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {problem.category}
                          </span>
                        </div>
                      </div>
                      <div className="hidden md:flex items-center gap-2 shrink-0">
                        {problem.tags.slice(0, 2).map((tag: string) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="text-xs"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <Button size="sm" className="shrink-0">
                        {statusMap[problem.id] === "passed" ? "复习" : "开始"}
                      </Button>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
