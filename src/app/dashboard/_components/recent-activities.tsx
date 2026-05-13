"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { ActivityLog } from "@/types/api";
import { formatRelativeTime, getActivityDotClass } from "../_lib/dashboard-format";

interface RecentActivitiesProps {
  activities: ActivityLog[];
  loading: boolean;
}

export function RecentActivities({ activities, loading }: RecentActivitiesProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>最近活动</CardTitle>
        <CardDescription>你的学习动态</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start gap-4 pb-4 border-b last:border-0">
                <div className="mt-1 h-2 w-2 rounded-full bg-gray-100" />
                <div className="flex-1 space-y-1">
                  <div className="h-4 bg-gray-100 rounded animate-pulse w-1/2" />
                  <div className="h-3 bg-gray-100 rounded animate-pulse w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-4 pb-4 last:pb-0 border-b last:border-0"
              >
                <div
                  className={`mt-1 h-2 w-2 rounded-full ${getActivityDotClass(activity.type)}`}
                />
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">{activity.title}</p>
                  <p className="text-xs text-gray-500">{activity.description}</p>
                </div>
                <span className="text-xs text-gray-400 shrink-0">
                  {formatRelativeTime(activity.createdAt)}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
