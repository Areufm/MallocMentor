"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lightbulb } from "lucide-react";
import type { ProblemData } from "../_lib/practice-types";
import { getDifficultyClass } from "../_lib/practice-types";

export function ProblemDescription({ problem }: { problem: ProblemData }) {
  const [showHints, setShowHints] = useState(false);

  return (
    <Card>
      <CardHeader>
        <div className="space-y-2">
          <CardTitle className="text-2xl">{problem.title}</CardTitle>
          <div className="flex items-center gap-2">
            <Badge className={getDifficultyClass(problem.difficulty)}>
              {problem.difficulty}
            </Badge>
            {problem.tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="font-semibold mb-2">题目描述</h3>
          <p className="text-sm text-gray-600 whitespace-pre-line">
            {problem.description}
          </p>
        </div>

        {problem.testCases.length > 0 && (
          <div>
            <h3 className="font-semibold mb-2">示例</h3>
            {problem.testCases.map((tc, i) => (
              <div key={i} className="mb-3 p-3 bg-gray-50 rounded-lg text-sm">
                <div className="space-y-1">
                  <div>
                    <strong>输入：</strong>
                    {tc.input}
                  </div>
                  <div>
                    <strong>输出：</strong>
                    {tc.expectedOutput}
                  </div>
                  {tc.explanation && (
                    <div className="text-gray-600">{tc.explanation}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {problem.hints.length > 0 && (
          <div>
            <Button variant="outline" size="sm" onClick={() => setShowHints(!showHints)}>
              <Lightbulb className="h-4 w-4 mr-2" />
              {showHints ? "隐藏提示" : "查看提示"}
            </Button>
            {showHints && (
              <ul className="mt-2 space-y-1 text-sm text-gray-600">
                {problem.hints.map((hint, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-blue-600 shrink-0">*</span>
                    {hint}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
