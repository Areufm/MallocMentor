"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAchievements } from "@/hooks/use-api";
import { AchievementCard } from "./achievement-card";

const CATEGORY_LABELS: Record<string, string> = {
  practice: "代码练习",
  interview: "模拟面试",
  learning: "学习成长",
  streak: "坚持不懈",
};

const CATEGORY_ORDER = ["practice", "interview", "learning", "streak"];

export function AchievementsTab() {
  const { data, isLoading: loading } = useAchievements();
  const achievements = data?.achievements ?? [];
  const stats = { total: data?.total ?? 0, unlocked: data?.unlocked ?? 0 };

  const grouped = CATEGORY_ORDER.map((cat) => ({
    category: cat,
    label: CATEGORY_LABELS[cat] ?? cat,
    items: achievements.filter((a) => a.category === cat),
  })).filter((g) => g.items.length > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>我的成就</CardTitle>
        <CardDescription>
          {loading ? "加载中..." : `已解锁 ${stats.unlocked}/${stats.total} 个成就`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {loading ? (
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-24 bg-gray-50 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : (
          grouped.map((group) => (
            <div key={group.category}>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">{group.label}</h3>
              <div className="grid grid-cols-2 gap-3">
                {group.items.map((achievement) => (
                  <AchievementCard key={achievement.key} achievement={achievement} />
                ))}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
