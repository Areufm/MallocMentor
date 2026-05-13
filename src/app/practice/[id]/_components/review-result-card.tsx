"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Info,
  Lightbulb,
} from "lucide-react";
import { parseReviewJson, type ReviewIssue } from "../_lib/practice-types";

const ISSUE_ICON: Record<ReviewIssue["type"], React.ReactNode> = {
  error: <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />,
  warning: <AlertTriangle className="h-4 w-4 text-yellow-500 shrink-0 mt-0.5" />,
  info: <Info className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />,
};

const ISSUE_BG: Record<ReviewIssue["type"], string> = {
  error: "bg-red-50 border-red-200",
  warning: "bg-yellow-50 border-yellow-200",
  info: "bg-blue-50 border-blue-200",
};

function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 80
      ? "bg-green-100 text-green-800"
      : score >= 60
        ? "bg-yellow-100 text-yellow-800"
        : "bg-red-100 text-red-800";
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-lg font-bold ${color}`}>
      {score}
    </span>
  );
}

export function ReviewResultCard({ raw }: { raw: string }) {
  const review = parseReviewJson(raw);

  // 解析失败时退回纯文本展示
  if (!review) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">AI 代码审查</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm whitespace-pre-wrap bg-blue-50 p-3 rounded-lg">{raw}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">AI 代码审查</CardTitle>
          <ScoreBadge score={review.overallScore} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-700">{review.feedback}</p>

        {review.issues.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">问题</h4>
            {review.issues.map((issue, i) => (
              <div
                key={i}
                className={`border rounded-lg p-3 text-sm ${ISSUE_BG[issue.type] || ISSUE_BG.info}`}
              >
                <div className="flex gap-2">
                  {ISSUE_ICON[issue.type] || ISSUE_ICON.info}
                  <div className="space-y-1 flex-1">
                    <p className="font-medium">
                      {issue.line != null && (
                        <span className="text-gray-500 mr-1">第 {issue.line} 行</span>
                      )}
                      {issue.message}
                    </p>
                    {issue.suggestion && (
                      <p className="text-gray-600">建议：{issue.suggestion}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {review.suggestions.length > 0 && (
          <div className="space-y-1">
            <h4 className="text-sm font-semibold">优化建议</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              {review.suggestions.map((s, i) => (
                <li key={i} className="flex gap-2">
                  <Lightbulb className="h-4 w-4 text-yellow-500 shrink-0 mt-0.5" />
                  {s}
                </li>
              ))}
            </ul>
          </div>
        )}

        {review.strengths.length > 0 && (
          <div className="space-y-1">
            <h4 className="text-sm font-semibold">代码优点</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              {review.strengths.map((s, i) => (
                <li key={i} className="flex gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                  {s}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
