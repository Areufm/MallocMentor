"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Star, Trophy } from "lucide-react";
import type { LearningPathData } from "../_lib/learn-types";

export function NewlyUnlockedCard() {
  return (
    <Card className="border-amber-200 dark:border-amber-800 bg-linear-to-r from-amber-50 to-yellow-50 dark:from-amber-950/40 dark:to-yellow-950/30">
      <CardContent className="pt-6 text-center space-y-3">
        <Sparkles className="h-12 w-12 text-amber-500 mx-auto" />
        <h3 className="text-xl font-bold">新的路径已解锁！</h3>
        <p className="text-gray-600 dark:text-gray-400">
          点击上方阶段卡片中的「开始学习」按钮，开启新的学习旅程。
        </p>
      </CardContent>
    </Card>
  );
}

export function AllCompletedCard() {
  return (
    <Card className="border-green-200 dark:border-green-800 bg-linear-to-r from-green-50 to-emerald-50 dark:from-green-950/40 dark:to-emerald-950/30">
      <CardContent className="pt-6 text-center space-y-3">
        <div className="flex items-center justify-center gap-2">
          <Trophy className="h-12 w-12 text-yellow-500" />
          <Star className="h-8 w-8 text-yellow-400" />
        </div>
        <h3 className="text-xl font-bold">恭喜你完成了所有学习路径！</h3>
        <p className="text-gray-600 dark:text-gray-400">
          你已经系统掌握了 C++ 的核心知识。可以继续刷题练习或尝试模拟面试来巩固提升。
        </p>
        <div className="flex justify-center gap-3 pt-2">
          <Link href="/practice">
            <Button>去刷题</Button>
          </Link>
          <Link href="/interview">
            <Button variant="outline">模拟面试</Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

/** 根据 paths 列表自动选择展示哪个引导/全完成卡片 */
interface FooterStateCardsProps {
  hasActive: boolean;
  paths: LearningPathData[];
}

export function FooterStateCards({ hasActive, paths }: FooterStateCardsProps) {
  if (paths.length === 0) return null;

  const hasUnlocked = paths.some((p) => p.status === "unlocked");
  const allDoneOrLocked = paths.every(
    (p) => p.status === "completed" || p.status === "locked",
  );
  const hasCompleted = paths.some((p) => p.status === "completed");

  return (
    <>
      {!hasActive && hasUnlocked && <NewlyUnlockedCard />}
      {!hasActive && !hasUnlocked && allDoneOrLocked && hasCompleted && <AllCompletedCard />}
    </>
  );
}
