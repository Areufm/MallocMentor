"use client";

import { useMemo, useState } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { Loader2 } from "lucide-react";
import {
  useGetLearningRecommendation,
  useKnowledgeArticles,
  useLearningPaths,
  useStartLearningPath,
  useUpdateLearningProgress,
} from "@/hooks/use-api";
import {
  calcOverallProgress,
  getCurrentArticleLink,
  type LearningPathData,
  type Recommendation,
} from "./_lib/learn-types";
import { OverallProgressCard } from "./_components/overall-progress-card";
import { PathOverviewGrid } from "./_components/path-overview-grid";
import { CelebrateCard } from "./_components/celebrate-card";
import { PathDetailSection } from "./_components/path-detail-section";
import { AiRecommendationCard } from "./_components/ai-recommendation-card";
import { FooterStateCards } from "./_components/empty-state-cards";

export default function LearnPage() {
  const { data: pathsData, isLoading: pathsLoading } = useLearningPaths();
  const { data: articlesData, isLoading: articlesLoading } = useKnowledgeArticles({
    page: 1,
    pageSize: 100,
  });
  const startPath = useStartLearningPath();
  const updateProgress = useUpdateLearningProgress();
  const getRecommendation = useGetLearningRecommendation();
  const recLoading = getRecommendation.isLoading;
  const recommendation = (getRecommendation.data ?? null) as Recommendation | null;

  const allPaths = (pathsData ?? []) as unknown as LearningPathData[];
  const loading = pathsLoading || articlesLoading;

  const articleMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const a of (articlesData?.data ?? []) as unknown as Array<{
      slug: string;
      id: string;
    }>) {
      map[a.slug] = a.id;
    }
    return map;
  }, [articlesData]);

  const [celebratePathId, setCelebratePathId] = useState<string | null>(null);
  const [selectedPathId, setSelectedPathId] = useState<string | null>(null);

  // 当前活跃路径
  const activePath = allPaths.find((p) => p.status === "active");

  // 选中展示的路径（默认为活跃路径）
  const displayPath = selectedPathId
    ? (allPaths.find((p) => p.id === selectedPathId) ?? activePath)
    : activePath;

  const overallProgress = calcOverallProgress(allPaths);
  const currentArticleLink = getCurrentArticleLink(activePath, articleMap);

  async function handleStartPath(templateId: string) {
    try {
      await startPath.trigger(templateId);
    } catch (err) {
      console.error("Start path error:", err);
    }
  }

  async function handleCompleteStep(pathId: string, stepId: number) {
    try {
      const result = await updateProgress.trigger({
        pathId,
        data: { pathId, stepId, completed: true },
      });
      if (result.pathCompleted) {
        setCelebratePathId(pathId);
      }
    } catch (err) {
      console.error("Update progress error:", err);
    }
  }

  async function fetchRecommendation() {
    try {
      await getRecommendation.trigger();
    } catch (err) {
      console.error("Fetch recommendation error:", err);
    }
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* 页面标题 */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">学习路径</h1>
          <p className="text-gray-500 mt-1">
            系统化学习 C/C++ 编程知识，完成一个阶段解锁下一个
          </p>
        </div>

        <OverallProgressCard paths={allPaths} overallProgress={overallProgress} />

        <PathOverviewGrid
          paths={allPaths}
          selectedPathId={selectedPathId}
          displayPathId={displayPath?.id}
          currentArticleLink={currentArticleLink}
          onSelectPath={setSelectedPathId}
          onStartPath={handleStartPath}
        />

        {celebratePathId && <CelebrateCard onDismiss={() => setCelebratePathId(null)} />}

        {displayPath && (
          <PathDetailSection
            displayPath={displayPath}
            paths={allPaths}
            articleMap={articleMap}
            selectedPathId={selectedPathId}
            onSelectPath={setSelectedPathId}
            onCompleteStep={handleCompleteStep}
          />
        )}

        <AiRecommendationCard
          recommendation={recommendation}
          loading={recLoading}
          paths={allPaths}
          onFetch={fetchRecommendation}
        />

        <FooterStateCards hasActive={!!activePath} paths={allPaths} />
      </div>
    </AppLayout>
  );
}

