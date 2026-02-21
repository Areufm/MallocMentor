"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Code2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type Mode = "login" | "register";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (mode === "register") {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });

        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? "注册失败");
          setLoading(false);
          return;
        }
        // 注册成功后自动登录
      }

      const result = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });

      if (result?.error) {
        setError(mode === "login" ? "邮箱或密码错误" : "注册成功但自动登录失败，请手动登录");
        setLoading(false);
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("网络错误，请稍后重试");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* 左侧品牌区 */}
      <div className="hidden w-1/2 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 lg:flex lg:flex-col lg:items-center lg:justify-center lg:p-12">
        <div className="max-w-md text-center text-white">
          <div className="mb-8 flex justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm">
              <Code2 className="h-10 w-10" />
            </div>
          </div>
          <h1 className="mb-4 text-4xl font-bold">MallocMentor</h1>
          <p className="mb-2 text-xl font-medium text-blue-100">
            C/C++ 智能学习平台
          </p>
          <p className="text-blue-200/80">
            AI 驱动的编程练习、模拟面试与能力评估，
            <br />
            助你系统掌握 C/C++ 核心技能。
          </p>
          <div className="mt-12 grid grid-cols-3 gap-6 text-sm text-blue-100">
            <div>
              <div className="mb-1 text-2xl font-bold text-white">500+</div>
              练习题目
            </div>
            <div>
              <div className="mb-1 text-2xl font-bold text-white">AI</div>
              智能评估
            </div>
            <div>
              <div className="mb-1 text-2xl font-bold text-white">6维</div>
              能力图谱
            </div>
          </div>
        </div>
      </div>

      {/* 右侧表单区 */}
      <div className="flex w-full items-center justify-center p-6 lg:w-1/2">
        <Card className="w-full max-w-md border-0 shadow-none lg:border lg:shadow-sm">
          {/* 移动端 Logo */}
          <div className="mb-4 flex items-center justify-center gap-2 lg:hidden">
            <Code2 className="h-6 w-6 text-blue-600" />
            <span className="text-lg font-bold">MallocMentor</span>
          </div>

          <CardHeader className="text-center">
            <CardTitle className="text-2xl">
              {mode === "login" ? "欢迎回来" : "创建账号"}
            </CardTitle>
            <CardDescription>
              {mode === "login"
                ? "登录以继续你的学习之旅"
                : "注册以开始你的 C/C++ 学习之旅"}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "register" && (
                <div className="space-y-1.5">
                  <label htmlFor="name" className="text-sm font-medium">
                    昵称
                  </label>
                  <Input
                    id="name"
                    placeholder="请输入昵称"
                    value={form.name}
                    onChange={(e) => updateField("name", e.target.value)}
                    required
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <label htmlFor="email" className="text-sm font-medium">
                  邮箱
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="请输入邮箱"
                  value={form.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="password" className="text-sm font-medium">
                  密码
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="请输入密码"
                  value={form.password}
                  onChange={(e) => updateField("password", e.target.value)}
                  required
                  minLength={6}
                />
              </div>

              {error && (
                <p className="text-sm text-red-500">{error}</p>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {mode === "login" ? "登 录" : "注 册"}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-500">
              {mode === "login" ? (
                <>
                  还没有账号？{" "}
                  <button
                    type="button"
                    className="font-medium text-blue-600 hover:text-blue-700"
                    onClick={() => {
                      setMode("register");
                      setError("");
                    }}
                  >
                    立即注册
                  </button>
                </>
              ) : (
                <>
                  已有账号？{" "}
                  <button
                    type="button"
                    className="font-medium text-blue-600 hover:text-blue-700"
                    onClick={() => {
                      setMode("login");
                      setError("");
                    }}
                  >
                    返回登录
                  </button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
