"use client";

import { useRef, useState, useTransition } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useUpdateProfile, useUploadAvatar, ApiError } from "@/hooks/use-api";

export interface SessionUser {
  id?: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

interface ProfileTabProps {
  user: SessionUser | undefined;
  onUpdate: (data?: Record<string, unknown>) => Promise<unknown>;
}

export function ProfileTab({ user, onUpdate }: ProfileTabProps) {
  const [name, setName] = useState(user?.name ?? "");
  const [avatarUrl, setAvatarUrl] = useState(user?.image ?? "");
  const [saving, startSaving] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadAvatar = useUploadAvatar();
  const updateProfile = useUpdateProfile();
  const uploading = uploadAvatar.isLoading;

  const initials = (user?.name ?? user?.email ?? "U").charAt(0).toUpperCase();

  function handleAvatarClick() {
    fileInputRef.current?.click();
  }

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
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

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
          <label htmlFor="settings-name" className="text-sm font-medium">昵称</label>
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
