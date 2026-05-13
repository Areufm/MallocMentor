import {
  CheckCircle2,
  Lock,
  Play,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

export interface LearningStep {
  id: number;
  title: string;
  description: string;
  duration: string;
  status: string;
  articleSlug?: string;
}

export interface LearningPathData {
  id: string;
  title: string;
  description: string;
  steps: LearningStep[];
  currentStep: number;
  progress: number;
  status: string;
  order: number;
  templateId: string | null;
}

export interface Recommendation {
  focusAreas: string[];
  reason: string;
  suggestedTemplateId: string | null;
  customSteps?: Array<{ title: string; description: string; duration: string }>;
}

export interface PathStatusMeta {
  label: string;
  color: string;
  icon: LucideIcon;
}

/** 路径状态对应的中文标签与颜色 */
export function pathStatusMeta(status: string): PathStatusMeta {
  switch (status) {
    case "completed":
      return { label: "已完成", color: "bg-green-600 text-white", icon: CheckCircle2 };
    case "active":
      return { label: "学习中", color: "bg-blue-600 text-white", icon: Play };
    case "unlocked":
      return { label: "可开始", color: "bg-amber-500 text-white", icon: Sparkles };
    default:
      return { label: "未解锁", color: "bg-gray-400 text-white", icon: Lock };
  }
}

/** 根据 articleSlug 与 articleMap 计算章节文章链接 */
export function getStepArticleLink(
  step: LearningStep,
  articleMap: Record<string, string>,
): string {
  if (step.articleSlug && articleMap[step.articleSlug]) {
    return `/knowledge/${articleMap[step.articleSlug]}`;
  }
  return "/knowledge";
}

/** 根据当前活跃路径计算"继续学习"链接 */
export function getCurrentArticleLink(
  activePath: LearningPathData | undefined,
  articleMap: Record<string, string>,
): string {
  const steps = activePath?.steps ?? [];
  const currentStep = steps.find((s) => s.status === "in_progress");
  if (currentStep?.articleSlug && articleMap[currentStep.articleSlug]) {
    return `/knowledge/${articleMap[currentStep.articleSlug]}`;
  }
  return "/knowledge";
}

/** 计算总体进度百分比 */
export function calcOverallProgress(paths: LearningPathData[]): number {
  const totalSteps = paths.reduce((sum, p) => sum + p.steps.length, 0);
  const completedSteps = paths.reduce(
    (sum, p) => sum + p.steps.filter((s) => s.status === "completed").length,
    0,
  );
  return totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
}
