"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Star } from "lucide-react";
import type { LearningPathData } from "../_lib/learn-types";

interface OverallProgressCardProps {
  paths: LearningPathData[];
  overallProgress: number;
}

export function OverallProgressCard({ paths, overallProgress }: OverallProgressCardProps) {
  const completedCount = paths.filter((p) => p.status === "completed").length;
  return (
    <Card className="border-indigo-200 dark:border-indigo-800 bg-linear-to-r from-indigo-50 via-blue-50 to-cyan-50 dark:from-indigo-950/50 dark:via-blue-950/40 dark:to-cyan-950/30">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center">
              <Star className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="font-semibold text-lg">总体学习进度</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                已完成 {completedCount}/{paths.length} 个路径
              </div>
            </div>
          </div>
          <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
            {overallProgress}%
          </div>
        </div>
        <Progress value={overallProgress} className="h-2" />
      </CardContent>
    </Card>
  );
}
