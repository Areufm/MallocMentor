// Mock 数据生成工具
import type {
  User,
  Problem,
  InterviewSession,
  LearningPath,
  KnowledgeArticle,
  CapabilityRadar,
  UserStats,
  ActivityLog,
  InterviewTemplate,
} from '@/types/api'

// Mock 用户数据
export const mockUsers: User[] = [
  {
    id: '1',
    email: 'demo@example.com',
    name: '张三',
    image: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

// Mock 能力雷达图数据
export const mockCapabilityRadar: CapabilityRadar = {
  id: '1',
  userId: '1',
  basicSyntax: 85,
  memoryManagement: 65,
  dataStructures: 90,
  oop: 75,
  stlLibrary: 80,
  systemProgramming: 60,
  updatedAt: new Date().toISOString(),
}

// Mock 题目数据
export const mockProblems: Problem[] = [
  {
    id: '1',
    title: '两数之和',
    description: `给定一个整数数组 nums 和一个整数目标值 target，请你在该数组中找出和为目标值 target 的那两个整数，并返回它们的数组下标。

你可以假设每种输入只会对应一个答案。但是，数组中同一个元素在答案里不能重复出现。

你可以按任意顺序返回答案。`,
    difficulty: 'Easy',
    category: '数组',
    tags: ['数组', '哈希表'],
    testCases: [
      {
        input: 'nums = [2,7,11,15], target = 9',
        expectedOutput: '[0,1]',
        explanation: '因为 nums[0] + nums[1] == 9 ，返回 [0, 1]',
      },
      {
        input: 'nums = [3,2,4], target = 6',
        expectedOutput: '[1,2]',
      },
      {
        input: 'nums = [3,3], target = 6',
        expectedOutput: '[0,1]',
      },
    ],
    hints: ['可以使用哈希表来存储已经遍历过的数字', '时间复杂度可以优化到 O(n)'],
    acceptanceRate: 85,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    title: '链表反转',
    description: '给你单链表的头节点 head ，请你反转链表，并返回反转后的链表。',
    difficulty: 'Easy',
    category: '链表',
    tags: ['链表', '指针', '递归'],
    testCases: [
      {
        input: 'head = [1,2,3,4,5]',
        expectedOutput: '[5,4,3,2,1]',
      },
    ],
    hints: ['可以使用迭代或递归方法', '注意保存下一个节点的指针'],
    acceptanceRate: 78,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    title: '智能指针实现',
    description: '实现一个简单的 unique_ptr 智能指针类，支持基本的 RAII 机制。',
    difficulty: 'Medium',
    category: '内存管理',
    tags: ['C++', '智能指针', 'RAII'],
    testCases: [],
    hints: ['需要实现构造函数、析构函数和移动语义', '禁止拷贝构造和拷贝赋值'],
    acceptanceRate: 62,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

// Mock 面试模板数据
export const mockInterviewTemplates: InterviewTemplate[] = [
  {
    id: 'cpp-basics',
    title: 'C++ 基础面试',
    description: '涵盖 C++ 基础语法、类与对象、继承多态等核心概念',
    type: 'technical',
    difficulty: 'Easy',
    topics: ['语法基础', '面向对象', '继承多态'],
    estimatedTime: '30-45分钟',
  },
  {
    id: 'memory-management',
    title: '内存管理专项',
    description: '深入考察指针、内存分配、智能指针、RAII等内存相关知识',
    type: 'technical',
    difficulty: 'Medium',
    topics: ['指针', '智能指针', 'RAII', '内存泄漏'],
    estimatedTime: '40-60分钟',
  },
  {
    id: 'stl-advanced',
    title: 'STL 深度剖析',
    description: 'STL 容器底层实现、迭代器失效、算法复杂度分析',
    type: 'technical',
    difficulty: 'Medium',
    topics: ['容器', '迭代器', '算法', '性能优化'],
    estimatedTime: '45-60分钟',
  },
  {
    id: 'concurrency',
    title: '并发编程挑战',
    description: '多线程、线程同步、死锁、条件变量、原子操作等高级主题',
    type: 'technical',
    difficulty: 'Hard',
    topics: ['多线程', '互斥锁', '条件变量', '原子操作'],
    estimatedTime: '60-90分钟',
  },
]

// Mock 面试会话数据
export const mockInterviewSessions: InterviewSession[] = [
  {
    id: '1',
    userId: '1',
    title: 'C++ 智能指针与内存管理',
    type: 'technical',
    status: 'completed',
    messages: [
      {
        id: '1',
        role: 'assistant',
        content: '你好！今天我们将进行一场关于 C++ 智能指针和内存管理的技术面试。',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: '2',
        role: 'user',
        content: '好的，我准备好了。',
        timestamp: new Date(Date.now() - 3500000).toISOString(),
      },
    ],
    evaluation: {
      overallScore: 85,
      communication: 88,
      technicalDepth: 82,
      problemSolving: 85,
      feedback: '表现优秀，对智能指针的理解深入，能够准确回答底层原理问题。',
      strengths: ['概念理解清晰', '能够结合实际案例', '代码规范'],
      improvements: ['可以更深入理解 weak_ptr 的使用场景', '对循环引用的处理需要加强'],
    },
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 82800000).toISOString(),
  },
]

// Mock 学习路径数据
export const mockLearningPaths: LearningPath[] = [
  {
    id: '1',
    userId: '1',
    title: 'C++ 从入门到精通',
    description: '系统学习 C++ 编程语言，掌握核心概念和最佳实践',
    level: 'beginner',
    steps: [
      {
        id: 1,
        title: 'C++ 简介与环境搭建',
        description: '了解 C++ 历史、特性，搭建开发环境',
        duration: '30分钟',
        status: 'completed',
      },
      {
        id: 2,
        title: '基本数据类型和变量',
        description: '学习 C++ 的基本数据类型、变量声明和初始化',
        duration: '45分钟',
        status: 'completed',
      },
      {
        id: 3,
        title: '控制流语句',
        description: '掌握 if、switch、循环等控制流语句',
        duration: '60分钟',
        status: 'completed',
      },
      {
        id: 4,
        title: '函数与参数传递',
        description: '理解函数定义、参数传递方式、返回值',
        duration: '90分钟',
        status: 'completed',
      },
      {
        id: 5,
        title: '指针基础',
        description: '深入理解指针的概念、使用和常见陷阱',
        duration: '120分钟',
        status: 'in_progress',
      },
      {
        id: 6,
        title: '引用与指针对比',
        description: '理解引用的概念，对比引用和指针的区别',
        duration: '60分钟',
        status: 'locked',
      },
    ],
    currentStep: 5,
    progress: 40,
    status: 'active',
    estimatedHours: 40,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    userId: '1',
    title: '数据结构与算法',
    description: '使用 C++ 实现经典数据结构和算法',
    level: 'intermediate',
    steps: [],
    currentStep: 0,
    progress: 0,
    status: 'active',
    estimatedHours: 50,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

// Mock 知识库文章数据
export const mockKnowledgeArticles: KnowledgeArticle[] = [
  {
    id: '1',
    title: 'C++ 智能指针完全指南',
    content: '# C++ 智能指针完全指南\n\n智能指针是 C++11 引入的重要特性...',
    category: 'pointer',
    tags: ['智能指针', 'RAII', '内存管理'],
    difficulty: 'Medium',
    views: 1523,
    likes: 234,
    author: 'C++ 专家',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: '2',
    title: 'STL 容器底层实现原理',
    content: '# STL 容器底层实现原理\n\nvector、list、map 等常用容器的内部结构...',
    category: 'stl',
    tags: ['STL', '容器', '数据结构'],
    difficulty: 'Medium',
    views: 2103,
    likes: 312,
    author: 'STL 大师',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
]

// Mock 用户统计数据
export const mockUserStats: UserStats = {
  problemsCompleted: 48,
  totalProblems: 156,
  studyHours: 127,
  passRate: 78,
  achievements: 15,
  streak: 7,
  rank: 238,
}

// Mock 活动日志数据
export const mockActivities: ActivityLog[] = [
  {
    id: '1',
    userId: '1',
    type: 'problem',
    title: '完成了《链表反转》',
    description: '通过率：100%，用时：15分钟',
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: '2',
    userId: '1',
    type: 'interview',
    title: '参与了模拟面试',
    description: '技术面试 - C++并发编程',
    createdAt: new Date(Date.now() - 18000000).toISOString(),
  },
  {
    id: '3',
    userId: '1',
    type: 'learning',
    title: '学习了新知识',
    description: '智能指针与RAII机制',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
]

// 工具函数：生成 API 响应
export function createSuccessResponse<T>(data: T, message?: string) {
  return {
    success: true,
    data,
    message,
  }
}

export function createErrorResponse(error: string, message?: string) {
  return {
    success: false,
    error,
    message,
  }
}

// 工具函数：分页
export function paginate<T>(items: T[], page: number = 1, pageSize: number = 10) {
  const total = items.length
  const totalPages = Math.ceil(total / pageSize)
  const start = (page - 1) * pageSize
  const end = start + pageSize
  const data = items.slice(start, end)

  return {
    data,
    total,
    page,
    pageSize,
    totalPages,
  }
}

// 工具函数：延迟（模拟网络请求）
export function delay(ms: number = 500) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
