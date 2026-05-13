"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Loader2, Sparkles } from "lucide-react";
import type { LearningPathData, Recommendation } from "../_lib/learn-types";

interface AiRecommendationCardProps {
  recommendation: Recommendation | null;
  loading: boolean;
  paths: LearningPathData[];
  onFetch: () => void;
}

export function AiRecommendationCard({
  recommendation,
  loading,
  paths,
  onFetch,
}: AiRecommendationCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            AI 学习推荐
          </CardTitle>
          <Button size="sm" variant="outline" onClick={onFetch} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                分析中...
              </>
            ) : (
              <>
                <Sparkles className="h-3 w-3 mr-1" />
                获取推荐
              </>
            )}
          </Button>
        </div>
        <CardDescription>
          基于你的学习进度和能力评估，AI 为你量身定制学习建议
        </CardDescription>
      </CardHeader>
      {recommendation && (
        <CardContent className="space-y-4">
          <div>
            <div className="text-sm font-medium mb-2">推荐理由</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">{recommendation.reason}</p>
          </div>

          <div>
            <div className="text-sm font-medium mb-2">建议重点领域</div>
            <div className="flex flex-wrap gap-2">
              {recommendation.focusAreas.map((area, i) => (
                <Badge
                  key={i}
                  variant="outline"
                  className="bg-purple-50 text-purple-700 dark:bg-purple-950/30 dark:text-purple-300 dark:border-purple-700"
                >
                  {area}
                </Badge>
              ))}
            </div>
          </div>

          {recommendation.suggestedTemplateId && (
            <div>
              <div className="text-sm font-medium mb-2">推荐路径</div>
              <div className="p-3 rounded-lg border bg-purple-50 dark:bg-purple-950/20 dark:border-purple-800">
                <span className="font-medium">
                  {paths.find((p) => p.templateId === recommendation.suggestedTemplateId)?.title ??
                    recommendation.suggestedTemplateId}
                </span>
              </div>
            </div>
          )}

          {recommendation.customSteps && recommendation.customSteps.length > 0 && (
            <div>
              <div className="text-sm font-medium mb-2">进阶建议</div>
              <div className="space-y-2">
                {recommendation.customSteps.map((step, i) => (
                  <div key={i} className="p-3 rounded-lg border dark:border-border">
                    <div className="font-medium text-sm">{step.title}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {step.description}
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <Clock className="h-3 w-3 text-gray-400" />
                      <span className="text-xs text-gray-400">{step.duration}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
