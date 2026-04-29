import type { LearningPath } from "@/types/api";

/** 将 ISO 时间字符串转为相对时间描述 */
export function formatRelativeTime(dateString: string): string {
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

export interface LearningGoal {
  title: string;
  progress: number;
  total: number;
  completed: number;
  status: string;
  order: number;
}

/** 将学习路径转换为 dashboard 学习目标卡片格式 */
export function toLearningGoal(path: LearningPath & { order?: number }): LearningGoal {
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

/** 活动类型映射为时间轴小圆点的颜色 class */
export function getActivityDotClass(type: string): string {
  if (type === "problem") return "bg-green-500";
  if (type === "interview") return "bg-purple-500";
  return "bg-blue-500";
}
