"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  BookOpen,
  CheckCircle2,
  Circle,
  Clock,
  Lock,
  Trophy,
} from "lucide-react";
import {
  getStepArticleLink,
  type LearningPathData,
  type LearningStep,
} from "../_lib/learn-types";

interface PathDetailSectionProps {
  displayPath: LearningPathData;
  paths: LearningPathData[];
  articleMap: Record<string, string>;
  selectedPathId: string | null;
  onSelectPath: (id: string) => void;
  onCompleteStep: (pathId: string, stepId: number) => void;
}

export function PathDetailSection({
  displayPath,
  paths,
  articleMap,
  onSelectPath,
  onCompleteStep,
}: PathDetailSectionProps) {
  const router = useRouter();
  const displaySteps = displayPath.steps;
  const isDisplayActive = displayPath.status === "active";
  const completedSteps = displaySteps.filter((s) => s.status === "completed").length;

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* 左侧：课程大纲 */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Badge
                className={
                  displayPath.status === "completed"
                    ? "bg-green-600 text-white"
                    : "bg-blue-600 text-white"
                }
              >
                阶段 {displayPath.order}
              </Badge>
              <div>
                <CardTitle>{displayPath.title}</CardTitle>
                <CardDescription className="mt-1">{displayPath.description}</CardDescription>
              </div>
              {displayPath.status === "completed" && (
                <Badge
                  variant="outline"
                  className="ml-auto text-green-700 border-green-400 dark:text-green-300 dark:border-green-700"
                >
                  <CheckCircle2 className="h-3 w-3 mr-1" /> 已完成
                </Badge>
              )}
            </div>
            <div className="flex items-center justify-between mt-4">
              <span className="text-sm font-medium">本阶段进度</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {completedSteps}/{displaySteps.length} 章节
              </span>
            </div>
            <Progress value={displayPath.progress} className="h-2" />
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {displaySteps.map((step) => (
                <StepRow
                  key={step.id}
                  step={step}
                  pathId={displayPath.id}
                  isPathActive={isDisplayActive}
                  articleLink={getStepArticleLink(step, articleMap)}
                  onComplete={onCompleteStep}
                  onNavigate={(href) => router.push(href)}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 右侧面板 */}
      <div className="space-y-4">
        <QuickLinksCard />
        <CompletedPathsCard
          paths={paths}
          displayPathId={displayPath.id}
          onSelectPath={onSelectPath}
        />
      </div>
    </div>
  );
}

// ==================== 子组件 ====================

interface StepRowProps {
  step: LearningStep;
  pathId: string;
  isPathActive: boolean;
  articleLink: string;
  onComplete: (pathId: string, stepId: number) => void;
  onNavigate: (href: string) => void;
}

function StepRow({
  step,
  pathId,
  isPathActive,
  articleLink,
  onComplete,
  onNavigate,
}: StepRowProps) {
  const containerClass =
    step.status === "completed"
      ? "bg-green-50 border-green-200 dark:bg-green-950/40 dark:border-green-900"
      : step.status === "in_progress"
        ? "bg-blue-50 border-blue-200 dark:bg-blue-950/40 dark:border-blue-900"
        : "bg-gray-50 border-gray-200 dark:bg-muted/30 dark:border-border";

  const interactiveClass =
    step.status === "locked" ? "opacity-60" : "hover:shadow-sm cursor-pointer";

  return (
    <div
      className={`flex items-center gap-4 p-3 rounded-lg border transition-all ${containerClass} ${interactiveClass}`}
      onClick={() => {
        if (step.status !== "locked") onNavigate(articleLink);
      }}
    >
      <div className="shrink-0">
        {step.status === "completed" ? (
          <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
        ) : step.status === "in_progress" ? (
          <Circle className="h-6 w-6 text-blue-600 dark:text-blue-400 animate-pulse" />
        ) : (
          <Lock className="h-6 w-6 text-gray-400 dark:text-gray-500" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500 dark:text-gray-400">第 {step.id} 章</span>
          {step.status === "in_progress" && (
            <Badge
              variant="outline"
              className="bg-blue-100 text-blue-700 text-xs dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-800"
            >
              进行中
            </Badge>
          )}
        </div>
        <h4 className="font-medium mt-1">{step.title}</h4>
        <div className="flex items-center gap-2 mt-1">
          <Clock className="h-3 w-3 text-gray-400 dark:text-gray-500" />
          <span className="text-xs text-gray-500 dark:text-gray-400">{step.duration}</span>
        </div>
      </div>

      {step.status !== "locked" && (
        <div className="flex gap-2">
          {step.status === "in_progress" && isPathActive && (
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                onComplete(pathId, step.id);
              }}
            >
              <CheckCircle2 className="h-3 w-3 mr-1" />
              完成
            </Button>
          )}
          <Button
            size="sm"
            variant={step.status === "in_progress" ? "default" : "outline"}
            onClick={(e) => {
              e.stopPropagation();
              onNavigate(articleLink);
            }}
          >
            {step.status === "completed" ? "复习" : "学习"}
          </Button>
        </div>
      )}
    </div>
  );
}

function QuickLinksCard() {
  const links: Array<{ href: string; label: string }> = [
    { href: "/knowledge", label: "浏览知识库" },
    { href: "/practice", label: "代码练习" },
    { href: "/interview", label: "模拟面试" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">快速入口</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {links.map((l) => (
          <Link key={l.href} href={l.href} className="block">
            <Button variant="outline" className="w-full justify-start">
              <BookOpen className="h-4 w-4 mr-2" />
              {l.label}
            </Button>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}

interface CompletedPathsCardProps {
  paths: LearningPathData[];
  displayPathId: string;
  onSelectPath: (id: string) => void;
}

function CompletedPathsCard({
  paths,
  displayPathId,
  onSelectPath,
}: CompletedPathsCardProps) {
  const completed = paths.filter((p) => p.status === "completed");
  if (completed.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Trophy className="h-4 w-4 text-yellow-500" />
          已完成路径
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {completed.map((p) => {
          const isCurrent = displayPathId === p.id;
          return (
            <div
              key={p.id}
              className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors ${
                isCurrent
                  ? "bg-green-100 dark:bg-green-900/40 ring-1 ring-green-400"
                  : "bg-green-50 dark:bg-green-950/30 hover:bg-green-100 dark:hover:bg-green-900/30"
              }`}
              onClick={() => onSelectPath(p.id)}
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                <span className="text-sm font-medium">{p.title}</span>
              </div>
              <Badge
                variant="outline"
                className="text-xs text-green-700 dark:text-green-300 border-green-300 dark:border-green-700"
              >
                {p.steps.length} 章
              </Badge>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
