// API 响应通用类型
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginationParams {
  page: number
  pageSize: number
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// 用户相关类型
export interface User {
  id: string
  email: string
  name: string | null
  image: string | null
  createdAt: string
  updatedAt: string
}

export interface RegisterRequest {
  email: string
  password: string
  name: string
}

// 能力雷达图类型
export interface CapabilityRadar {
  id: string
  userId: string
  basicSyntax: number        // 基础语法 0-100
  memoryManagement: number   // 内存管理 0-100
  dataStructures: number     // 数据结构与算法 0-100
  oop: number                // 面向对象设计 0-100
  stlLibrary: number         // STL/库使用 0-100
  systemProgramming: number  // 系统编程能力 0-100
  updatedAt: string
}

// 题目相关类型
export interface Problem {
  id: string
  title: string
  description: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  category: string
  tags: string[]
  testCases: TestCase[]
  hints?: string[]
  solution?: string
  acceptanceRate?: number
  createdAt: string
  updatedAt: string
}

export interface TestCase {
  input: string
  expectedOutput: string
  explanation?: string
}

export interface ProblemsFilter {
  category?: string
  difficulty?: string
  search?: string
  tags?: string[]
}

// 代码提交相关类型
export interface CodeSubmission {
  id: string
  userId: string
  problemId: string
  code: string
  language: 'c' | 'cpp'
  status: 'Passed' | 'Failed' | 'Error' | 'Running'
  aiReview?: AICodeReview
  testResults?: TestResult[]
  createdAt: string
}

export interface SubmitCodeRequest {
  problemId: string
  code: string
  language: 'c' | 'cpp'
}

export interface TestResult {
  testCaseIndex: number
  input: string
  expectedOutput: string
  actualOutput: string
  passed: boolean
  executionTime?: number
  memoryUsed?: number
  error?: string
}

export interface AICodeReview {
  overallScore: number  // 0-100
  feedback: string
  issues: CodeIssue[]
  suggestions: string[]
  strengths: string[]
}

export interface CodeIssue {
  type: 'error' | 'warning' | 'info'
  line: number
  message: string
  suggestion?: string
}

export interface RunCodeRequest {
  code: string
  language: 'c' | 'cpp'
  input?: string
}

export interface RunCodeResponse {
  output: string
  error?: string
  executionTime: number
  memoryUsed: number
}

// 面试会话相关类型
export interface InterviewSession {
  id: string
  userId: string
  title: string
  type: 'technical' | 'behavioral'
  status: 'active' | 'completed' | 'paused'
  templateId?: string
  messages: InterviewMessage[]
  evaluation?: InterviewEvaluation
  createdAt: string
  updatedAt: string
}

export interface InterviewMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

export interface InterviewEvaluation {
  overallScore: number  // 0-100
  communication: number
  technicalDepth: number
  problemSolving: number
  feedback: string
  strengths: string[]
  improvements: string[]
}

export interface CreateInterviewRequest {
  title: string
  type: 'technical' | 'behavioral'
  templateId?: string
}

export interface SendMessageRequest {
  sessionId: string
  message: string
}

export interface InterviewTemplate {
  id: string
  title: string
  description: string
  type: 'technical' | 'behavioral'
  difficulty: 'Easy' | 'Medium' | 'Hard'
  topics: string[]
  estimatedTime: string
}

// 学习路径相关类型
export interface LearningPath {
  id: string
  userId: string
  title: string
  description: string
  level: 'beginner' | 'intermediate' | 'advanced'
  steps: LearningStep[]
  currentStep: number
  progress: number  // 0-100
  status: 'active' | 'completed' | 'paused'
  estimatedHours: number
  createdAt: string
  updatedAt: string
}

export interface LearningStep {
  id: number
  title: string
  description: string
  content?: string
  duration: string  // e.g., "60分钟"
  status: 'locked' | 'in_progress' | 'completed'
  resources?: Resource[]
}

export interface Resource {
  type: 'video' | 'article' | 'exercise'
  title: string
  url: string
}

export interface UpdateProgressRequest {
  pathId: string
  stepId: number
  completed: boolean
}

// 知识库相关类型
export interface KnowledgeArticle {
  id: string
  title: string
  content: string
  category: string
  tags: string[]
  difficulty: 'Easy' | 'Medium' | 'Hard'
  views: number
  likes: number
  author?: string
  createdAt: string
  updatedAt: string
}

export interface ArticlesFilter {
  category?: string
  difficulty?: string
  search?: string
  tags?: string[]
}

export interface KnowledgeCategory {
  id: string
  name: string
  count: number
}

// 统计数据类型
export interface UserStats {
  problemsCompleted: number
  totalProblems: number
  studyHours: number
  passRate: number
  achievements: number
  streak: number  // 连续学习天数
  rank?: number
}

export interface ActivityLog {
  id: string
  userId: string
  type: 'problem' | 'interview' | 'learning' | 'achievement'
  title: string
  description: string
  metadata?: any
  createdAt: string
}
