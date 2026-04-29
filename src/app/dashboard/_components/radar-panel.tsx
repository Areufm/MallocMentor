"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, Zap } from "lucide-react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { RadarDataItem, RadarMeta } from "../_lib/radar-utils";

interface RadarPanelProps {
  radarData: RadarDataItem[];
  radarMeta: RadarMeta;
  loading: boolean;
}

export function RadarPanel({ radarData, radarMeta, loading }: RadarPanelProps) {
  return (
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
              <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="72%">
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 14 }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10 }} />
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
              <strong>{loading ? "--" : `${radarMeta.overallScore}/100`}</strong>
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
  );
}
