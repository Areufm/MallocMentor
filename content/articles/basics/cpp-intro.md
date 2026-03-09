---
title: "C++ 简介与环境搭建"
category: "basics"
difficulty: "Easy"
tags: ["入门", "环境搭建"]
author: "MallocMentor"
summary: "了解 C++ 的历史、特性以及如何搭建开发环境"
estimatedTime: 15
---

# C++ 简介与环境搭建

C++ 是一门兼具高性能与高抽象能力的通用编程语言。它广泛应用于操作系统、游戏引擎、数据库、嵌入式系统、高频交易等对性能要求极高的领域。学习 C++，从了解它的历史和搭建开发环境开始。

---

## 1. C++ 的历史

### 1.1 起源

C++ 由丹麦计算机科学家 **Bjarne Stroustrup** 于 1979 年在贝尔实验室开始设计，最初名为 **"C with Classes"**（带类的 C），目的是在 C 语言的基础上添加面向对象编程能力，同时保持 C 的高效性。

1983 年正式更名为 **C++**（`++` 是 C 语言的自增运算符，寓意 C 的"进化"）。

### 1.2 标准演进

| 标准  | 年份 | 代号  | 重要特性                                             |
| ----- | ---- | ----- | ---------------------------------------------------- |
| C++98 | 1998 | —     | 第一个 ISO 标准，STL、模板、异常                     |
| C++03 | 2003 | —     | 小幅修正                                             |
| C++11 | 2011 | C++0x | **里程碑**：auto、lambda、智能指针、移动语义、线程库 |
| C++14 | 2014 | —     | 泛型 lambda、`make_unique`、二进制字面量             |
| C++17 | 2017 | —     | `optional`、`variant`、结构化绑定、`if constexpr`    |
| C++20 | 2020 | —     | 概念（concepts）、ranges、协程、模块                 |
| C++23 | 2023 | —     | `std::print`、`std::expected`、更多 ranges           |

> 💡 现代 C++ 通常指 C++11 及之后的标准。本平台的内容主要基于 **C++17**，适当介绍 C++20 新特性。

---

## 2. C++ 的核心特性

### 2.1 多范式编程

C++ 同时支持多种编程范式：

```
┌─────────────────────────────────────────┐
│              C++ 编程范式                │
├──────────┬──────────┬──────────┬────────┤
│ 面向过程  │ 面向对象  │ 泛型编程  │ 函数式 │
│ (C 风格)  │ (类/继承) │ (模板)   │(lambda)│
└──────────┴──────────┴──────────┴────────┘
```

### 2.2 核心优势

- **高性能**：直接编译为机器码，支持手动内存管理
- **零成本抽象**：高层抽象（如模板、智能指针）在运行时没有额外开销
- **底层控制**：可以直接操作内存、硬件寄存器
- **庞大生态**：标准库（STL）+ 海量第三方库
- **跨平台**：代码可移植到几乎所有操作系统和硬件架构

### 2.3 C++ 的应用领域

| 领域       | 典型项目/产品                       |
| ---------- | ----------------------------------- |
| 操作系统   | Windows、Linux 内核模块、macOS      |
| 游戏引擎   | Unreal Engine、Unity（底层）        |
| 数据库     | MySQL、MongoDB、Redis               |
| 浏览器     | Chrome（Blink）、Firefox            |
| 编译器     | GCC、Clang/LLVM                     |
| 嵌入式/IoT | 汽车 ECU、路由器固件                |
| 金融       | 高频交易系统                        |
| AI/ML      | TensorFlow（底层）、PyTorch（底层） |

---

## 3. 开发环境搭建

### 3.1 编译器选择

C++ 是**编译型语言**，源代码需要通过编译器转换为可执行文件。主流编译器：

| 编译器        | 平台                | 说明                          |
| ------------- | ------------------- | ----------------------------- |
| **GCC** (g++) | Linux/macOS/Windows | GNU 编译器，开源，功能全面    |
| **Clang**     | Linux/macOS/Windows | LLVM 项目，错误信息友好       |
| **MSVC**      | Windows             | Microsoft Visual C++，VS 自带 |
| **MinGW-w64** | Windows             | Windows 下的 GCC 移植版       |

### 3.2 Windows 环境搭建

#### 方案一：Visual Studio（推荐新手）

1. 下载 [Visual Studio Community](https://visualstudio.microsoft.com/)（免费）
2. 安装时勾选 **"使用 C++ 的桌面开发"** 工作负载
3. 创建项目 → 选择 "控制台应用" → 开始编码

#### 方案二：VS Code + MinGW

1. 安装 [VS Code](https://code.visualstudio.com/)
2. 安装 [MinGW-w64](https://www.mingw-w64.org/) 或通过 MSYS2 安装
3. 将 MinGW 的 `bin` 目录添加到系统 `PATH`
4. 在 VS Code 中安装 **C/C++ 扩展**（Microsoft）
5. 验证安装：

```powershell
g++ --version
```

### 3.3 Linux 环境搭建

```bash
# Ubuntu / Debian
sudo apt update
sudo apt install build-essential gdb

# CentOS / Fedora
sudo dnf install gcc-c++ gdb

# 验证
g++ --version
```

### 3.4 macOS 环境搭建

```bash
# 安装 Xcode 命令行工具（包含 Clang）
xcode-select --install

# 验证
clang++ --version

# 或通过 Homebrew 安装 GCC
brew install gcc
```

---

## 4. 第一个 C++ 程序

### 4.1 Hello World

创建文件 `hello.cpp`：

```cpp
#include <iostream>   // 引入输入输出流库

int main() {          // 程序入口函数
    std::cout << "Hello, World!" << std::endl;
    return 0;         // 返回 0 表示程序正常结束
}
```

### 4.2 编译与运行

```bash
# 编译
g++ -o hello hello.cpp

# 运行
./hello    # Linux/macOS
hello.exe  # Windows

# 推荐：开启 C++17 标准 + 所有警告
g++ -std=c++17 -Wall -Wextra -o hello hello.cpp
```

### 4.3 编译过程详解

```
源代码 (.cpp)
    │
    ▼  预处理（Preprocessing）：展开 #include、宏替换
预处理后的源码 (.i)
    │
    ▼  编译（Compilation）：语法分析，生成汇编代码
汇编代码 (.s)
    │
    ▼  汇编（Assembly）：转换为机器码
目标文件 (.o / .obj)
    │
    ▼  链接（Linking）：合并目标文件和库，解析符号引用
可执行文件 (a.out / .exe)
```

```bash
# 分步执行
g++ -E hello.cpp -o hello.i   # 仅预处理
g++ -S hello.cpp -o hello.s   # 生成汇编
g++ -c hello.cpp -o hello.o   # 生成目标文件
g++ hello.o -o hello           # 链接
```

---

## 5. 代码结构基础

### 5.1 头文件与源文件

```cpp
// math_utils.h —— 头文件：声明接口
#ifndef MATH_UTILS_H    // 头文件保护（防止重复包含）
#define MATH_UTILS_H

int add(int a, int b);
double circleArea(double radius);

#endif

// math_utils.cpp —— 源文件：实现
#include "math_utils.h"

int add(int a, int b) {
    return a + b;
}

double circleArea(double radius) {
    return 3.14159 * radius * radius;
}

// main.cpp —— 使用
#include <iostream>
#include "math_utils.h"

int main() {
    std::cout << add(3, 4) << std::endl;           // 7
    std::cout << circleArea(5.0) << std::endl;      // 78.5398
    return 0;
}
```

编译多文件项目：

```bash
g++ -std=c++17 -o myapp main.cpp math_utils.cpp
```

### 5.2 C++ 头文件 vs C 头文件

| C 风格       | C++ 风格     | 说明         |
| ------------ | ------------ | ------------ |
| `<stdio.h>`  | `<cstdio>`   | C 标准 I/O   |
| `<stdlib.h>` | `<cstdlib>`  | C 标准库     |
| `<string.h>` | `<cstring>`  | C 字符串操作 |
| —            | `<iostream>` | C++ 流 I/O   |
| —            | `<string>`   | C++ 字符串类 |
| —            | `<vector>`   | C++ 动态数组 |

> 💡 C++ 中推荐使用 `<cstdio>` 而非 `<stdio.h>`，前者将函数放入 `std` 命名空间。

### 5.3 命名空间（namespace）

命名空间用于避免名称冲突：

```cpp
#include <iostream>

namespace MallocMentor {
    void hello() {
        std::cout << "来自 MallocMentor 命名空间" << std::endl;
    }
}

int main() {
    MallocMentor::hello();       // 使用命名空间限定

    using namespace std;         // 引入整个命名空间（不推荐在头文件中使用）
    cout << "Hello" << endl;

    using std::cout;             // 只引入特定名称（推荐）
    cout << "Hello" << std::endl;

    return 0;
}
```

---

## 6. 常用编译选项

| 选项                 | 说明                           |
| -------------------- | ------------------------------ |
| `-std=c++17`         | 指定 C++ 标准版本              |
| `-Wall`              | 开启大部分警告                 |
| `-Wextra`            | 开启额外警告                   |
| `-Werror`            | 将警告视为错误                 |
| `-O2`                | 开启优化（Release 模式）       |
| `-g`                 | 生成调试信息（Debug 模式）     |
| `-fsanitize=address` | 启用地址消毒器（检测内存错误） |
| `-I<path>`           | 添加头文件搜索路径             |
| `-L<path>`           | 添加库搜索路径                 |
| `-l<name>`           | 链接库（如 `-lpthread`）       |

---

## 7. 小结

| 概念       | 说明                                        |
| ---------- | ------------------------------------------- |
| C++ 起源   | 1979 年 Bjarne Stroustrup，"C with Classes" |
| 标准演进   | C++11 是里程碑，当前推荐 C++17/20           |
| 多范式     | 面向过程 + 面向对象 + 泛型 + 函数式         |
| 编译器     | GCC (g++)、Clang、MSVC                      |
| 编译流程   | 预处理 → 编译 → 汇编 → 链接                 |
| 头文件保护 | `#ifndef` / `#define` / `#endif`            |
| 命名空间   | `namespace` 避免名称冲突                    |

> 🎯 **下一步**：环境搭好了，接下来学习 C++ 的基本数据类型和变量，开始写真正的代码吧！
