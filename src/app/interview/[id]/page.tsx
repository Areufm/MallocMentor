"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { AppLayout } from "@/components/layout/app-layout";
import { ChatWindow } from "@/components/interview/chat-window";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ChevronLeft,
  Clock,
  MessageSquare,
  Flag,
  Brain,
  Code,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { interviewApi } from "@/lib/api";
import type { InterviewSession, InterviewEvaluation } from "@/types/api";

export default function InterviewSessionPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [session, setSession] = useState<InterviewSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [ending, setEnding] = useState(false);
  const [evaluation, setEvaluation] = useState<InterviewEvaluation | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [messageCount, setMessageCount] = useState(0);

  // 加载会话详情
  useEffect(() => {
    async function load() {
      try {
        const res = await interviewApi.getById(id);
        if (res.success && res.data) {
          setSession(res.data);
          setMessageCount(res.data.messages?.length ?? 0);
          if (res.data.evaluation) {
            setEvaluation(res.data.evaluation);
          }
        }
      } catch (err) {
        console.error("Load interview session error:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  // 计时器（仅 active 状态）
  useEffect(() => {
    if (!session || session.status !== "active") return;

    const startTime = new Date(session.createdAt).getTime();
    const tick = () => setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [session]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // 消息数量实时更新回调
  const handleMessageCountChange = useCallback((count: number) => {
    setMessageCount(count);
  }, []);

  // 结束面试
  const handleEndInterview = async () => {
    if (ending) return;
    setEnding(true);
    try {
      const res = await interviewApi.endInterview(id);
      if (res.success && res.data) {
        setEvaluation(res.data.evaluation);
        setSession((prev) => prev ? { ...prev, status: "completed" } : prev);
      }
    } catch (err) {
      console.error("End interview error:", err);
    } finally {
      setEnding(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      </AppLayout>
    );
  }

  if (!session) {
    return (
      <AppLayout>
        <div className="text-center py-20">
          <p className="text-gray-500 mb-4">面试会话不存在</p>
          <Link href="/interview">
            <Button>返回面试列表</Button>
          </Link>
        </div>
      </AppLayout>
    );
  }

  const isActive = session.status === "active";
  const userMsgCount = Math.floor(messageCount / 2);

  return (
    <AppLayout>
      <div className="space-y-4">
        <Link href="/interview">
          <Button variant="ghost" size="sm">
            <ChevronLeft className="h-4 w-4 mr-1" />
            返回面试列表
          </Button>
        </Link>

        <div className="grid gap-4 lg:grid-cols-4">
          {/* 左侧：聊天窗口 */}
          <div className="lg:col-span-3">
            <Card className="h-[calc(100vh-12rem)]">
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{session.title}</CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="bg-purple-50 text-purple-700">
                        {session.type === "technical" ? "技术面试" : "行为面试"}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={isActive ? "bg-green-50 text-green-700" : "bg-gray-50 text-gray-700"}
                      >
                        {isActive ? "进行中" : "已完成"}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    {isActive && (
                      <>
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                          <Clock className="h-4 w-4" />
                          <span>{formatTime(elapsedTime)}</span>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={handleEndInterview}
                          disabled={ending}
                        >
                          {ending ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Flag className="h-4 w-4 mr-2" />
                          )}
                          {ending ? "生成评估中..." : "结束面试"}
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0 h-[calc(100%-5rem)]">
                <ChatWindow
                  sessionId={id}
                  initialMessages={session.messages}
                  disabled={!isActive}
                  onMessageCountChange={handleMessageCountChange}
                />
              </CardContent>
            </Card>
          </div>

          {/* 右侧：面试信息 */}
          <div className="space-y-4">
            {/* 面试进度 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">面试进度</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 pt-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-blue-600" />
                    <span className="text-gray-600">已用时</span>
                    <span className="font-medium ml-auto">{formatTime(elapsedTime)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MessageSquare className="h-4 w-4 text-purple-600" />
                    <span className="text-gray-600">对话轮次</span>
                    <span className="font-medium ml-auto">{userMsgCount} 轮</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 评估结果（面试结束后显示） */}
            {evaluation && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">面试评估</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-600">表达能力</span>
                        <span className="text-xs font-medium">{evaluation.communication}/100</span>
                      </div>
                      <Progress value={evaluation.communication} className="h-1.5" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-600">技术深度</span>
                        <span className="text-xs font-medium">{evaluation.technicalDepth}/100</span>
                      </div>
                      <Progress value={evaluation.technicalDepth} className="h-1.5" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-600">问题解决</span>
                        <span className="text-xs font-medium">{evaluation.problemSolving}/100</span>
                      </div>
                      <Progress value={evaluation.problemSolving} className="h-1.5" />
                    </div>
                    <div className="pt-3 border-t">
                      <div className="flex items-center gap-2">
                        <Brain className="h-4 w-4 text-purple-600" />
                        <span className="text-sm font-medium">综合得分</span>
                        <span className="text-lg font-bold text-purple-600 ml-auto">
                          {evaluation.overallScore}
                        </span>
                      </div>
                    </div>
                    {evaluation.feedback && (
                      <p className="text-xs text-gray-600 pt-2 border-t">{evaluation.feedback}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 未评估时的提示 */}
            {!evaluation && isActive && (
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="pt-4">
                  <div className="flex gap-2">
                    <Code className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-blue-900 mb-1">小提示</p>
                      <p className="text-blue-700 text-xs">
                        回答时可以结合具体代码示例，这样能更好地展示你的理解。面试结束后会生成详细评估报告。
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
