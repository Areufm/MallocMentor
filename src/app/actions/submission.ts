"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { chatNonStream, parseJsonAnswer } from "@/lib/ai/coze";

// AI 返回的结构化评分
interface AIReviewResult {
  overallScore: number;
  feedback: string;
  issues: { type: "error" | "warning" | "info"; line: number; message: string }[];
  suggestions: string[];
  strengths: string[];
  // 六维能力评分增量
  capabilityScores?: {
    basicSyntax: number;
    memoryManagement: number;
    dataStructures: number;
    oop: number;
    stlLibrary: number;
    systemProgramming: number;
  };
}

/**
 * 提交代码并请求 AI 评审
 */
export async function submitCode(formData: {
  problemId: string;
  code: string;
  language: "c" | "cpp";
}) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "请先登录" };
  }

  const userId = session.user.id;

  // 1. 保存提交记录（状态为处理中）
  const submission = await prisma.codeSubmission.create({
    data: {
      userId,
      problemId: formData.problemId,
      code: formData.code,
      language: formData.language,
      status: "Running",
    },
  });

  // 2. 获取题目信息用于构造 Prompt
  const problem = await prisma.problem.findUnique({
    where: { id: formData.problemId },
  });

  if (!problem) {
    await prisma.codeSubmission.update({
      where: { id: submission.id },
      data: { status: "Error", aiReview: JSON.stringify({ error: "题目不存在" }) },
    });
    return { success: false, error: "题目不存在" };
  }

  // 3. 调用 AI 评审
  try {
    const prompt = buildReviewPrompt(problem, formData.code, formData.language);
    const { answer } = await chatNonStream(userId, prompt);
    const review = parseJsonAnswer<AIReviewResult>(answer);

    // 4. 更新提交记录
    const status = review.overallScore >= 60 ? "Passed" : "Failed";
    await prisma.codeSubmission.update({
      where: { id: submission.id },
      data: { status, aiReview: JSON.stringify(review) },
    });

    // 5. 更新能力图谱
    if (review.capabilityScores) {
      await updateCapabilityRadar(userId, review.capabilityScores);
    }

    return { success: true, data: { id: submission.id, status, review } };
  } catch (error) {
    console.error("AI review error:", error);

    // AI 不可用时仍然保存提交，但标记为需要人工评审
    await prisma.codeSubmission.update({
      where: { id: submission.id },
      data: {
        status: "Error",
        aiReview: JSON.stringify({ error: "AI 评审暂时不可用，请稍后重试" }),
      },
    });

    return { success: false, error: "AI 评审服务暂时不可用" };
  }
}

/**
 * 构造代码评审 Prompt
 */
function buildReviewPrompt(
  problem: { title: string; description: string; testCases: string },
  code: string,
  language: string,
): string {
  return `请对以下 ${language === "cpp" ? "C++" : "C"} 代码进行评审。

## 题目
**${problem.title}**
${problem.description}

## 测试用例
${problem.testCases}

## 提交的代码
\`\`\`${language}
${code}
\`\`\`

请以 JSON 格式返回评审结果，包含以下字段：
{
  "overallScore": 0-100的综合评分,
  "feedback": "总体评价（中文）",
  "issues": [{"type": "error|warning|info", "line": 行号, "message": "问题描述"}],
  "suggestions": ["改进建议1", "改进建议2"],
  "strengths": ["代码优点1", "代码优点2"],
  "capabilityScores": {
    "basicSyntax": 0-100,
    "memoryManagement": 0-100,
    "dataStructures": 0-100,
    "oop": 0-100,
    "stlLibrary": 0-100,
    "systemProgramming": 0-100
  }
}

评分维度说明：
- basicSyntax: 基础语法的正确性和规范性
- memoryManagement: 内存分配/释放/指针使用
- dataStructures: 数据结构和算法的选择与实现
- oop: 面向对象设计（仅 C++ 适用，C 语言此项给 -1）
- stlLibrary: 标准库的使用是否得当
- systemProgramming: 错误处理、资源管理等系统编程能力

只返回 JSON，不要包含其他内容。`;
}

/**
 * 增量更新用户能力图谱
 * 使用加权移动平均：新得分 = 旧得分 * 0.7 + 本次得分 * 0.3
 */
async function updateCapabilityRadar(
  userId: string,
  scores: NonNullable<AIReviewResult["capabilityScores"]>,
) {
  const existing = await prisma.capabilityRadar.findUnique({
    where: { userId },
  });

  const blend = (oldVal: number, newVal: number) =>
    newVal < 0 ? oldVal : Math.round(oldVal * 0.7 + newVal * 0.3);

  if (existing) {
    await prisma.capabilityRadar.update({
      where: { userId },
      data: {
        basicSyntax: blend(existing.basicSyntax, scores.basicSyntax),
        memoryManagement: blend(existing.memoryManagement, scores.memoryManagement),
        dataStructures: blend(existing.dataStructures, scores.dataStructures),
        oop: blend(existing.oop, scores.oop),
        stlLibrary: blend(existing.stlLibrary, scores.stlLibrary),
        systemProgramming: blend(existing.systemProgramming, scores.systemProgramming),
      },
    });
  } else {
    await prisma.capabilityRadar.create({
      data: {
        userId,
        basicSyntax: Math.max(0, scores.basicSyntax),
        memoryManagement: Math.max(0, scores.memoryManagement),
        dataStructures: Math.max(0, scores.dataStructures),
        oop: Math.max(0, scores.oop),
        stlLibrary: Math.max(0, scores.stlLibrary),
        systemProgramming: Math.max(0, scores.systemProgramming),
      },
    });
  }
}
