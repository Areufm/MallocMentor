"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy } from "lucide-react";
import type { Achievement } from "@/types/api";
import { formatRelativeTime } from "../_lib/dashboard-format";

interface RecentAchievementsProps {
  achievements: Achievement[];
  total: number;
  unlocked: number;
  loading: boolean;
}

export function RecentAchievements({
  achievements,
  total,
  unlocked,
  loading,
}: RecentAchievementsProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>最近成就</CardTitle>
            <CardDescription>
              {loading ? "加载中..." : `已解锁 ${unlocked}/${total} 个成就`}
            </CardDescription>
          </div>
          <a
            href="/settings?tab=achievements"
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            查看全部 →
          </a>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 bg-gray-50 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : achievements.length === 0 ? (
          <div className="text-center py-6 text-sm text-gray-500">
            还没有解锁任何成就，继续加油吧！
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {achievements.map((achievement) => (
              <div
                key={achievement.key}
                className="flex flex-col items-center gap-1.5 p-3 rounded-lg border bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/40">
                  <Trophy className="h-5 w-5 text-amber-600" />
                </div>
                <span className="text-xs font-medium text-center">{achievement.title}</span>
                <span className="text-[10px] text-gray-500">
                  {formatRelativeTime(achievement.unlockedAt!)}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
