/**
 * Client-side data layer.
 *
 * 1. 提供基于 SWR 的查询 hook（GET）
 * 2. 提供 useApiMutation 处理变更（POST/PATCH/DELETE/PUT）
 * 3. 内置 ApiError 与统一 fetch 工具，client 端无需再依赖 lib/api-client / lib/api
 *
 * 所有 hook 暴露的 data 都是已剥离 ApiResponse 信封的纯业务对象。
 */

import { useCallback, useState } from 'react'
import useSWR, { mutate as globalMutate, type SWRConfiguration } from 'swr'
import type {
  ApiResponse,
  Achievement,
  AchievementsResponse,
  ActivityLog,
  CapabilityRadar,
  CodeSubmission,
  CreateInterviewRequest,
  InterviewEvaluation,
  InterviewMessage,
  InterviewSession,
  InterviewStats,
  InterviewTemplate,
  KnowledgeArticle,
  KnowledgeCategory,
  LearningPath,
  PaginatedResponse,
  Problem,
  RegisterRequest,
  RunCodeRequest,
  RunCodeResponse,
  SendMessageRequest,
  SubmitCodeRequest,
  UpdateProgressRequest,
  User,
  UserStats,
} from '@/types/api'

// ============================================
// Fetch 工具 + ApiError
// ============================================

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api'

export class ApiError extends Error {
  readonly status: number
  readonly data?: unknown

  constructor(message: string, status: number, data?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

function buildUrl(endpoint: string, params?: Record<string, unknown>): string {
  const base = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  const fullUrl = `${base}${path}`
  if (!params) return fullUrl

  const searchParams = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) searchParams.append(key, String(value))
  }
  const qs = searchParams.toString()
  return qs ? `${fullUrl}?${qs}` : fullUrl
}

interface ApiFetchOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: unknown
  params?: Record<string, unknown>
  headers?: HeadersInit
  /** 当 body 为 FormData 时设为 true，跳过 JSON 序列化与 Content-Type */
  isFormData?: boolean
}

/**
 * 统一的 client-side API fetch
 * - 自动 JSON 序列化 / 解析
 * - 失败时抛出 ApiError
 */
export async function apiFetch<T>(endpoint: string, options: ApiFetchOptions = {}): Promise<T> {
  const { method = 'GET', body, params, headers, isFormData } = options
  const url = buildUrl(endpoint, params)

  const finalHeaders: HeadersInit = isFormData
    ? { ...(headers ?? {}) }
    : { 'Content-Type': 'application/json', ...(headers ?? {}) }

  const init: RequestInit = { method, headers: finalHeaders }
  if (body !== undefined) {
    init.body = isFormData ? (body as BodyInit) : JSON.stringify(body)
  }

  let res: Response
  try {
    res = await fetch(url, init)
  } catch (err) {
    throw new ApiError(err instanceof Error ? err.message : '网络错误', 0)
  }

  let payload: ApiResponse<T> | { error?: string; message?: string } | null = null
  try {
    payload = (await res.json()) as ApiResponse<T>
  } catch {
    // body 可能为空或非 JSON
  }

  if (!res.ok) {
    const message =
      (payload && (('error' in payload && payload.error) || ('message' in payload && payload.message))) ||
      `请求失败 (${res.status})`
    throw new ApiError(message as string, res.status, payload)
  }

  if (payload && typeof payload === 'object' && 'success' in payload) {
    if (!payload.success) {
      throw new ApiError(payload.error || payload.message || '请求失败', res.status, payload)
    }
    return payload.data as T
  }
  return payload as T
}

// ============================================
// SWR Key 常量（集中管理便于精确 invalidate）
// ============================================

export const SWR_KEYS = {
  userStats: '/users/stats',
  capabilityRadar: (userId?: string) =>
    userId ? `/capability-radar?userId=${userId}` : '/capability-radar',
  activities: (params?: Record<string, unknown>) =>
    params ? `/activities?${new URLSearchParams(params as Record<string, string>).toString()}` : '/activities',
  problems: (params?: Record<string, unknown>) =>
    params ? `/problems?${new URLSearchParams(params as Record<string, string>).toString()}` : '/problems',
  problem: (id: string) => `/problems/${id}`,
  submissionStatus: '/code/submission-status',
  interviews: '/interviews',
  interview: (id: string) => `/interviews/${id}`,
  interviewStats: '/interviews/stats',
  interviewTemplates: '/interviews/templates',
  learningPaths: (userId?: string) =>
    userId ? `/learning-paths?userId=${userId}` : '/learning-paths',
  learningPath: (id: string) => `/learning-paths/${id}`,
  knowledgeArticles: (params?: Record<string, unknown>) =>
    params ? `/knowledge?${new URLSearchParams(params as Record<string, string>).toString()}` : '/knowledge',
  knowledgeArticle: (id: string) => `/knowledge/${id}`,
  knowledgeCategories: '/knowledge/categories',
  knowledgeFavorites: (params?: Record<string, unknown>) =>
    params ? `/knowledge/favorites?${new URLSearchParams(params as Record<string, string>).toString()}` : '/knowledge/favorites',
  knowledgeFavoriteStatus: (id: string) => `/knowledge/${id}/favorite`,
  achievements: '/achievements',
} as const

// ============================================
// 通用查询 Hook
// ============================================

/**
 * 包装 useSWR：key 即 endpoint，可附带查询参数
 */
export function useApi<T>(
  key: string | null,
  params?: Record<string, unknown>,
  config?: SWRConfiguration<T, ApiError>,
) {
  const swrKey = key ? (params ? [key, params] : key) : null

  const { data, error, isLoading, mutate } = useSWR<T, ApiError>(
    swrKey,
    () => apiFetch<T>(key as string, { params }),
    {
      revalidateOnFocus: false,
      ...config,
    },
  )

  return { data, error, isLoading, mutate }
}

// ============================================
// 通用变更 Hook
// ============================================

interface UseApiMutationOptions<TData, TVar> {
  onSuccess?: (data: TData, variables: TVar) => void | Promise<void>
  onError?: (err: ApiError, variables: TVar) => void | Promise<void>
  /** 触发成功后需要 revalidate 的 SWR key 列表（支持函数返回） */
  invalidateKeys?: string[] | ((data: TData, variables: TVar) => string[])
}

interface UseApiMutationResult<TData, TVar> {
  trigger: (variables: TVar) => Promise<TData>
  data: TData | undefined
  error: ApiError | null
  isLoading: boolean
  reset: () => void
}

/**
 * 通用 mutation hook，配合 invalidateKeys 自动刷新缓存
 */
export function useApiMutation<TData, TVar = void>(
  mutator: (variables: TVar) => Promise<TData>,
  options?: UseApiMutationOptions<TData, TVar>,
): UseApiMutationResult<TData, TVar> {
  const [data, setData] = useState<TData | undefined>(undefined)
  const [error, setError] = useState<ApiError | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const trigger = useCallback(
    async (variables: TVar) => {
      setIsLoading(true)
      setError(null)
      try {
        const result = await mutator(variables)
        setData(result)
        const keys =
          typeof options?.invalidateKeys === 'function'
            ? options.invalidateKeys(result, variables)
            : options?.invalidateKeys
        if (keys && keys.length > 0) {
          await Promise.all(
            keys.map((k) =>
              globalMutate((swrKey) => {
                if (typeof swrKey === 'string') return swrKey === k || swrKey.startsWith(`${k}?`)
                if (Array.isArray(swrKey) && typeof swrKey[0] === 'string') {
                  return swrKey[0] === k || swrKey[0].startsWith(`${k}?`)
                }
                return false
              }),
            ),
          )
        }
        await options?.onSuccess?.(result, variables)
        return result
      } catch (err) {
        const apiErr = err instanceof ApiError ? err : new ApiError(err instanceof Error ? err.message : '未知错误', 0)
        setError(apiErr)
        await options?.onError?.(apiErr, variables)
        throw apiErr
      } finally {
        setIsLoading(false)
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  const reset = useCallback(() => {
    setData(undefined)
    setError(null)
    setIsLoading(false)
  }, [])

  return { trigger, data, error, isLoading, reset }
}

// ============================================
// 用户相关
// ============================================

export function useUserStats() {
  return useApi<UserStats>(SWR_KEYS.userStats)
}

interface UpdateProfilePayload {
  name?: string
  image?: string
  currentPassword?: string
  newPassword?: string
}

export function useUpdateProfile() {
  return useApiMutation<User, UpdateProfilePayload>(
    (payload) => apiFetch<User>('/user/update', { method: 'PATCH', body: payload }),
  )
}

export function useUploadAvatar() {
  return useApiMutation<{ url: string }, File>((file) => {
    const formData = new FormData()
    formData.append('file', file)
    return apiFetch<{ url: string }>('/upload', { method: 'POST', body: formData, isFormData: true })
  })
}

export function useRegister() {
  return useApiMutation<User, RegisterRequest>(
    (payload) => apiFetch<User>('/auth/register', { method: 'POST', body: payload }),
  )
}

// ============================================
// 题目 / 代码
// ============================================

interface ProblemsParams {
  page?: number
  pageSize?: number
  category?: string
  difficulty?: string
  search?: string
}

export function useProblems(params?: ProblemsParams) {
  return useApi<PaginatedResponse<Problem>>(SWR_KEYS.problems(), params as Record<string, unknown> | undefined)
}

export function useProblem(id: string | null) {
  return useApi<Problem>(id ? SWR_KEYS.problem(id) : null)
}

export function useSubmissionStatus() {
  return useApi<Record<string, 'passed' | 'failed'>>(SWR_KEYS.submissionStatus)
}

export function useGenerateProblem() {
  return useApiMutation<{ count: number; problems: string[] }, { category?: string; difficulty?: string; count?: number }>(
    (payload) => apiFetch<{ count: number; problems: string[] }>('/problems/generate', { method: 'POST', body: payload }),
    { invalidateKeys: [SWR_KEYS.problems()] },
  )
}

export function useRunCode() {
  return useApiMutation<RunCodeResponse, RunCodeRequest>(
    (payload) => apiFetch<RunCodeResponse>('/code/run', { method: 'POST', body: payload }),
  )
}

export function useSubmitCode() {
  return useApiMutation<CodeSubmission, SubmitCodeRequest>(
    (payload) => apiFetch<CodeSubmission>('/code/submit', { method: 'POST', body: payload }),
    { invalidateKeys: [SWR_KEYS.submissionStatus] },
  )
}

// ============================================
// 面试
// ============================================

export function useInterviews() {
  return useApi<InterviewSession[]>(SWR_KEYS.interviews)
}

export function useInterview(id: string | null) {
  return useApi<InterviewSession>(id ? SWR_KEYS.interview(id) : null)
}

export function useInterviewTemplates() {
  return useApi<InterviewTemplate[]>(SWR_KEYS.interviewTemplates)
}

export function useInterviewStats() {
  return useApi<InterviewStats>(SWR_KEYS.interviewStats)
}

export function useCreateInterview() {
  return useApiMutation<InterviewSession, CreateInterviewRequest>(
    (payload) => apiFetch<InterviewSession>('/interviews', { method: 'POST', body: payload }),
    { invalidateKeys: [SWR_KEYS.interviews] },
  )
}

export function useEndInterview() {
  return useApiMutation<{ id: string; status: string; evaluation: InterviewEvaluation }, string>(
    (id) =>
      apiFetch<{ id: string; status: string; evaluation: InterviewEvaluation }>(
        `/interviews/${id}/end`,
        { method: 'POST', body: {} },
      ),
    {
      invalidateKeys: (_data, id) => [SWR_KEYS.interview(id), SWR_KEYS.interviews, SWR_KEYS.interviewStats],
    },
  )
}

export function useDeleteInterview() {
  return useApiMutation<{ id: string }, string>(
    (id) => apiFetch<{ id: string }>(`/interviews/${id}`, { method: 'DELETE' }),
    { invalidateKeys: [SWR_KEYS.interviews] },
  )
}

// 注意：发送面试消息走 SSE，不在此封装；ChatWindow 内部直接 fetch。

// ============================================
// 学习路径
// ============================================

export function useLearningPaths(userId?: string) {
  return useApi<LearningPath[]>(SWR_KEYS.learningPaths(userId))
}

export function useLearningPath(id: string | null) {
  return useApi<LearningPath>(id ? SWR_KEYS.learningPath(id) : null)
}

export function useStartLearningPath() {
  return useApiMutation<LearningPath, string>(
    (templateId) => apiFetch<LearningPath>('/learning-paths', { method: 'POST', body: { templateId } }),
    { invalidateKeys: [SWR_KEYS.learningPaths()] },
  )
}

interface UpdateLearningProgressVars {
  pathId: string
  data: UpdateProgressRequest
}

export function useUpdateLearningProgress() {
  return useApiMutation<
    { updated: boolean; progress: number; currentStep: number; pathCompleted: boolean; nextPathCreated: boolean },
    UpdateLearningProgressVars
  >(
    ({ pathId, data }) =>
      apiFetch(`/learning-paths/${pathId}/progress`, { method: 'POST', body: data }),
    { invalidateKeys: [SWR_KEYS.learningPaths()] },
  )
}

interface RecommendationData {
  focusAreas: string[]
  reason: string
  suggestedTemplateId: string | null
  customSteps?: Array<{ title: string; description: string; duration: string }>
}

export function useGetLearningRecommendation() {
  return useApiMutation<RecommendationData, void>(
    () => apiFetch<RecommendationData>('/learning-paths/recommend', { method: 'POST', body: {} }),
  )
}

// ============================================
// 知识库
// ============================================

interface ArticlesParams {
  page?: number
  pageSize?: number
  category?: string
  difficulty?: string
  search?: string
  sort?: string
}

export function useKnowledgeArticles(params?: ArticlesParams) {
  return useApi<PaginatedResponse<KnowledgeArticle>>(
    SWR_KEYS.knowledgeArticles(),
    params as Record<string, unknown> | undefined,
  )
}

export function useKnowledgeArticle(id: string | null) {
  return useApi<KnowledgeArticle>(id ? SWR_KEYS.knowledgeArticle(id) : null)
}

export function useKnowledgeCategories() {
  return useApi<KnowledgeCategory[]>(SWR_KEYS.knowledgeCategories)
}

export function useKnowledgeFavorites(params?: { page?: number; pageSize?: number }) {
  return useApi<PaginatedResponse<KnowledgeArticle>>(
    SWR_KEYS.knowledgeFavorites(),
    params as Record<string, unknown> | undefined,
  )
}

export function useKnowledgeFavoriteStatus(articleId: string | null) {
  return useApi<{ favorited: boolean }>(articleId ? SWR_KEYS.knowledgeFavoriteStatus(articleId) : null)
}

export function useToggleFavorite() {
  return useApiMutation<{ favorited: boolean }, string>(
    (articleId) =>
      apiFetch<{ favorited: boolean }>(`/knowledge/${articleId}/favorite`, { method: 'POST', body: {} }),
    {
      invalidateKeys: (_data, articleId) => [
        SWR_KEYS.knowledgeFavoriteStatus(articleId),
        SWR_KEYS.knowledgeFavorites(),
        SWR_KEYS.knowledgeArticles(),
        SWR_KEYS.knowledgeArticle(articleId),
      ],
    },
  )
}

// ============================================
// 能力雷达图
// ============================================

export function useCapabilityRadar(userId?: string) {
  return useApi<CapabilityRadar>(SWR_KEYS.capabilityRadar(userId))
}

// ============================================
// 活动日志
// ============================================

interface ActivitiesParams {
  page?: number
  pageSize?: number
  type?: string
  userId?: string
}

export function useActivities(params?: ActivitiesParams) {
  return useApi<PaginatedResponse<ActivityLog>>(
    SWR_KEYS.activities(),
    params as Record<string, unknown> | undefined,
  )
}

// ============================================
// 成就
// ============================================

export function useAchievements() {
  return useApi<AchievementsResponse>(SWR_KEYS.achievements)
}

// 重新导出常用类型，避免 page 文件四处 import
export type { Achievement, InterviewMessage, SendMessageRequest }

