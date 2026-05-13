"use client";

import { CheckCircle2, Lock as LockIcon } from "lucide-react";
import type { Achievement } from "@/types/api";

export function AchievementCard({ achievement }: { achievement: Achievement }) {
  const containerClass = achievement.unlocked
    ? "bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800"
    : "bg-gray-50 border-gray-200 opacity-50 dark:bg-muted/20 dark:border-border";

  const iconWrapperClass = achievement.unlocked
    ? "bg-amber-100 dark:bg-amber-900/40"
    : "bg-gray-100 dark:bg-muted/40";

  return (
    <div className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${containerClass}`}>
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${iconWrapperClass}`}
      >
        {achievement.unlocked ? (
          <CheckCircle2 className="h-4.5 w-4.5 text-amber-600" />
        ) : (
          <LockIcon className="h-4 w-4 text-gray-400" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium truncate">{achievement.title}</p>
        <p className="text-xs text-gray-500 mt-0.5">{achievement.description}</p>
        {achievement.unlocked && achievement.unlockedAt && (
          <p className="text-[10px] text-gray-400 mt-1">
            {new Date(achievement.unlockedAt).toLocaleDateString("zh-CN")} 解锁
          </p>
        )}
      </div>
    </div>
  );
}
