"use client";

import { AppLayout } from "@/components/layout/app-layout";

export function SettingsPageFallback() {
  return (
    <AppLayout>
      <div className="mx-auto max-w-2xl space-y-3">
        <h1 className="text-2xl font-bold text-gray-900">个人设置</h1>
        <p className="text-sm text-gray-500">页面加载中...</p>
      </div>
    </AppLayout>
  );
}
