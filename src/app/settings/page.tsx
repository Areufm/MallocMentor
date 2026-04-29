"use client";

import { Suspense, useState, useRef, useTransition } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { AppLayout } from "@/components/layout/app-layout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  User,
  Lock,
  Camera,
  Loader2,
  Trophy,
  CheckCircle2,
  Lock as LockIcon,
} from "lucide-react";
import { toast } from "sonner";
import {
  useAchievements,
  useUpdateProfile,
  useUploadAvatar,
  ApiError,
} from "@/hooks/use-api";

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

function SettingsPageFallback() {
  return (
    <AppLayout>
      <div className="mx-auto max-w-2xl space-y-3">
        <h1 className="text-2xl font-bold text-gray-900">个人设置</h1>
        <p className="text-sm text-gray-500">页面加载中...</p>
      </div>
    </AppLayout>
  );
}

// ==================== 个人资料 Tab ====================

interface SessionUser {
  id?: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

function ProfileTab({
  user,
  onUpdate,
}: {
  user: SessionUser | undefined;
  onUpdate: (data?: Record<string, unknown>) => Promise<unknown>;
}) {
  const [name, setName] = useState(user?.name ?? "");
  const [avatarUrl, setAvatarUrl] = useState(user?.image ?? "");
  const [saving, startSaving] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadAvatar = useUploadAvatar();
  const updateProfile = useUpdateProfile();
  const uploading = uploadAvatar.isLoading;

  const initials = (user?.name ?? user?.email ?? "U").charAt(0).toUpperCase();

  /** 点击头像区域触发文件选择 */
  function handleAvatarClick() {
    fileInputRef.current?.click();
  }

  /** 上传头像到服务器 */
  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const result = await uploadAvatar.trigger(file);
      // 先在本地预览，保存时一并提交
      setAvatarUrl(result.url);
      toast.success("头像已上传，点击「保存修改」生效");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "上传失败");
    } finally {
      // 清空 input 以便再次选同一文件
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  /** 保存昵称 & 头像到数据库，并刷新 Session */
  function handleSave() {
    startSaving(async () => {
      const payload: { name?: string; image?: string } = {};
      if (name.trim() !== (user?.name ?? "")) payload.name = name.trim();
      if (avatarUrl !== (user?.image ?? "")) payload.image = avatarUrl;

      if (Object.keys(payload).length === 0) {
        toast.info("没有需要保存的修改");
        return;
      }

      try {
        const updated = await updateProfile.trigger(payload);
        await onUpdate({ user: updated });
        toast.success("个人资料已保存");
      } catch (err) {
        toast.error(err instanceof ApiError ? err.message : "保存失败");
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>个人资料</CardTitle>
        <CardDescription>修改你的昵称和头像</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 头像上传区 */}
        <div className="flex items-center gap-5">
          <div className="relative">
            <Avatar
              className="h-20 w-20 cursor-pointer"
              onClick={handleAvatarClick}
            >
              <AvatarImage src={avatarUrl} alt={user?.name ?? "用户"} />
              <AvatarFallback className="text-xl">{initials}</AvatarFallback>
            </Avatar>
            <button
              type="button"
              onClick={handleAvatarClick}
              disabled={uploading}
              className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-blue-600 text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-50"
              title="更换头像"
            >
              {uploading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Camera className="h-3.5 w-3.5" />
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">
              点击头像更换图片
            </p>
            <p className="mt-0.5 text-xs text-gray-500">
              支持 JPG、PNG、WebP，最大 2MB
            </p>
          </div>
        </div>

        {/* 昵称输入 */}
        <div className="space-y-1.5">
          <label htmlFor="settings-name" className="text-sm font-medium">
            昵称
          </label>
          <Input
            id="settings-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="请输入昵称"
            maxLength={20}
          />
          <p className="text-xs text-gray-400">{name.length} / 20</p>
        </div>

        {/* 邮箱（只读） */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium">邮箱</label>
          <Input
            value={user?.email ?? ""}
            readOnly
            className="cursor-not-allowed bg-gray-50"
          />
          <p className="text-xs text-gray-400">邮箱是唯一账号标识，不可修改</p>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving || uploading}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            保存修改
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ==================== 账号安全 Tab ====================

function SecurityTab() {
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [pending, startPending] = useTransition();
  const updateProfile = useUpdateProfile();

  function updateField(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleChangePassword() {
    if (form.newPassword.length < 6) {
      toast.error("新密码长度不能少于 6 位");
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      toast.error("两次输入的新密码不一致");
      return;
    }

    startPending(async () => {
      try {
        await updateProfile.trigger({
          currentPassword: form.currentPassword,
          newPassword: form.newPassword,
        });
        toast.success("密码已修改，下次登录请使用新密码");
        setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      } catch (err) {
        toast.error(err instanceof ApiError ? err.message : "修改失败");
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>账号安全</CardTitle>
        <CardDescription>修改登录密码</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="current-password" className="text-sm font-medium">
            当前密码
          </label>
          <Input
            id="current-password"
            type="password"
            placeholder="请输入当前密码"
            value={form.currentPassword}
            onChange={(e) => updateField("currentPassword", e.target.value)}
            autoComplete="current-password"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="new-password" className="text-sm font-medium">
            新密码
          </label>
          <Input
            id="new-password"
            type="password"
            placeholder="至少 6 位字符"
            value={form.newPassword}
            onChange={(e) => updateField("newPassword", e.target.value)}
            autoComplete="new-password"
            minLength={6}
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="confirm-password" className="text-sm font-medium">
            确认新密码
          </label>
          <Input
            id="confirm-password"
            type="password"
            placeholder="再次输入新密码"
            value={form.confirmPassword}
            onChange={(e) => updateField("confirmPassword", e.target.value)}
            autoComplete="new-password"
          />
        </div>

        <div className="flex justify-end pt-2">
          <Button
            onClick={handleChangePassword}
            disabled={
              pending ||
              !form.currentPassword ||
              !form.newPassword ||
              !form.confirmPassword
            }
          >
            {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            修改密码
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ==================== 我的成就 Tab ====================

const CATEGORY_LABELS: Record<string, string> = {
  practice: "代码练习",
  interview: "模拟面试",
  learning: "学习成长",
  streak: "坚持不懈",
};

const CATEGORY_ORDER = ["practice", "interview", "learning", "streak"];

function AchievementsTab() {
  const { data, isLoading: loading } = useAchievements();
  const achievements = data?.achievements ?? [];
  const stats = { total: data?.total ?? 0, unlocked: data?.unlocked ?? 0 };

  const grouped = CATEGORY_ORDER.map((cat) => ({
    category: cat,
    label: CATEGORY_LABELS[cat] ?? cat,
    items: achievements.filter((a) => a.category === cat),
  })).filter((g) => g.items.length > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>我的成就</CardTitle>
        <CardDescription>
          {loading
            ? "加载中..."
            : `已解锁 ${stats.unlocked}/${stats.total} 个成就`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {loading ? (
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-24 bg-gray-50 rounded-lg animate-pulse"
              />
            ))}
          </div>
        ) : (
          grouped.map((group) => (
            <div key={group.category}>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                {group.label}
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {group.items.map((achievement) => (
                  <div
                    key={achievement.key}
                    className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                      achievement.unlocked
                        ? "bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800"
                        : "bg-gray-50 border-gray-200 opacity-50 dark:bg-muted/20 dark:border-border"
                    }`}
                  >
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                        achievement.unlocked
                          ? "bg-amber-100 dark:bg-amber-900/40"
                          : "bg-gray-100 dark:bg-muted/40"
                      }`}
                    >
                      {achievement.unlocked ? (
                        <CheckCircle2 className="h-4.5 w-4.5 text-amber-600" />
                      ) : (
                        <LockIcon className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">
                        {achievement.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {achievement.description}
                      </p>
                      {achievement.unlocked && achievement.unlockedAt && (
                        <p className="text-[10px] text-gray-400 mt-1">
                          {new Date(achievement.unlockedAt).toLocaleDateString(
                            "zh-CN",
                          )}{" "}
                          解锁
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
