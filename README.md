# C/C++ 智能助教平台

## 项目简介

这是一个基于 Next.js 的 C/C++ 智能辅助学习与面试系统，为计算机专业学生提供从基础学习到技术面试的全方位支持。

## 核心功能

### ✅ 已实现
- **仪表盘**: 学习概览、能力雷达图、学习目标追踪
- **学习路径**: 系统化课程、章节进度管理
- **代码练习**: Monaco 编辑器、题目列表、运行测试
- **模拟面试**: AI 对话界面、面试历史记录
- **知识库**: 文章浏览、分类搜索、热门话题

### 🚧 待开发
- 用户认证系统（登录/注册）
- Coze AI 集成（代码审查、面试官、知识助手）
- 代码执行沙箱（Docker 容器）
- 数据持久化与进度同步
- 能力雷达图自动评分算法

## 技术栈

- **前端**: Next.js 16, React 19, TypeScript
- **样式**: Tailwind CSS 4
- **组件**: shadcn/ui
- **编辑器**: Monaco Editor
- **图表**: Recharts
- **数据库**: MySQL + Prisma ORM

## 快速开始

### 1. 安装依赖
```bash
pnpm install
```

### 2. 配置数据库
复制 `.env.example` 为 `.env`，修改数据库配置：
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

## 项目结构

```
src/
├── app/                    # 页面路由
│   ├── api/               # API 路由（Mock）
│   │   ├── auth/         # 认证相关
│   │   ├── problems/     # 题目管理
│   │   ├── code/         # 代码执行
│   │   ├── interviews/   # 面试会话
│   │   ├── learning-paths/  # 学习路径
│   │   ├── knowledge/    # 知识库
│   │   └── ...
│   ├── dashboard/          # 仪表盘
│   ├── learn/              # 学习路径
│   ├── practice/           # 代码练习
│   ├── interview/          # 模拟面试
│   └── knowledge/          # 知识库
├── components/             # React 组件
│   ├── layout/            # 布局组件
│   ├── code-editor/       # 代码编辑器
│   └── ui/                # UI 组件
├── types/                 # TypeScript 类型定义
│   └── api.ts            # API 类型
└── lib/                   # 工具函数
    ├── mock-data.ts      # Mock 数据
    └── utils.ts          # 工具函数
```

## 数据库模型

- **User**: 用户信息
- **CapabilityRadar**: 6维能力评估
- **Problem**: 练习题目
- **CodeSubmission**: 代码提交记录
- **InterviewSession**: 面试会话
- **LearningPath**: 学习路径

## 开发计划

### 第一阶段 ✅
- [x] 项目框架搭建
- [x] 数据库模型设计
- [x] 核心页面实现
- [x] UI 组件开发

### 第二阶段 🚧
- [ ] 用户认证系统
- [ ] Coze AI 集成
- [ ] 代码执行沙箱
- [ ] 数据持久化

### 第三阶段 📋
- [ ] 能力评估算法
- [ ] 个性化推荐
- [ ] 社区功能
- [ ] 性能优化

## 开发说明

1. **样式**: 使用 Tailwind CSS，遵循 shadcn/ui 设计规范
2. **组件**: 优先使用函数式组件和 React Hooks
3. **类型**: 全面使用 TypeScript 类型定义
4. **提交**: 遵循 Conventional Commits 规范

## API 接口

所有 API 接口已经定义完成并使用 Mock 数据：

- ✅ **23 个 API 端点**已实现
- ✅ 完整的 **TypeScript 类型定义**
- ✅ **Mock 数据**和工具函数
- ✅ 标准的响应格式
- ✅ **统一的 API 客户端封装**
- ✅ **SWR Hooks** 用于数据获取

查看文档：
- [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) - API 接口文档
- [API_CLIENT_GUIDE.md](./API_CLIENT_GUIDE.md) - 客户端使用指南

### 主要接口模块

| 模块 | 端点数 | 说明 |
|------|--------|------|
| 认证 | 3 | 登录、注册、获取用户信息 |
| 题目 | 2 | 题目列表、题目详情 |
| 代码 | 2 | 代码提交、运行测试 |
| 面试 | 5 | 面试会话管理、消息发送 |
| 学习路径 | 3 | 路径管理、进度更新 |
| 知识库 | 3 | 文章列表、详情、分类 |
| 其他 | 5 | 能力雷达图、活动日志、统计 |

## 相关文档

- 详细文档：[PROJECT_SETUP.md](./PROJECT_SETUP.md)
- API 文档：[API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
- 开题报告：本项目基于毕业设计开题报告开发

## 注意事项

⚠️ **重要提示**:
- 确保 MySQL 服务已启动
- 不要提交 `.env` 文件到版本控制
- AI 功能当前为前端模拟，需后续集成真实 API
- Monaco Editor 较大，注意首屏加载优化

## 联系方式

如有问题，欢迎提交 Issue 或 PR。
