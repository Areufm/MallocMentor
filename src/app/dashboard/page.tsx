"use client";

import { useMemo } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  TrendingUp,
  Code,
  Trophy,
  Flame,
  Target,
  Zap,
  CheckCircle2,
  Lock,
  Play,
} from "lucide-react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  useUserStats,
  useCapabilityRadar,
  useActivities,
  useLearningPaths,
  useAchievements,
} from "@/hooks/use-api";
import type {
  CapabilityRadar,
  LearningPath,
} from "@/types/api";

// 雷达图数据项类型
interface RadarDataItem {
  subject: string;
  A: number;
  fullMark: number;
}

// 统计卡片配置（图标、颜色等 UI 属性保留在前端）
const STAT_CONFIG = [
  {
    key: "problemsCompleted" as const,
    label: "已完成题目",
    unit: "",
    icon: Code,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    key: "streak" as const,
    label: "连续学习",
    unit: "天",
    icon: Flame,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
  },
  {
    key: "passRate" as const,
    label: "通过率",
    unit: "%",
    icon: TrendingUp,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
  },
  {
    key: "achievements" as const,
    label: "获得成就",
    unit: "",
    icon: Trophy,
    color: "text-yellow-600",
    bgColor: "bg-yellow-50",
  },
];

/** 将 CapabilityRadar 对象转换为雷达图所需格式 */
function toRadarData(radar: CapabilityRadar): RadarDataItem[] {
  return [
    { subject: "基础语法", A: radar.basicSyntax, fullMark: 100 },
    { subject: "内存管理", A: radar.memoryManagement, fullMark: 100 },
    { subject: "数据结构", A: radar.dataStructures, fullMark: 100 },
    { subject: "面向对象", A: radar.oop, fullMark: 100 },
    { subject: "STL使用", A: radar.stlLibrary, fullMark: 100 },
    { subject: "系统编程", A: radar.systemProgramming, fullMark: 100 },
  ];
}

/** 计算雷达图综合评分（六项均值） */
function calcOverallScore(radar: CapabilityRadar): number {
  const values = [
    radar.basicSyntax,
    radar.memoryManagement,
    radar.dataStructures,
    radar.oop,
    radar.stlLibrary,
    radar.systemProgramming,
  ];
  return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
}

/** 找出雷达图中得分最高的维度 */
function findTopDimension(radar: CapabilityRadar): string {
  const dims = [
    { name: "基础语法", value: radar.basicSyntax },
    { name: "内存管理", value: radar.memoryManagement },
    { name: "数据结构", value: radar.dataStructures },
    { name: "面向对象", value: radar.oop },
    { name: "STL使用", value: radar.stlLibrary },
    { name: "系统编程", value: radar.systemProgramming },
  ];
  return dims.reduce((prev, curr) => (curr.value > prev.value ? curr : prev))
    .name;
}

/** 将 ISO 时间字符串转为相对时间描述 */
function formatRelativeTime(dateString: string): string {
  const diffMs = Date.now() - new Date(dateString).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "刚刚";
  if (minutes < 60) return `${minutes}分钟前`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}小时前`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}天前`;
  const months = Math.floor(days / 30);
  return `${months}个月前`;
}

/** 将学习路径转换为目标进度格式 */
function toLearningGoal(path: LearningPath & { order?: number }) {
  const completed = path.steps.filter((s) => s.status === "completed").length;
  return {
    title: path.title,
    progress: path.progress,
    total: path.steps.length,
    completed,
    status: path.status as string,
    order: (path as { order?: number }).order ?? 0,
  };
}

export default function DashboardPage() {
  const { data: userStats, isLoading: statsLoading } = useUserStats();
  const { data: radar, isLoading: radarLoading } = useCapabilityRadar();
  const { data: activitiesPage, isLoading: actLoading } = useActivities({ pageSize: 5 });
  const { data: paths, isLoading: pathsLoading } = useLearningPaths();
  const { data: achievementsData, isLoading: achLoading } = useAchievements();

  const loading = statsLoading || radarLoading || actLoading || pathsLoading || achLoading;

  const radarData: RadarDataItem[] = useMemo(
    () => (radar ? toRadarData(radar) : []),
    [radar],
  );
  const radarMeta = useMemo(
    () =>
      radar
        ? {
            overallScore: calcOverallScore(radar),
            topDimension: findTopDimension(radar),
          }
        : { overallScore: 0, topDimension: "" },
    [radar],
  );
  const activities = activitiesPage?.data ?? [];
  const learningGoals = useMemo(
    () => (paths ?? []).map(toLearningGoal),
    [paths],
  );
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
  const achievementStats = {
    total: achievementsData?.total ?? 0,
    unlocked: achievementsData?.unlocked ?? 0,
  };

  // 活动类型映射为点颜色样式
  const getActivityDotClass = (type: string) => {
    if (type === "problem") return "bg-green-500";
    if (type === "interview") return "bg-purple-500";
    return "bg-blue-500";
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* 欢迎区域 */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">欢迎回来！</h1>
          <p className="text-gray-500 mt-1">继续你的 C/C++ 学习之旅</p>
        </div>

        {/* 统计卡片 */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {STAT_CONFIG.map((cfg) => {
            const raw = userStats?.[cfg.key] ?? 0;
            const displayValue = `${raw}${cfg.unit}`;
            return (
              <Card key={cfg.label}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {cfg.label}
                  </CardTitle>
                  <div className={`${cfg.bgColor} p-2 rounded-lg`}>
                    <cfg.icon className={`h-4 w-4 ${cfg.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="h-8 w-16 bg-gray-100 rounded animate-pulse" />
                  ) : (
                    <div className="text-2xl font-bold">{displayValue}</div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* 能力雷达图 */}
          <Card className="lg:col-span-1 flex flex-col">
            <CardHeader>
              <CardTitle>能力雷达图</CardTitle>
              <CardDescription>全方位评估你的 C/C++ 技能</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col flex-1 min-h-0">
              {loading ? (
                <div className="flex-1 min-h-[200px] bg-gray-50 rounded animate-pulse" />
              ) : (
                <div className="flex-1 min-h-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart
                      data={radarData}
                      cx="50%"
                      cy="50%"
                      outerRadius="72%"
                    >
                      <PolarGrid />
                      <PolarAngleAxis
                        dataKey="subject"
                        tick={{ fontSize: 14 }}
                      />
                      <PolarRadiusAxis
                        angle={90}
                        domain={[0, 100]}
                        tick={{ fontSize: 10 }}
                      />
                      <Radar
                        name="能力值"
                        dataKey="A"
                        stroke="#8884d8"
                        fill="#8884d8"
                        fillOpacity={0.6}
                      />
                      <Legend />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              )}
              {/* 底部固定高度的统计行 */}
              <div className="mt-4 pt-4 border-t grid grid-cols-2 gap-2 shrink-0">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-blue-600" />
                  <span className="text-sm">
                    综合评分：
                    <strong>
                      {loading ? "--" : `${radarMeta.overallScore}/100`}
                    </strong>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm">
                    最强维度：{loading ? "--" : radarMeta.topDimension}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 学习目标 */}
          <Card>
            <CardHeader>
              <CardTitle>学习目标</CardTitle>
              <CardDescription>
                {loading
                  ? "加载中..."
                  : `共 ${learningGoals.length} 个阶段，已完成 ${learningGoals.filter((g) => g.status === "completed").length} 个`}
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
                learningGoals.map((goal) => {
                  const isCompleted = goal.status === "completed";
                  const isActive = goal.status === "active";
                  const isLocked = goal.status === "locked";

                  return (
                    <div
                      key={goal.title}
                      className={`p-3 rounded-lg border transition-colors ${
                        isCompleted
                          ? "bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-800"
                          : isActive
                            ? "bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800"
                            : isLocked
                              ? "opacity-50 bg-gray-50 border-gray-200 dark:bg-muted/20 dark:border-border"
                              : "bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          {isCompleted ? (
                            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                          ) : isActive ? (
                            <Play className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          ) : (
                            <Lock className="h-4 w-4 text-gray-400" />
                          )}
                          <span className="text-sm font-medium">
                            {goal.title}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {goal.completed}/{goal.total}
                        </span>
                      </div>
                      <Progress value={goal.progress} className="h-1.5" />
                    </div>
                  );
                })
              )}
              <div className="pt-3 border-t">
                <a
                  href="/learn"
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  查看全部目标 →
                </a>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 最近成就 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>最近成就</CardTitle>
                <CardDescription>
                  {loading ? '加载中...' : `已解锁 ${achievementStats.unlocked}/${achievementStats.total} 个成就`}
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
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-20 bg-gray-50 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : recentAchievements.length === 0 ? (
              <div className="text-center py-6 text-sm text-gray-500">
                还没有解锁任何成就，继续加油吧！
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {recentAchievements.map(achievement => (
                  <div
                    key={achievement.key}
                    className="flex flex-col items-center gap-1.5 p-3 rounded-lg border bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/40">
                      <Trophy className="h-5 w-5 text-amber-600" />
                    </div>
                    <span className="text-xs font-medium text-center">{achievement.title}</span>
                    <span className="text-[10px] text-gray-500">{formatRelativeTime(achievement.unlockedAt!)}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 最近活动 */}
        <Card>
          <CardHeader>
            <CardTitle>最近活动</CardTitle>
            <CardDescription>你的学习动态</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex items-start gap-4 pb-4 border-b last:border-0"
                  >
                    <div className="mt-1 h-2 w-2 rounded-full bg-gray-100" />
                    <div className="flex-1 space-y-1">
                      <div className="h-4 bg-gray-100 rounded animate-pulse w-1/2" />
                      <div className="h-3 bg-gray-100 rounded animate-pulse w-3/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {activities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-4 pb-4 last:pb-0 border-b last:border-0"
                  >
                    <div
                      className={`mt-1 h-2 w-2 rounded-full ${getActivityDotClass(activity.type)}`}
                    />
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">{activity.title}</p>
                      <p className="text-xs text-gray-500">
                        {activity.description}
                      </p>
                    </div>
                    <span className="text-xs text-gray-400 shrink-0">
                      {formatRelativeTime(activity.createdAt)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
