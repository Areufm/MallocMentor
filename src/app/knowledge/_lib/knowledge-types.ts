import { ArrowUpDown, Eye, Heart, type LucideIcon } from "lucide-react";

export interface ArticleItem {
  id: string;
  title: string;
  slug: string;
  category: string;
  summary: string;
  difficulty: string;
  tags: string[];
  views: number;
  likes: number;
  author: string;
  estimatedTime?: number;
  updatedAt: string;
}

export interface CategoryItem {
  id: string;
  name: string;
  label: string;
  articleCount: number;
}

export type SortOption = "newest" | "views" | "likes";
export type TabOption = "all" | "favorites";

export interface SortOptionConfig {
  value: SortOption;
  label: string;
  icon: LucideIcon;
}

export const SORT_OPTIONS: SortOptionConfig[] = [
  { value: "newest", label: "最新", icon: ArrowUpDown },
  { value: "views", label: "浏览量", icon: Eye },
  { value: "likes", label: "收藏量", icon: Heart },
];

export const HOT_TOPICS = ["智能指针", "STL 容器", "内存管理", "多线程", "模板编程"];

export const PAGE_SIZE = 10;

export function getDifficultyColor(difficulty: string): string {
  switch (difficulty) {
    case "Easy":
      return "bg-green-100 text-green-800";
    case "Medium":
      return "bg-yellow-100 text-yellow-800";
    case "Hard":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}
