"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useUpdateProfile, ApiError } from "@/hooks/use-api";

interface PasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const INITIAL_FORM: PasswordForm = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

export function SecurityTab() {
  const [form, setForm] = useState<PasswordForm>(INITIAL_FORM);
  const [pending, startPending] = useTransition();
  const updateProfile = useUpdateProfile();

  function updateField(field: keyof PasswordForm, value: string) {
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
        setForm(INITIAL_FORM);
      } catch (err) {
        toast.error(err instanceof ApiError ? err.message : "修改失败");
      }
    });
  }

  const submitDisabled =
    pending || !form.currentPassword || !form.newPassword || !form.confirmPassword;

  return (
    <Card>
      <CardHeader>
        <CardTitle>账号安全</CardTitle>
        <CardDescription>修改登录密码</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="current-password" className="text-sm font-medium">当前密码</label>
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
          <label htmlFor="new-password" className="text-sm font-medium">新密码</label>
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
          <label htmlFor="confirm-password" className="text-sm font-medium">确认新密码</label>
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
          <Button onClick={handleChangePassword} disabled={submitDisabled}>
            {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            修改密码
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
