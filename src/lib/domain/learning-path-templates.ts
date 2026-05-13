/**
 * 学习路径模板系统
 *
 * 定义 5 条预设路径，按分类对应知识库文章，形成阶梯式学习体系。
 * 每条路径完成后自动解锁下一条。
 */

export interface StepTemplate {
  id: number
  title: string
  description: string
  duration: string
  articleSlug: string
}

export interface PathTemplate {
  /** 唯一模板标识，如 "basics" */
  templateId: string
  /** 路径阶段序号 (1-based) */
  order: number
  title: string
  description: string
  /** 前置路径的 templateId，null 表示无前置 */
  prerequisite: string | null
  steps: StepTemplate[]
}

export const LEARNING_PATH_TEMPLATES: PathTemplate[] = [
  {
    templateId: 'basics',
    order: 1,
    title: 'C++ 基础入门',
    description: '从零开始学习 C++ 基本语法，掌握数据类型、控制流和函数等核心概念',
    prerequisite: null,
    steps: [
      { id: 1, title: 'C++ 简介与环境搭建', description: '了解 C++ 历史、特性，搭建开发环境', duration: '15分钟', articleSlug: 'cpp-intro' },
      { id: 2, title: '基本数据类型和变量', description: '学习 C++ 的基本数据类型、变量声明和初始化', duration: '20分钟', articleSlug: 'data-types' },
      { id: 3, title: '控制流语句', description: '掌握 if、switch、循环等控制流语句', duration: '25分钟', articleSlug: 'control-flow' },
      { id: 4, title: '函数与参数传递', description: '理解函数定义、参数传递方式、返回值', duration: '30分钟', articleSlug: 'functions' },
    ],
  },
  {
    templateId: 'pointer',
    order: 2,
    title: '指针与内存管理',
    description: '深入理解 C++ 指针机制与内存管理，掌握智能指针的正确使用',
    prerequisite: 'basics',
    steps: [
      { id: 1, title: '指针基础', description: '深入理解指针的概念、使用和常见陷阱', duration: '40分钟', articleSlug: 'pointer-basics' },
      { id: 2, title: '智能指针', description: '掌握 unique_ptr、shared_ptr、weak_ptr', duration: '45分钟', articleSlug: 'smart-pointers' },
      { id: 3, title: '内存管理', description: '理解堆栈分配、内存泄漏检测与 RAII 模式', duration: '40分钟', articleSlug: 'memory-management' },
    ],
  },
  {
    templateId: 'oop',
    order: 3,
    title: '面向对象编程',
    description: '学习 C++ 面向对象的三大特性：封装、继承与多态',
    prerequisite: 'pointer',
    steps: [
      { id: 1, title: '类与对象', description: '掌握类的定义、构造/析构函数、访问控制', duration: '35分钟', articleSlug: 'classes-and-objects' },
      { id: 2, title: '继承', description: '理解单继承、多继承及其内存模型', duration: '35分钟', articleSlug: 'inheritance' },
      { id: 3, title: '多态', description: '掌握虚函数、动态绑定与 RTTI', duration: '40分钟', articleSlug: 'polymorphism' },
    ],
  },
  {
    templateId: 'stl',
    order: 4,
    title: 'STL 标准库',
    description: '熟练使用 C++ 标准模板库中的容器、迭代器和算法',
    prerequisite: 'oop',
    steps: [
      { id: 1, title: 'STL 容器', description: '掌握 vector、map、set 等核心容器', duration: '40分钟', articleSlug: 'stl-containers' },
      { id: 2, title: '迭代器', description: '理解迭代器分类及其使用模式', duration: '30分钟', articleSlug: 'iterators' },
      { id: 3, title: '算法', description: '学习 sort、find、transform 等常用算法', duration: '35分钟', articleSlug: 'algorithms' },
    ],
  },
  {
    templateId: 'concurrency',
    order: 5,
    title: '并发编程',
    description: '掌握 C++ 多线程编程基础，理解线程同步与互斥机制',
    prerequisite: 'stl',
    steps: [
      { id: 1, title: '线程基础', description: '学习 std::thread 创建与管理线程', duration: '35分钟', articleSlug: 'threads-basics' },
      { id: 2, title: '互斥锁与同步', description: '掌握 mutex、lock_guard、条件变量', duration: '40分钟', articleSlug: 'mutex-and-locks' },
    ],
  },
]

/** 根据 templateId 查找模板 */
export function getTemplate(templateId: string): PathTemplate | undefined {
  return LEARNING_PATH_TEMPLATES.find(t => t.templateId === templateId)
}

/** 获取某模板的下一个模板 */
export function getNextTemplate(templateId: string): PathTemplate | undefined {
  const current = getTemplate(templateId)
  if (!current) return undefined
  return LEARNING_PATH_TEMPLATES.find(t => t.order === current.order + 1)
}

/**
 * 将模板步骤转换为数据库存储格式
 * 第一步为 in_progress，其余 locked
 */
export function buildStepsJson(template: PathTemplate): string {
  const steps = template.steps.map((s, i) => ({
    ...s,
    status: i === 0 ? 'in_progress' : 'locked',
  }))
  return JSON.stringify(steps)
}
