"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Lock, Play } from "lucide-react";
import type { LearningGoal } from "../_lib/dashboard-format";

interface LearningGoalsPanelProps {
  goals: LearningGoal[];
  loading: boolean;
}

export function LearningGoalsPanel({ goals, loading }: LearningGoalsPanelProps) {
  const completedCount = goals.filter((g) => g.status === "completed").length;

  return (
    <Card>
      <CardHeader>
        <CardTitle>学习目标</CardTitle>
        <CardDescription>
          {loading ? "加载中..." : `共 ${goals.length} 个阶段，已完成 ${completedCount} 个`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-gray-100 rounded animate-pulse w-3/4" />
                <div className="h-2 bg-gray-100 rounded animate-pulse" />
              </div>
            ))}
          </div>
        ) : (
          goals.map((goal) => <GoalRow key={goal.title} goal={goal} />)
        )}
        <div className="pt-3 border-t">
          <a href="/learn" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            查看全部目标 →
          </a>
        </div>
      </CardContent>
    </Card>
  );
}

function GoalRow({ goal }: { goal: LearningGoal }) {
  const isCompleted = goal.status === "completed";
  const isActive = goal.status === "active";
  const isLocked = goal.status === "locked";

  const containerClass = isCompleted
    ? "bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-800"
    : isActive
      ? "bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800"
      : isLocked
        ? "opacity-50 bg-gray-50 border-gray-200 dark:bg-muted/20 dark:border-border"
        : "bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800";

  return (
    <div className={`p-3 rounded-lg border transition-colors ${containerClass}`}>
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          {isCompleted ? (
            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
          ) : isActive ? (
            <Play className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          ) : (
            <Lock className="h-4 w-4 text-gray-400" />
          )}
          <span className="text-sm font-medium">{goal.title}</span>
        </div>
        <span className="text-xs text-gray-500">
          {goal.completed}/{goal.total}
        </span>
      </div>
      <Progress value={goal.progress} className="h-1.5" />
    </div>
  );
}
