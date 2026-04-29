/**
 * Prisma 模型中的 JSON 字符串字段统一解析层
 *
 * 背景：
 * Prisma schema 中很多字段以 String 形式存储 JSON（tags/testCases/hints/messages
 * /evaluation/steps/topics/...）。每次读出后都要 JSON.parse，散落在 30+ 处，
 * 一旦解析格式有变（如 mode、容错策略），改动面巨大。本模块统一封装，
 * 所有 API route 必须通过这里解析，禁止再裸调 JSON.parse 处理 DB 字段。
 *
 * 设计原则：
 * - 解析失败 -> 返回 fallback（不抛错），保持 API 可用
 * - 类型友好：用泛型保留调用点的语义
 * - 零依赖、纯函数，便于单测
 */

import { logger } from './logger'

const SCOPE = 'json-fields'

/**
 * 安全 JSON 解析。失败时记录 warn 并返回 fallback。
 * - input 为 null/undefined/空串时直接返回 fallback（不算错误）
 * - 解析失败时 logger.warn 一次（保留 hint）
 */
export function safeJsonParse<T>(
  input: string | null | undefined,
  fallback: T,
  hint?: string,
): T {
  if (input === null || input === undefined || input === '') return fallback
  try {
    return JSON.parse(input) as T
  } catch (err) {
    logger.warn(SCOPE, `parse failed${hint ? ` [${hint}]` : ''}`, err)
    return fallback
  }
}

// ---------- 题目相关 ----------

export interface ProblemTestCase {
  input: string
  expectedOutput: string
  explanation?: string
}

/** 题目标签数组（DB 字段：Problem.tags / KnowledgeArticle.tags / UserFavorite.article.tags） */
export function parseTags(input: string | null | undefined): string[] {
  return safeJsonParse<string[]>(input, [], 'tags')
}

/** 题目测试用例数组（DB 字段：Problem.testCases） */
export function parseTestCases(input: string | null | undefined): ProblemTestCase[] {
  return safeJsonParse<ProblemTestCase[]>(input, [], 'testCases')
}

/** 题目提示数组（DB 字段：Problem.hints） */
export function parseHints(input: string | null | undefined): string[] {
  return safeJsonParse<string[]>(input, [], 'hints')
}

// ---------- 学习路径相关 ----------

export interface LearningPathStep {
  id: number
  title?: string
  status: 'locked' | 'in_progress' | 'completed' | string
  [key: string]: unknown
}

/** 学习路径步骤数组（DB 字段：LearningPath.steps） */
export function parseLearningSteps(input: string | null | undefined): LearningPathStep[] {
  return safeJsonParse<LearningPathStep[]>(input, [], 'learning-steps')
}

// ---------- 面试相关 ----------

export interface InterviewMessageLite {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

/**
 * 面试对话消息数组（DB 字段：InterviewSession.messages）
 *
 * 注：DB 中 role 是 string，理论上可能写入"非法"值，但所有写入方都受控
 * （只有本仓库 `interviews/route` 和 `interviews/[id]/message` 两个入口在写）
 * 所以这里直接用字面量联合类型。如果未来发现脏数据，再加 runtime 校验。
 */
export function parseInterviewMessages(
  input: string | null | undefined,
): InterviewMessageLite[] {
  return safeJsonParse<InterviewMessageLite[]>(input, [], 'interview-messages')
}

export interface InterviewEvaluation {
  overallScore: number
  communication: number
  technicalDepth: number
  problemSolving: number
  feedback: string
  strengths: string[]
  improvements: string[]
}

/** 面试评估对象（DB 字段：InterviewSession.evaluation） */
export function parseInterviewEvaluation(
  input: string | null | undefined,
): InterviewEvaluation | null {
  return safeJsonParse<InterviewEvaluation | null>(input, null, 'interview-evaluation')
}

/** 面试模板话题数组（DB 字段：InterviewTemplate.topics） */
export function parseTopics(input: string | null | undefined): string[] {
  return safeJsonParse<string[]>(input, [], 'topics')
}
