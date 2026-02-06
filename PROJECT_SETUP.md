# C/C++ 智能助教平台 - 项目文档

## 项目概述

这是一个基于 Next.js 的 C/C++ 智能辅助学习与面试系统，旨在为计算机专业学生提供从基础学习到技术面试的一站式解决方案。

## 技术栈

### 前端
- **框架**: Next.js 16 (React 19)
- **样式**: Tailwind CSS 4
- **组件库**: shadcn/ui
- **图表**: Recharts
- **代码编辑器**: Monaco Editor
- **图标**: Lucide React

### 后端
- **框架**: Next.js API Routes
- **ORM**: Prisma
- **数据库**: MySQL

## 项目结构

```
demo-next/
├── src/
│   ├── app/                    # Next.js 应用路由
│   │   ├── dashboard/          # 仪表盘页面
│   │   ├── learn/              # 学习路径页面
│   │   ├── practice/           # 代码练习页面
│   │   │   └── [id]/          # 练习题详情页
│   │   ├── interview/          # 模拟面试页面
│   │   │   └── [id]/          # 面试会话详情页
│   │   ├── knowledge/          # 知识库页面
│   │   └── api/               # API 路由
│   ├── components/            # React 组件
│   │   ├── layout/           # 布局组件
│   │   ├── code-editor/      # 代码编辑器组件
│   │   ├── interview/        # 面试相关组件
│   │   └── ui/              # shadcn UI 组件
│   └── lib/                 # 工具函数和配置
│       ├── prisma.ts        # Prisma 客户端
│       └── utils.ts         # 工具函数
├── prisma/
│   └── schema.prisma        # 数据库模型定义
└── public/                  # 静态资源
```

## 核心功能模块

### 1. 仪表盘 (`/dashboard`)
- 用户学习概览
- 能力雷达图（6维评估）
- 学习目标追踪
- 最近活动记录

### 2. 学习路径 (`/learn`)
- 系统化课程设计
- 章节进度管理
- 学习统计
- 多路径支持

### 3. 代码练习 (`/practice`)
- 题目列表与筛选
- Monaco 代码编辑器
- 代码运行与测试
- AI 代码审查（预留接口）

### 4. 模拟面试 (`/interview`)
- AI 面试官对话
- 技术面试模拟
- 实时评估反馈
- 面试历史记录

### 5. 知识库 (`/knowledge`)
- 知识文章浏览
- 分类与搜索
- 热门话题
- AI 知识助手（预留）

## 数据库模型

### 核心模型
- **User**: 用户信息
- **CapabilityRadar**: 能力雷达图（6维能力评分）
- **Problem**: 练习题目
- **CodeSubmission**: 代码提交记录
- **InterviewSession**: 面试会话
- **LearningPath**: 学习路径

## 快速开始

### 1. 安装依赖
```bash
pnpm install
```

### 2. 配置数据库
复制 `.env.example` 为 `.env`，并修改数据库连接：
```env
DATABASE_URL="mysql://username:password@localhost:3306/cpp_learning_platform"
```

### 3. 初始化数据库
```bash
npx prisma generate
npx prisma db push
```

### 4. 启动开发服务器
```bash
pnpm dev
```

访问 http://localhost:3000

## 待实现功能

### 高优先级
1. **用户认证系统**
   - 登录/注册
   - Session 管理
   - 权限控制

2. **Coze AI 集成**
   - 配置 Coze API
   - 实现 AI 代码审查
   - 实现 AI 面试官
   - 实现 AI 知识助手

3. **代码执行沙箱**
   - Docker 容器隔离
   - 安全限制
   - 实时输出

### 中优先级
4. **数据持久化**
   - 用户数据保存
   - 学习进度同步
   - 面试记录存储

5. **能力雷达图算法**
   - 基于做题记录自动评分
   - 动态更新机制

6. **题目管理**
   - 题目导入
   - 难度分级
   - 标签系统

### 低优先级
7. **社区功能**
   - 讨论区
   - 题解分享
   - 用户排行榜

8. **个性化推荐**
   - 基于能力雷达推荐题目
   - 学习路径定制

## 开发规范

### 代码风格
- 使用 TypeScript
- 组件优先使用函数式组件
- 遵循 React Hooks 最佳实践
- 使用 Tailwind CSS 进行样式编写

### 提交规范
- feat: 新功能
- fix: 修复bug
- docs: 文档更新
- style: 代码格式调整
- refactor: 重构
- test: 测试相关
- chore: 构建/工具相关

## 注意事项

1. **数据库**: 确保 MySQL 服务已启动
2. **环境变量**: 不要提交 `.env` 文件到版本控制
3. **AI 功能**: 当前为前端模拟，需要后续集成真实 API
4. **性能**: Monaco Editor 较大，注意首屏加载优化

## 技术文档

- [Next.js 文档](https://nextjs.org/docs)
- [Prisma 文档](https://www.prisma.io/docs)
- [shadcn/ui 文档](https://ui.shadcn.com)
- [Tailwind CSS 文档](https://tailwindcss.com/docs)
- [Monaco Editor](https://microsoft.github.io/monaco-editor/)

## 联系方式

如有问题，请联系项目负责人或提交 Issue。
