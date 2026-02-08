/**
 * API Hooks
 * 基于 SWR 的数据获取 Hooks
 * 用于 Client Components
 */

import useSWR, { type SWRConfiguration } from 'swr'
import api from '@/lib/api'
import type {
  Problem,
  InterviewSession,
  LearningPath,
  KnowledgeArticle,
  CapabilityRadar,
  UserStats,
  ActivityLog,
  InterviewTemplate,
  PaginatedResponse,
} from '@/types/api'

// ============================================
// 通用 Hooks
// ============================================

/**
 * 通用 SWR Hook
 */
export function useApi<T>(
  key: string | null,
  fetcher: () => Promise<any>,
  config?: SWRConfiguration
) {
  const { data, error, isLoading, mutate } = useSWR(
    key,
    async () => {
      const response = await fetcher()
      return response.data
    },
    {
      revalidateOnFocus: false,
      ...config,
    }
  )

  return {
    data: data as T | undefined,
    error,
    isLoading,
    mutate,
  }
}

// ============================================
// 用户相关 Hooks
// ============================================

/**
 * 获取用户统计数据
 */
export function useUserStats() {
  return useApi<UserStats>(
    '/users/stats',
    () => api.user.getStats()
  )
}

/**
 * 获取当前用户
 */
export function useCurrentUser() {
  return useApi(
    '/auth/me',
    () => api.auth.getCurrentUser()
  )
}

// ============================================
// 题目相关 Hooks
// ============================================

/**
 * 获取题目列表
 */
export function useProblems(params?: {
  page?: number
  pageSize?: number
  category?: string
  difficulty?: string
  search?: string
}) {
  const key = params 
    ? `/problems?${new URLSearchParams(params as any).toString()}`
    : '/problems'

  return useApi<PaginatedResponse<Problem>>(
    key,
    () => api.problem.getList(params)
  )
}

/**
 * 获取题目详情
 */
export function useProblem(id: string | null) {
  return useApi<Problem>(
    id ? `/problems/${id}` : null,
    () => api.problem.getById(id!)
  )
}

// ============================================
// 面试相关 Hooks
// ============================================

/**
 * 获取面试会话列表
 */
export function useInterviews() {
  return useApi<InterviewSession[]>(
    '/interviews',
    () => api.interview.getList()
  )
}

/**
 * 获取面试详情
 */
export function useInterview(id: string | null) {
  return useApi<InterviewSession>(
    id ? `/interviews/${id}` : null,
    () => api.interview.getById(id!)
  )
}

/**
 * 获取面试模板
 */
export function useInterviewTemplates() {
  return useApi<InterviewTemplate[]>(
    '/interviews/templates',
    () => api.interview.getTemplates()
  )
}

// ============================================
// 学习路径相关 Hooks
// ============================================

/**
 * 获取学习路径列表
 */
export function useLearningPaths(userId?: string) {
  const key = userId ? `/learning-paths?userId=${userId}` : '/learning-paths'
  
  return useApi<LearningPath[]>(
    key,
    () => api.learningPath.getList(userId)
  )
}

/**
 * 获取学习路径详情
 */
export function useLearningPath(id: string | null) {
  return useApi<LearningPath>(
    id ? `/learning-paths/${id}` : null,
    () => api.learningPath.getById(id!)
  )
}

// ============================================
// 知识库相关 Hooks
// ============================================

/**
 * 获取知识文章列表
 */
export function useKnowledgeArticles(params?: {
  page?: number
  pageSize?: number
  category?: string
  difficulty?: string
  search?: string
}) {
  const key = params 
    ? `/knowledge?${new URLSearchParams(params as any).toString()}`
    : '/knowledge'

  return useApi<PaginatedResponse<KnowledgeArticle>>(
    key,
    () => api.knowledge.getList(params)
  )
}

/**
 * 获取知识文章详情
 */
export function useKnowledgeArticle(id: string | null) {
  return useApi<KnowledgeArticle>(
    id ? `/knowledge/${id}` : null,
    () => api.knowledge.getById(id!)
  )
}

/**
 * 获取知识库分类
 */
export function useKnowledgeCategories() {
  return useApi(
    '/knowledge/categories',
    () => api.knowledge.getCategories()
  )
}

// ============================================
// 能力雷达图相关 Hooks
// ============================================

/**
 * 获取能力雷达图
 */
export function useCapabilityRadar(userId?: string) {
  const key = userId ? `/capability-radar?userId=${userId}` : '/capability-radar'
  
  return useApi<CapabilityRadar>(
    key,
    () => api.capability.get(userId)
  )
}

// ============================================
// 活动日志相关 Hooks
// ============================================

/**
 * 获取活动日志
 */
export function useActivities(params?: {
  page?: number
  pageSize?: number
  type?: string
  userId?: string
}) {
  const key = params 
    ? `/activities?${new URLSearchParams(params as any).toString()}`
    : '/activities'

  return useApi<PaginatedResponse<ActivityLog>>(
    key,
    () => api.activity.getList(params)
  )
}
