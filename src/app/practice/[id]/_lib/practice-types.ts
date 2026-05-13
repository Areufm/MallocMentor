export type Language = "c" | "cpp";

export const CODE_TEMPLATES: Record<Language, string> = {
  cpp: `#include <iostream>
using namespace std;

int main() {
    // 请在这里编写你的代码

    return 0;
}`,
  c: `#include <stdio.h>

int main() {
    // 请在这里编写你的代码

    return 0;
}`,
};

/** 代码审查 Agent 返回的结构化结果 */
export interface ReviewIssue {
  type: "error" | "warning" | "info";
  line?: number;
  message: string;
  suggestion?: string;
}

export interface ReviewData {
  overallScore: number;
  feedback: string;
  issues: ReviewIssue[];
  suggestions: string[];
  strengths: string[];
}

export interface ProblemTestCase {
  input: string;
  expectedOutput: string;
  explanation?: string;
}

export interface ProblemData {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  category: string;
  tags: string[];
  testCases: ProblemTestCase[];
  hints: string[];
}

/** 尝试从 AI 回复中解析结构化 JSON，失败则返回 null */
export function parseReviewJson(raw: string): ReviewData | null {
  try {
    const cleaned = raw
      .replace(/^```json\s*/i, "")
      .replace(/```\s*$/, "")
      .trim();
    const obj = JSON.parse(cleaned);
    if (obj && typeof obj.overallScore === "number") return obj as ReviewData;
    return null;
  } catch {
    return null;
  }
}

/** 从测试用例 input 字段提取纯数据作为 stdin */
export function extractStdinFromTestCase(tcInput: string): string {
  // 测试用例格式如 "nums = [2,7,11,15], target = 9" 或 "5 1 2 3 4 5"
  // 如果是 "key = value" 格式，提取 value 部分并用换行连接
  const parts = tcInput.split(",").map((s) => s.trim());
  const values: string[] = [];
  for (const part of parts) {
    const eqIdx = part.indexOf("=");
    if (eqIdx !== -1) {
      values.push(part.slice(eqIdx + 1).trim());
    } else {
      values.push(part);
    }
  }
  return values.join("\n");
}

export function getDifficultyClass(difficulty: string): string {
  if (difficulty === "Easy") return "bg-green-100 text-green-800";
  if (difficulty === "Medium") return "bg-yellow-100 text-yellow-800";
  return "bg-red-100 text-red-800";
}
