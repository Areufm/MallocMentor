import 'dotenv/config'
import pg from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../src/generated/prisma/client.js'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 开始数据库 Seed...')

  // ===== 知识库分类 =====
  const categories = [
    { name: 'basics', label: '基础语法', icon: 'Code', description: 'C/C++ 基础语法与概念', sortOrder: 1 },
    { name: 'pointer', label: '指针与内存', icon: 'Target', description: '指针操作、内存管理、智能指针', sortOrder: 2 },
    { name: 'oop', label: '面向对象', icon: 'Boxes', description: '类与对象、继承、多态、设计模式', sortOrder: 3 },
    { name: 'stl', label: 'STL 标准库', icon: 'Library', description: 'STL 容器、算法、迭代器', sortOrder: 4 },
    { name: 'concurrency', label: '并发编程', icon: 'Cpu', description: '多线程、同步机制、原子操作', sortOrder: 5 },
    { name: 'system', label: '系统编程', icon: 'Monitor', description: '系统调用、文件IO、网络编程', sortOrder: 6 },
  ]

  for (const cat of categories) {
    await prisma.knowledgeCategory.upsert({
      where: { name: cat.name },
      update: { label: cat.label, icon: cat.icon, description: cat.description, sortOrder: cat.sortOrder },
      create: cat,
    })
  }
  console.log(`  ✅ ${categories.length} 个知识库分类`)

  // ===== 面试模板 =====
  const templates = [
    {
      id: 'cpp-basics',
      title: 'C++ 基础面试',
      description: '涵盖 C++ 基础语法、类与对象、继承多态等核心概念',
      type: 'technical',
      difficulty: 'Easy',
      topics: JSON.stringify(['语法基础', '面向对象', '继承多态']),
      estimatedTime: '30-45分钟',
    },
    {
      id: 'memory-management',
      title: '内存管理专项',
      description: '深入考察指针、内存分配、智能指针、RAII等内存相关知识',
      type: 'technical',
      difficulty: 'Medium',
      topics: JSON.stringify(['指针', '智能指针', 'RAII', '内存泄漏']),
      estimatedTime: '40-60分钟',
    },
    {
      id: 'stl-advanced',
      title: 'STL 深度剖析',
      description: 'STL 容器底层实现、迭代器失效、算法复杂度分析',
      type: 'technical',
      difficulty: 'Medium',
      topics: JSON.stringify(['容器', '迭代器', '算法', '性能优化']),
      estimatedTime: '45-60分钟',
    },
    {
      id: 'concurrency',
      title: '并发编程挑战',
      description: '多线程、线程同步、死锁、条件变量、原子操作等高级主题',
      type: 'technical',
      difficulty: 'Hard',
      topics: JSON.stringify(['多线程', '互斥锁', '条件变量', '原子操作']),
      estimatedTime: '60-90分钟',
    },
  ]

  for (const tpl of templates) {
    await prisma.interviewTemplate.upsert({
      where: { id: tpl.id },
      update: { title: tpl.title, description: tpl.description, type: tpl.type, difficulty: tpl.difficulty, topics: tpl.topics, estimatedTime: tpl.estimatedTime },
      create: tpl,
    })
  }
  console.log(`  ✅ ${templates.length} 个面试模板`)

  // ===== 练习题目 =====
  const problems = [
    {
      title: '两数之和',
      description: '给定一个整数数组 nums 和一个整数目标值 target，请你在该数组中找出和为目标值 target 的那两个整数，并返回它们的数组下标。\n\n你可以假设每种输入只会对应一个答案。但是，数组中同一个元素在答案里不能重复出现。\n\n你可以按任意顺序返回答案。',
      difficulty: 'Easy',
      category: '数组',
      tags: JSON.stringify(['数组', '哈希表']),
      testCases: JSON.stringify([
        { input: 'nums = [2,7,11,15], target = 9', expectedOutput: '[0,1]', explanation: '因为 nums[0] + nums[1] == 9 ，返回 [0, 1]' },
        { input: 'nums = [3,2,4], target = 6', expectedOutput: '[1,2]' },
        { input: 'nums = [3,3], target = 6', expectedOutput: '[0,1]' },
      ]),
      hints: JSON.stringify(['可以使用哈希表来存储已经遍历过的数字', '时间复杂度可以优化到 O(n)']),
    },
    {
      title: '链表反转',
      description: '给你单链表的头节点 head ，请你反转链表，并返回反转后的链表。',
      difficulty: 'Easy',
      category: '链表',
      tags: JSON.stringify(['链表', '指针', '递归']),
      testCases: JSON.stringify([{ input: 'head = [1,2,3,4,5]', expectedOutput: '[5,4,3,2,1]' }]),
      hints: JSON.stringify(['可以使用迭代或递归方法', '注意保存下一个节点的指针']),
    },
    {
      title: '智能指针实现',
      description: '实现一个简单的 unique_ptr 智能指针类，支持基本的 RAII 机制。',
      difficulty: 'Medium',
      category: '内存管理',
      tags: JSON.stringify(['C++', '智能指针', 'RAII']),
      testCases: JSON.stringify([]),
      hints: JSON.stringify(['需要实现构造函数、析构函数和移动语义', '禁止拷贝构造和拷贝赋值']),
    },
  ]

  for (const prob of problems) {
    const existing = await prisma.problem.findFirst({ where: { title: prob.title } })
    if (!existing) {
      await prisma.problem.create({ data: prob })
    }
  }
  console.log(`  ✅ ${problems.length} 道练习题目`)

  // ===== 知识库文章索引 =====
  const articles = [
    { slug: 'cpp-intro', title: 'C++ 简介与环境搭建', filePath: 'basics/cpp-intro.md', category: 'basics', difficulty: 'Easy', tags: JSON.stringify(['入门', '环境搭建']), summary: '了解 C++ 的历史、特性以及如何搭建开发环境', estimatedTime: 15 },
    { slug: 'data-types', title: '基本数据类型和变量', filePath: 'basics/data-types.md', category: 'basics', difficulty: 'Easy', tags: JSON.stringify(['数据类型', '变量']), summary: '学习 C++ 的基本数据类型、变量声明和初始化', estimatedTime: 20 },
    { slug: 'control-flow', title: '控制流语句', filePath: 'basics/control-flow.md', category: 'basics', difficulty: 'Easy', tags: JSON.stringify(['if', 'switch', '循环']), summary: '掌握 if、switch、for、while 等控制流语句', estimatedTime: 25 },
    { slug: 'functions', title: '函数与参数传递', filePath: 'basics/functions.md', category: 'basics', difficulty: 'Easy', tags: JSON.stringify(['函数', '参数传递', '重载']), summary: '理解函数定义、参数传递方式（值传递、引用传递、指针传递）', estimatedTime: 30 },
    { slug: 'pointer-basics', title: '指针基础', filePath: 'pointer/pointer-basics.md', category: 'pointer', difficulty: 'Medium', tags: JSON.stringify(['指针', '地址', '解引用']), summary: '深入理解指针的概念、声明、使用和常见陷阱', estimatedTime: 40 },
    { slug: 'smart-pointers', title: 'C++ 智能指针完全指南', filePath: 'pointer/smart-pointers.md', category: 'pointer', difficulty: 'Medium', tags: JSON.stringify(['智能指针', 'RAII', '内存管理']), summary: '深入理解 unique_ptr、shared_ptr、weak_ptr 的用法与底层原理', estimatedTime: 45 },
    { slug: 'memory-management', title: '动态内存管理', filePath: 'pointer/memory-management.md', category: 'pointer', difficulty: 'Medium', tags: JSON.stringify(['new', 'delete', '内存泄漏']), summary: '掌握 C++ 动态内存分配与释放，避免内存泄漏', estimatedTime: 35 },
    { slug: 'classes-and-objects', title: '类与对象', filePath: 'oop/classes-and-objects.md', category: 'oop', difficulty: 'Easy', tags: JSON.stringify(['类', '对象', '构造函数']), summary: '学习 C++ 面向对象编程的基础 —— 类与对象', estimatedTime: 35 },
    { slug: 'inheritance', title: '继承与派生', filePath: 'oop/inheritance.md', category: 'oop', difficulty: 'Medium', tags: JSON.stringify(['继承', '派生', '访问控制']), summary: '理解 C++ 继承机制、访问控制与菱形继承问题', estimatedTime: 40 },
    { slug: 'polymorphism', title: '多态与虚函数', filePath: 'oop/polymorphism.md', category: 'oop', difficulty: 'Medium', tags: JSON.stringify(['多态', '虚函数', 'vtable']), summary: '深入理解运行时多态、虚函数表与纯虚函数', estimatedTime: 40 },
    { slug: 'stl-containers', title: 'STL 容器详解', filePath: 'stl/stl-containers.md', category: 'stl', difficulty: 'Medium', tags: JSON.stringify(['vector', 'map', 'set', 'list']), summary: '全面介绍 STL 序列容器和关联容器的用法与底层实现', estimatedTime: 50 },
    { slug: 'iterators', title: '迭代器与迭代器失效', filePath: 'stl/iterators.md', category: 'stl', difficulty: 'Medium', tags: JSON.stringify(['迭代器', '失效', '分类']), summary: '掌握迭代器的五种分类与常见迭代器失效场景', estimatedTime: 30 },
    { slug: 'stl-algorithms', title: 'STL 算法库', filePath: 'stl/algorithms.md', category: 'stl', difficulty: 'Medium', tags: JSON.stringify(['sort', 'find', 'transform', 'lambda']), summary: '学习常用 STL 算法及 lambda 表达式', estimatedTime: 35 },
    { slug: 'threads-basics', title: '多线程基础', filePath: 'concurrency/threads-basics.md', category: 'concurrency', difficulty: 'Hard', tags: JSON.stringify(['thread', 'mutex', '线程安全']), summary: '学习 C++11 线程库基础，理解线程创建与同步', estimatedTime: 45 },
    { slug: 'mutex-and-locks', title: '互斥锁与条件变量', filePath: 'concurrency/mutex-and-locks.md', category: 'concurrency', difficulty: 'Hard', tags: JSON.stringify(['mutex', 'lock_guard', 'condition_variable']), summary: '掌握互斥锁、读写锁、条件变量等同步原语', estimatedTime: 50 },
  ]

  for (const article of articles) {
    await prisma.knowledgeArticle.upsert({
      where: { slug: article.slug },
      update: { title: article.title, filePath: article.filePath, category: article.category, difficulty: article.difficulty, tags: article.tags, summary: article.summary, estimatedTime: article.estimatedTime },
      create: article,
    })
  }
  console.log(`  ✅ ${articles.length} 篇知识库文章索引`)

  // 更新分类文章计数
  for (const cat of categories) {
    const count = await prisma.knowledgeArticle.count({ where: { category: cat.name } })
    await prisma.knowledgeCategory.update({ where: { name: cat.name }, data: { articleCount: count } })
  }
  console.log('  ✅ 分类文章计数已更新')

  console.log('🎉 Seed 完成！')
}

main()
  .catch((e) => {
    console.error('❌ Seed 失败:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
