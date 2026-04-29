"use client";

import { useMemo } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import {
  useUserStats,
  useCapabilityRadar,
  useActivities,
  useLearningPaths,
  useAchievements,
} from "@/hooks/use-api";
import { buildRadarMeta, toRadarData } from "./_lib/radar-utils";
import { toLearningGoal } from "./_lib/dashboard-format";
import { StatsCards } from "./_components/stats-cards";
import { RadarPanel } from "./_components/radar-panel";
import { LearningGoalsPanel } from "./_components/learning-goals-panel";
import { RecentAchievements } from "./_components/recent-achievements";
import { RecentActivities } from "./_components/recent-activities";

export default function DashboardPage() {
  const { data: userStats, isLoading: statsLoading } = useUserStats();
  const { data: radar, isLoading: radarLoading } = useCapabilityRadar();
  const { data: activitiesPage, isLoading: actLoading } = useActivities({ pageSize: 5 });
  const { data: paths, isLoading: pathsLoading } = useLearningPaths();
  const { data: achievementsData, isLoading: achLoading } = useAchievements();

  const loading = statsLoading || radarLoading || actLoading || pathsLoading || achLoading;

  const radarData = useMemo(() => (radar ? toRadarData(radar) : []), [radar]);
  const radarMeta = useMemo(() => buildRadarMeta(radar), [radar]);
  const activities = activitiesPage?.data ?? [];
  const learningGoals = useMemo(() => (paths ?? []).map(toLearningGoal), [paths]);
  const recentAchievements = useMemo(
    () =>
      (achievementsData?.achievements ?? [])
        .filter((a) => a.unlocked)
        .sort(
          (a, b) =>
            new Date(b.unlockedAt!).getTime() - new Date(a.unlockedAt!).getTime(),
        )
        .slice(0, 4),
    [achievementsData],
  );

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">欢迎回来！</h1>
          <p className="text-gray-500 mt-1">继续你的 C/C++ 学习之旅</p>
        </div>

        <StatsCards userStats={userStats} loading={loading} />

        <div className="grid gap-6 lg:grid-cols-2">
          <RadarPanel radarData={radarData} radarMeta={radarMeta} loading={loading} />
          <LearningGoalsPanel goals={learningGoals} loading={loading} />
        </div>

        <RecentAchievements
          achievements={recentAchievements}
          total={achievementsData?.total ?? 0}
          unlocked={achievementsData?.unlocked ?? 0}
          loading={loading}
        />

        <RecentActivities activities={activities} loading={loading} />
      </div>
    </AppLayout>
  );
}
