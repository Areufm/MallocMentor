"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { STAT_CONFIG } from "../_lib/stat-config";
import type { UserStats } from "@/types/api";

interface StatsCardsProps {
  userStats: UserStats | undefined;
  loading: boolean;
}

export function StatsCards({ userStats, loading }: StatsCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {STAT_CONFIG.map((cfg) => {
        const raw = userStats?.[cfg.key] ?? 0;
        const displayValue = `${raw}${cfg.unit}`;
        return (
          <Card key={cfg.label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{cfg.label}</CardTitle>
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
  );
}
