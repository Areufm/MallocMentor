/**
 * API 服务层
 * 封装所有 API 调用
 */

import { get, post, del } from '@/lib/api-client'
import type {
  RegisterRequest,
  User,
  UserStats,
  Problem,
  PaginatedResponse,
  ProblemsFilter,
  SubmitCodeRequest,
  RunCodeRequest,
  RunCodeResponse,
  CodeSubmission,
  InterviewSession,
  CreateInterviewRequest,
  SendMessageRequest,
  InterviewMessage,
  InterviewTemplate,
  LearningPath,
  UpdateProgressRequest,
  KnowledgeArticle,
  ArticlesFilter,
  KnowledgeCategory,
  CapabilityRadar,
  ActivityLog,
} from '@/types/api'

// ============================================
// 认证相关（登录/登出由 NextAuth 管理）
// ============================================

export const authApi = {
  /**
   * 用户注册（NextAuth 不提供注册端点，需自行实现）
   */
  register: (data: RegisterRequest) =>
    post<User>('/auth/register', data),
}

// ============================================
// 用户相关
// ============================================

export const userApi = {
  /**
   * 获取用户统计数据
   */
  getStats: () => 
    get<UserStats>('/users/stats'),
}

// ============================================
// 题目相关
// ============================================

export const problemApi = {
  /**
   * 获取题目列表
   */
  getList: (params?: ProblemsFilter & { page?: number; pageSize?: number }) => 
    get<PaginatedResponse<Problem>>('/problems', params),

  /**
   * 获取题目详情
   */
  getById: (id: string) => 
    get<Problem>(`/problems/${id}`),
}

// ============================================
// 代码相关
// ============================================

export const codeApi = {
  /**
   * 运行代码
   */
  run: (data: RunCodeRequest) => 
    post<RunCodeResponse>('/code/run', data),

  /**
   * 提交代码
   */
  submit: (data: SubmitCodeRequest) => 
    post<CodeSubmission>('/code/submit', data),
}

// ============================================
// 面试相关
// ============================================

export const interviewApi = {
  /**
   * 获取面试会话列表
   */
  getList: () => 
    get<InterviewSession[]>('/interviews'),

  /**
   * 创建面试会话
   */
  create: (data: CreateInterviewRequest) => 
    post<InterviewSession>('/interviews', data),

  /**
   * 获取面试详情
   */
  getById: (id: string) => 
    get<InterviewSession>(`/interviews/${id}`),

  /**
   * 发送消息
   */
  sendMessage: (sessionId: string, data: SendMessageRequest) => 
    post<InterviewMessage>(`/interviews/${sessionId}/message`, data),

  /**
   * 删除面试会话
   */
  delete: (id: string) => 
    del<{ id: string }>(`/interviews/${id}`),

  /**
   * 获取面试模板列表
   */
  getTemplates: () => 
    get<InterviewTemplate[]>('/interviews/templates'),
}

// ============================================
// 学习路径相关
// ============================================

export const learningPathApi = {
  /**
   * 获取学习路径列表
   */
  getList: (userId?: string) => 
    get<LearningPath[]>('/learning-paths', userId ? { userId } : undefined),

  /**
   * 获取学习路径详情
   */
  getById: (id: string) => 
    get<LearningPath>(`/learning-paths/${id}`),

  /**
   * 更新学习进度
   */
  updateProgress: (pathId: string, data: UpdateProgressRequest) => 
    post<{ updated: boolean }>(`/learning-paths/${pathId}/progress`, data),
}

// ============================================
// 知识库相关
// ============================================

export const knowledgeApi = {
  /**
   * 获取文章列表
   */
  getList: (params?: ArticlesFilter & { page?: number; pageSize?: number }) => 
    get<PaginatedResponse<KnowledgeArticle>>('/knowledge', params),

  /**
   * 获取文章详情
   */
  getById: (id: string) => 
    get<KnowledgeArticle>(`/knowledge/${id}`),

  /**
   * 获取分类列表
   */
  getCategories: () => 
    get<KnowledgeCategory[]>('/knowledge/categories'),
}

// ============================================
// 能力雷达图相关
// ============================================

export const capabilityApi = {
  /**
   * 获取能力雷达图
   */
  get: (userId?: string) => 
    get<CapabilityRadar>('/capability-radar', userId ? { userId } : undefined),

  /**
   * 更新能力雷达图
   */
  update: (data: Partial<CapabilityRadar>) => 
    post<CapabilityRadar>('/capability-radar', data),
}

// ============================================
// 活动日志相关
// ============================================

export const activityApi = {
  /**
   * 获取活动日志
   */
  getList: (params?: { page?: number; pageSize?: number; type?: string; userId?: string }) => 
    get<PaginatedResponse<ActivityLog>>('/activities', params),
}

// ============================================
// 统一导出
// ============================================

const api = {
  auth: authApi,
  user: userApi,
  problem: problemApi,
  code: codeApi,
  interview: interviewApi,
  learningPath: learningPathApi,
  knowledge: knowledgeApi,
  capability: capabilityApi,
  activity: activityApi,
}

export default api
