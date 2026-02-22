"use client";

import { useState, useRef, useTransition } from "react";
import { useSession } from "next-auth/react";
import { AppLayout } from "@/components/layout/app-layout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Lock, Camera, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {
  const { data: session, update } = useSession();
  const user = session?.user;

  return (
    <AppLayout>
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">个人设置</h1>
          <p className="mt-1 text-sm text-gray-500">管理你的账号信息与安全设置</p>
        </div>

        <Tabs defaultValue="profile">
          <TabsList className="w-full">
            <TabsTrigger value="profile" className="flex-1 gap-1.5">
              <User className="h-4 w-4" />
              个人资料
            </TabsTrigger>
            <TabsTrigger value="security" className="flex-1 gap-1.5">
              <Lock className="h-4 w-4" />
              账号安全
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <ProfileTab user={user} onUpdate={update} />
          </TabsContent>

          <TabsContent value="security">
            <SecurityTab />
          </TabsContent>
        </Tabs>
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
  const [uploading, setUploading] = useState(false);
  const [saving, startSaving] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const initials = (user?.name ?? user?.email ?? "U").charAt(0).toUpperCase();

  /** 点击头像区域触发文件选择 */
  function handleAvatarClick() {
    fileInputRef.current?.click();
  }

  /** 上传头像到服务器 */
  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok || !data.success) {
        toast.error(data.error ?? "上传失败");
        return;
      }

      // 先在本地预览，保存时一并提交
      setAvatarUrl(data.data.url);
      toast.success("头像已上传，点击「保存修改」生效");
    } catch {
      toast.error("网络错误，请稍后重试");
    } finally {
      setUploading(false);
      // 清空 input 以便再次选同一文件
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  /** 保存昵称 & 头像到数据库，并刷新 Session */
  function handleSave() {
    startSaving(async () => {
      const payload: Record<string, string> = {};
      if (name.trim() !== (user?.name ?? "")) payload.name = name.trim();
      if (avatarUrl !== (user?.image ?? "")) payload.image = avatarUrl;

      if (Object.keys(payload).length === 0) {
        toast.info("没有需要保存的修改");
        return;
      }

      const res = await fetch("/api/user/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        toast.error(data.error ?? "保存失败");
        return;
      }

      // 刷新 next-auth Session，更新 Header 中显示的昵称/头像
      await onUpdate({ user: data.data });
      toast.success("个人资料已保存");
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
            <Avatar className="h-20 w-20 cursor-pointer" onClick={handleAvatarClick}>
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
            <p className="text-sm font-medium text-gray-900">点击头像更换图片</p>
            <p className="mt-0.5 text-xs text-gray-500">支持 JPG、PNG、WebP，最大 2MB</p>
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
          <Input value={user?.email ?? ""} readOnly className="cursor-not-allowed bg-gray-50" />
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
      const res = await fetch("/api/user/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: form.currentPassword,
          newPassword: form.newPassword,
        }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        toast.error(data.error ?? "修改失败");
        return;
      }

      toast.success("密码已修改，下次登录请使用新密码");
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
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
            disabled={pending || !form.currentPassword || !form.newPassword || !form.confirmPassword}
          >
            {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            修改密码
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
