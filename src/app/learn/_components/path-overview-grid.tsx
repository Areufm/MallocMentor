"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ChevronRight, Play, Sparkles, Trophy } from "lucide-react";
import {
  pathStatusMeta,
  type LearningPathData,
} from "../_lib/learn-types";

interface PathOverviewGridProps {
  paths: LearningPathData[];
  selectedPathId: string | null;
  displayPathId: string | undefined;
  currentArticleLink: string;
  onSelectPath: (id: string) => void;
  onStartPath: (templateId: string) => void;
}

export function PathOverviewGrid({
  paths,
  displayPathId,
  currentArticleLink,
  onSelectPath,
  onStartPath,
}: PathOverviewGridProps) {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">学习阶段总览</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {paths.map((p, idx) => (
          <PathOverviewCard
            key={p.id}
            path={p}
            isLastCard={idx === paths.length - 1}
            isSelected={displayPathId === p.id}
            currentArticleLink={currentArticleLink}
            onSelectPath={onSelectPath}
            onStartPath={onStartPath}
          />
        ))}
      </div>
    </div>
  );
}

interface PathOverviewCardProps {
  path: LearningPathData;
  isLastCard: boolean;
  isSelected: boolean;
  currentArticleLink: string;
  onSelectPath: (id: string) => void;
  onStartPath: (templateId: string) => void;
}

function PathOverviewCard({
  path: p,
  isLastCard,
  isSelected,
  currentArticleLink,
  onSelectPath,
  onStartPath,
}: PathOverviewCardProps) {
  const meta = pathStatusMeta(p.status);
  const isActive = p.status === "active";
  const isCompleted = p.status === "completed";
  const isLocked = p.status === "locked";
  const canSelect = isActive || isCompleted;

  const cardClass = isSelected
    ? "ring-2 ring-blue-500 shadow-md"
    : isActive
      ? "ring-1 ring-blue-300 dark:ring-blue-700"
      : isCompleted
        ? "border-green-300 dark:border-green-800"
        : isLocked
          ? "opacity-60"
          : "border-amber-300 dark:border-amber-800";

  return (
    <Card
      className={`relative transition-all ${cardClass} ${canSelect ? "cursor-pointer hover:shadow-md" : ""}`}
      onClick={() => {
        if (canSelect) onSelectPath(p.id);
      }}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-gray-400">阶段 {p.order}</span>
          <Badge className={meta.color}>{meta.label}</Badge>
        </div>
        <CardTitle className="text-base leading-snug">{p.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
            <span>{p.steps.length} 章节</span>
            <span>{p.progress}%</span>
          </div>
          <Progress value={p.progress} className="h-1.5" />

          {isActive && (
            <Link href={currentArticleLink}>
              <Button size="sm" className="w-full mt-1">
                <Play className="h-3 w-3 mr-1" /> 继续学习
              </Button>
            </Link>
          )}
          {p.status === "unlocked" && (
            <Button
              size="sm"
              variant="outline"
              className="w-full mt-1 border-amber-400 text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/30"
              onClick={() => onStartPath(p.templateId ?? "")}
            >
              <Sparkles className="h-3 w-3 mr-1" /> 开始学习
            </Button>
          )}
          {isCompleted && (
            <div className="flex items-center justify-center gap-1 text-sm text-green-600 dark:text-green-400 mt-1">
              <Trophy className="h-3.5 w-3.5" />
              <span>已掌握</span>
            </div>
          )}
        </div>
      </CardContent>

      {/* 阶段间的连接箭头（非最后一个） */}
      {!isLastCard && (
        <div className="hidden xl:flex absolute -right-4 top-1/2 -translate-y-1/2 z-10 text-gray-300 dark:text-gray-600">
          <ChevronRight className="h-6 w-6" />
        </div>
      )}
    </Card>
  );
}
