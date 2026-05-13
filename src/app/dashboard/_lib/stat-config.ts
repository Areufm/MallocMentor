import { Code, Flame, TrendingUp, Trophy, type LucideIcon } from "lucide-react";
import type { UserStats } from "@/types/api";

export interface StatConfig {
  key: keyof Pick<UserStats, "problemsCompleted" | "streak" | "passRate" | "achievements">;
  label: string;
  unit: string;
  icon: LucideIcon;
  color: string;
  bgColor: string;
}

export const STAT_CONFIG: StatConfig[] = [
  {
    key: "problemsCompleted",
    label: "已完成题目",
    unit: "",
    icon: Code,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    key: "streak",
    label: "连续学习",
    unit: "天",
    icon: Flame,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
  },
  {
    key: "passRate",
    label: "通过率",
    unit: "%",
    icon: TrendingUp,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
  },
  {
    key: "achievements",
    label: "获得成就",
    unit: "",
    icon: Trophy,
    color: "text-yellow-600",
    bgColor: "bg-yellow-50",
  },
];
