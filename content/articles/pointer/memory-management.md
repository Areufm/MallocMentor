---
title: "动态内存管理"
category: "pointer"
difficulty: "Medium"
tags: ["new", "delete", "内存泄漏"]
author: "MallocMentor"
summary: "掌握 C++ 动态内存分配与释放，避免内存泄漏"
estimatedTime: 35
---

# 动态内存管理

C/C++ 赋予程序员直接管理内存的能力，这是一把双刃剑：灵活但危险。理解动态内存管理机制及常见错误，是写出高质量 C++ 代码的必备技能。

---

## 1. 内存区域划分

一个 C++ 程序运行时，内存通常被划分为以下区域：

```
高地址 ┌──────────────────┐
       │    栈区 (Stack)    │ ← 局部变量、函数参数、返回地址
       │  (向下增长 ↓)      │
       ├──────────────────┤
       │         ↕         │ ← 未使用空间
       ├──────────────────┤
       │    堆区 (Heap)     │ ← 动态分配的内存 (new/malloc)
       │  (向上增长 ↑)      │
       ├──────────────────┤
       │ 全局/静态区 (Data) │ ← 全局变量、static 变量
       ├──────────────────┤
       │   代码区 (Text)    │ ← 程序指令（只读）
低地址 └──────────────────┘
```

| 区域      | 分配方式      | 生命周期       | 速度 |
| --------- | ------------- | -------------- | ---- |
| 栈        | 自动分配/释放 | 函数调用期间   | 快   |
| 堆        | 手动分配/释放 | 程序员控制     | 慢   |
| 全局/静态 | 编译期确定    | 整个程序运行期 | —    |

---

## 2. `new`/`delete` 与 `malloc`/`free` 的区别

### 2.1 C 风格：`malloc`/`free`

```cpp
#include <cstdlib>

// 分配 sizeof(int) 字节的原始内存
int* p = (int*)malloc(sizeof(int));
if (p == nullptr) {
    // 分配失败，malloc 返回 NULL
    return -1;
}
*p = 42;
free(p);  // 释放内存
p = nullptr;
```

### 2.2 C++ 风格：`new`/`delete`

```cpp
// 分配并初始化
int* p = new int(42);  // 分配 + 调用"构造"
delete p;              // 调用"析构" + 释放
p = nullptr;

// 对于类对象，区别更明显
class Widget {
public:
    Widget()  { std::cout << "构造" << std::endl; }
    ~Widget() { std::cout << "析构" << std::endl; }
};

Widget* w = new Widget();  // 输出: 构造
delete w;                  // 输出: 析构
```

### 2.3 关键区别对比

| 特性      | `malloc`/`free`   | `new`/`delete`           |
| --------- | ----------------- | ------------------------ |
| 所属语言  | C（C++ 兼容）     | C++                      |
| 返回类型  | `void*`（需强转） | 具体类型指针             |
| 构造/析构 | ❌ 不调用         | ✅ 调用构造/析构函数     |
| 失败处理  | 返回 `NULL`       | 抛出 `std::bad_alloc`    |
| 大小计算  | 手动 `sizeof`     | 自动计算                 |
| 可重载    | ❌                | ✅ 可重载 `operator new` |
| 内存对齐  | 基本类型对齐      | 保证类型对齐             |

> ⚠️ **绝对不要混用**：`new` 分配的必须用 `delete` 释放，`malloc` 分配的必须用 `free` 释放。混用会导致未定义行为。

---

## 3. 动态数组 `new[]`/`delete[]`

### 3.1 基本用法

```cpp
// 分配动态数组
int* arr = new int[5];           // 5 个 int，值未初始化
int* arr2 = new int[5]();        // 5 个 int，零初始化
int* arr3 = new int[5]{1, 2, 3}; // 初始化列表（C++11）

for (int i = 0; i < 5; ++i) {
    arr[i] = i * 10;
}

// 必须用 delete[] 释放数组
delete[] arr;
delete[] arr2;
delete[] arr3;
```

### 3.2 `delete` vs `delete[]`

```cpp
std::string* arr = new std::string[3]{"hello", "world", "!"};

// ❌ 错误：只析构第一个元素，其余元素的析构函数不会被调用
delete arr;

// ✅ 正确：析构所有 3 个元素
delete[] arr;
```

> 对于类类型，`delete[]` 会依次调用每个元素的析构函数，然后释放整块内存。用错会导致资源泄漏或未定义行为。

### 3.3 动态二维数组

```cpp
// 方法 1：指针数组（每行独立分配）
int rows = 3, cols = 4;
int** matrix = new int*[rows];
for (int i = 0; i < rows; ++i) {
    matrix[i] = new int[cols]();
}

// 使用
matrix[1][2] = 42;

// 释放（注意顺序：先释放每一行，再释放行指针数组）
for (int i = 0; i < rows; ++i) {
    delete[] matrix[i];
}
delete[] matrix;

// 方法 2：一维数组模拟（内存连续，推荐）
int* flat = new int[rows * cols]();
// 访问 [i][j] → flat[i * cols + j]
flat[1 * cols + 2] = 42;
delete[] flat;
```

> 💡 **现代 C++ 建议**：优先使用 `std::vector<std::vector<int>>` 或 `std::array` 替代手动动态数组。

---

## 4. 内存泄漏

### 4.1 什么是内存泄漏

动态分配的内存在不再需要后没有被释放，导致该内存无法被重新利用：

```cpp
void memoryLeak() {
    int* p = new int(42);
    // 函数结束，p 被销毁，但 p 指向的堆内存没有被释放
    // 这块内存再也无法被访问或释放 → 内存泄漏
}

// 常见泄漏场景
void leak1() {
    int* p = new int(1);
    p = new int(2);   // 第一次分配的内存泄漏了！
    delete p;          // 只释放了第二次分配的
}

void leak2() {
    int* p = new int(42);
    if (someCondition()) {
        return;        // 提前返回，delete 没有执行 → 泄漏
    }
    delete p;
}
```

### 4.2 内存泄漏检测工具

#### Valgrind（Linux/macOS）

```bash
# 编译时加上调试信息
g++ -g -o myapp main.cpp

# 使用 Valgrind 检测
valgrind --leak-check=full ./myapp
```

Valgrind 的典型输出：

```
==12345== HEAP SUMMARY:
==12345==     in use at exit: 4 bytes in 1 blocks
==12345==   total heap usage: 2 allocs, 1 frees, 72,708 bytes allocated
==12345==
==12345== 4 bytes in 1 blocks are definitely lost in loss record 1 of 1
==12345==    at 0x4C2E0E9: operator new(unsigned long)
==12345==    by 0x400757: main (main.cpp:5)
==12345==
==12345== LEAK SUMMARY:
==12345==    definitely lost: 4 bytes in 1 blocks
```

#### AddressSanitizer（ASan）

```bash
# GCC / Clang 编译选项
g++ -fsanitize=address -g -o myapp main.cpp
./myapp
```

ASan 可以检测：

- 内存泄漏（leak）
- 堆缓冲区溢出（heap-buffer-overflow）
- 栈缓冲区溢出（stack-buffer-overflow）
- 使用已释放的内存（use-after-free）
- 双重释放（double-free）

#### MSVC（Visual Studio）

```cpp
// 在 main 函数开头启用 CRT 内存泄漏检测
#define _CRTDBG_MAP_ALLOC
#include <cstdlib>
#include <crtdbg.h>

int main() {
    _CrtSetDbgFlag(_CRTDBG_ALLOC_MEM_DF | _CRTDBG_LEAK_CHECK_DF);
    // ... 程序代码 ...
    return 0;
}
```

---

## 5. 内存池概念

### 5.1 为什么需要内存池

频繁的 `new`/`delete` 调用会导致：

- **性能开销**：每次分配都要与操作系统交互（系统调用）
- **内存碎片**：反复分配和释放小块内存后，空闲内存变得不连续
- **缓存不友好**：分散的内存分配降低 CPU 缓存命中率

### 5.2 内存池的基本思想

一次性从操作系统分配一大块内存，然后自行管理分配和回收：

```cpp
// 简化版定长内存池
class MemoryPool {
    struct Block {
        Block* next;
    };

    Block* freeList = nullptr;
    std::vector<void*> chunks;  // 管理已分配的大块内存
    size_t blockSize;
    size_t chunkSize;

public:
    MemoryPool(size_t objSize, size_t count = 1024)
        : blockSize(std::max(objSize, sizeof(Block))),
          chunkSize(count) {
        expandPool();
    }

    ~MemoryPool() {
        for (auto chunk : chunks) {
            ::operator delete(chunk);
        }
    }

    void* allocate() {
        if (!freeList) expandPool();
        Block* block = freeList;
        freeList = freeList->next;
        return block;
    }

    void deallocate(void* ptr) {
        Block* block = static_cast<Block*>(ptr);
        block->next = freeList;
        freeList = block;
    }

private:
    void expandPool() {
        char* chunk = static_cast<char*>(
            ::operator new(blockSize * chunkSize));
        chunks.push_back(chunk);
        for (size_t i = 0; i < chunkSize; ++i) {
            Block* block = reinterpret_cast<Block*>(chunk + i * blockSize);
            block->next = freeList;
            freeList = block;
        }
    }
};
```

### 5.3 实际应用

- **游戏引擎**：频繁创建/销毁的粒子、子弹等对象
- **网络服务器**：大量短生命周期的请求对象
- **数据库**：查询执行期间的临时数据分配

> 💡 C++ 标准库也提供了内存池相关支持：`std::pmr::pool_resource`（C++17）。

---

## 6. 常见内存错误

### 6.1 双重释放（Double Free）

同一块内存被释放两次：

```cpp
int* p = new int(42);
delete p;
delete p;  // ❌ 双重释放，未定义行为（通常导致程序崩溃）
```

**防范**：

```cpp
int* p = new int(42);
delete p;
p = nullptr;   // 释放后置空
delete p;      // delete nullptr 是安全的（无操作）
```

### 6.2 越界访问（Buffer Overflow）

访问超出分配范围的内存：

```cpp
int* arr = new int[5];
arr[5] = 100;   // ❌ 越界！有效范围是 arr[0] ~ arr[4]
arr[-1] = 200;  // ❌ 越界！

delete[] arr;
```

越界访问可能：

- 覆盖其他变量的数据
- 破坏堆管理结构，导致后续 `new`/`delete` 崩溃
- 被利用进行安全攻击（缓冲区溢出攻击）

### 6.3 使用已释放的内存（Use After Free）

```cpp
int* p = new int(42);
delete p;
std::cout << *p << std::endl;  // ❌ 未定义行为
*p = 100;                      // ❌ 写入已释放的内存
```

### 6.4 内存泄漏（Memory Leak）

```cpp
void process() {
    auto* widget = new Widget();
    widget->doSomething();
    // 忘记 delete widget → 内存泄漏

    // 异常也会导致泄漏
    auto* data = new char[1024];
    riskyOperation();  // 如果抛出异常，delete[] 不会执行
    delete[] data;
}
```

### 6.5 不匹配的分配和释放

```cpp
// ❌ new 配 free
int* p1 = new int(42);
free(p1);  // 未定义行为

// ❌ new[] 配 delete
int* p2 = new int[10];
delete p2;  // 应该用 delete[]

// ❌ malloc 配 delete
int* p3 = (int*)malloc(sizeof(int));
delete p3;  // 未定义行为
```

### 6.6 错误汇总表

| 错误类型       | 原因                 | 后果          | 防范措施          |
| -------------- | -------------------- | ------------- | ----------------- |
| 双重释放       | 同一指针释放两次     | 崩溃/堆损坏   | 释放后置空        |
| 越界访问       | 下标超出范围         | 数据损坏/崩溃 | 边界检查 / `at()` |
| 使用已释放内存 | 访问 delete 后的指针 | 未定义行为    | 使用智能指针      |
| 内存泄漏       | 忘记 delete          | 内存耗尽      | RAII / 智能指针   |
| 分配释放不匹配 | new/free 混用        | 未定义行为    | 严格配对          |

---

## 7. 最佳实践

1. **优先使用智能指针**：`unique_ptr`、`shared_ptr` 自动管理内存
2. **优先使用栈对象**：如果对象生命周期明确，放在栈上
3. **使用容器替代裸数组**：`std::vector` 取代 `new[]`
4. **RAII 管理所有资源**：不仅仅是内存，文件、锁等都适用
5. **释放后置空**：如果必须使用裸指针，`delete` 后将指针设为 `nullptr`
6. **定期使用检测工具**：ASan、Valgrind、Visual Studio 诊断工具

```cpp
// 现代 C++ 风格 —— 几乎不需要手动 new/delete
#include <memory>
#include <vector>
#include <string>

class ModernCpp {
    std::unique_ptr<Engine> engine;       // 替代 Engine*
    std::vector<int> data;                // 替代 int* + size
    std::string name;                     // 替代 char*

public:
    ModernCpp()
        : engine(std::make_unique<Engine>()),
          data(100),
          name("ModernCpp") {}

    // 不需要手动编写析构函数
    // 不需要手动编写拷贝/移动操作（Rule of Zero）
};
```

---

## 8. 小结

| 概念               | 说明                                   |
| ------------------ | -------------------------------------- |
| `new`/`delete`     | C++ 动态内存分配，调用构造/析构        |
| `malloc`/`free`    | C 风格分配，不调用构造/析构            |
| `new[]`/`delete[]` | 动态数组分配/释放                      |
| 内存泄漏           | 分配后未释放，用 Valgrind/ASan 检测    |
| 内存池             | 预分配大块内存，减少系统调用和碎片     |
| 双重释放           | 同一内存释放两次，释放后置空可防范     |
| 越界访问           | 超出分配范围读写，优先用容器替代裸数组 |

> 🎯 **核心理念**：现代 C++ 的目标是让你「几乎不需要手动管理内存」。掌握底层原理是为了理解智能指针和容器在替你做什么。
