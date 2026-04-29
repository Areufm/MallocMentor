"use client";

import { Suspense } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { AppLayout } from "@/components/layout/app-layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Lock, Trophy } from "lucide-react";
import { ProfileTab } from "./_components/profile-tab";
import { SecurityTab } from "./_components/security-tab";
import { AchievementsTab } from "./_components/achievements-tab";
import { SettingsPageFallback } from "./_components/settings-fallback";

export default function SettingsPage() {
  return (
    <Suspense fallback={<SettingsPageFallback />}>
      <SettingsPageContent />
    </Suspense>
  );
}

function SettingsPageContent() {
  const { data: session, update } = useSession();
  const user = session?.user;
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get("tab") ?? "profile";

  return (
    <AppLayout>
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">个人设置</h1>
          <p className="mt-1 text-sm text-gray-500">
            管理你的账号信息与安全设置
          </p>
        </div>

        <Tabs defaultValue={defaultTab}>
          <TabsList className="w-full">
            <TabsTrigger value="profile" className="flex-1 gap-1.5">
              <User className="h-4 w-4" />
              个人资料
            </TabsTrigger>
            <TabsTrigger value="security" className="flex-1 gap-1.5">
              <Lock className="h-4 w-4" />
              账号安全
            </TabsTrigger>
            <TabsTrigger value="achievements" className="flex-1 gap-1.5">
              <Trophy className="h-4 w-4" />
              我的成就
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <ProfileTab user={user} onUpdate={update} />
          </TabsContent>

          <TabsContent value="security">
            <SecurityTab />
          </TabsContent>

          <TabsContent value="achievements">
            <AchievementsTab />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}

