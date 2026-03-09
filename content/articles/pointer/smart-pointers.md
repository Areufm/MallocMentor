---
title: "C++ 智能指针完全指南"
category: "pointer"
difficulty: "Medium"
tags: ["智能指针", "RAII", "内存管理"]
author: "MallocMentor"
summary: "深入理解 unique_ptr、shared_ptr、weak_ptr 的用法与底层原理"
estimatedTime: 45
---

# C++ 智能指针完全指南

手动管理动态内存（`new`/`delete`）是 C++ 中最常见的 bug 来源之一。C++11 引入的智能指针通过 **RAII（Resource Acquisition Is Initialization）** 机制，将内存的生命周期绑定到对象的生命周期，从根本上解决了内存泄漏和悬空指针问题。

---

## 1. RAII 原则

RAII 是 C++ 资源管理的核心哲学：

- **获取即初始化**：在对象构造时获取资源（内存、文件句柄、锁等）
- **析构即释放**：在对象析构时自动释放资源

```cpp
// RAII 的本质思想
class FileHandle {
    FILE* file;
public:
    FileHandle(const char* path) : file(fopen(path, "r")) {
        if (!file) throw std::runtime_error("无法打开文件");
    }
    ~FileHandle() {
        if (file) fclose(file);  // 析构时自动关闭
    }
    // 禁止拷贝
    FileHandle(const FileHandle&) = delete;
    FileHandle& operator=(const FileHandle&) = delete;
};
```

智能指针就是 RAII 在动态内存管理上的标准应用。C++ 提供了三种智能指针，定义在 `<memory>` 头文件中。

---

## 2. `std::unique_ptr` — 独占所有权

### 2.1 基本概念

`unique_ptr` 表示**独占**所有权语义：同一时刻只有一个 `unique_ptr` 拥有某块内存，不可复制，只能移动。

```cpp
#include <memory>
#include <iostream>

int main() {
    // 使用 make_unique 创建（C++14，推荐方式）
    std::unique_ptr<int> p1 = std::make_unique<int>(42);
    std::cout << *p1 << std::endl;  // 42

    // 直接构造（不推荐，可能有异常安全问题）
    std::unique_ptr<int> p2(new int(100));

    // 离开作用域时自动 delete，无需手动释放
}
```

### 2.2 为什么推荐 `make_unique`

```cpp
// ❌ 潜在问题：如果第二个参数构造抛出异常，new 的内存可能泄漏
processWidget(std::unique_ptr<Widget>(new Widget), computePriority());

// ✅ make_unique 保证异常安全
processWidget(std::make_unique<Widget>(), computePriority());
```

`make_unique` 的优势：

- **异常安全**：不会因表达式求值顺序导致内存泄漏
- **代码简洁**：避免重复书写类型名
- **单次分配**：减少一次 `new` 调用

### 2.3 不可复制，只能移动

```cpp
auto p1 = std::make_unique<int>(42);

// auto p2 = p1;           // ❌ 编译错误：unique_ptr 不可复制
auto p2 = std::move(p1);   // ✅ 所有权转移到 p2

// p1 此时为 nullptr
if (!p1) {
    std::cout << "p1 已经为空" << std::endl;
}
std::cout << *p2 << std::endl;  // 42
```

### 2.4 常用操作

```cpp
auto ptr = std::make_unique<int>(42);

ptr.get();        // 获取裸指针（不转移所有权）
ptr.reset();      // 释放当前对象，ptr 变为 nullptr
ptr.reset(new int(100));  // 释放旧对象，接管新对象
ptr.release();    // 放弃所有权，返回裸指针（需调用者负责释放）

if (ptr) {        // 隐式转换为 bool，判断是否为空
    std::cout << *ptr << std::endl;
}
```

### 2.5 unique_ptr 与数组

```cpp
// 管理动态数组
auto arr = std::make_unique<int[]>(5);  // 5 个 int 的数组
arr[0] = 10;
arr[1] = 20;
// 离开作用域时自动调用 delete[]
```

### 2.6 作为函数参数和返回值

```cpp
// 作为返回值：工厂模式的完美搭档
std::unique_ptr<Shape> createShape(const std::string& type) {
    if (type == "circle") return std::make_unique<Circle>();
    if (type == "rect")   return std::make_unique<Rectangle>();
    return nullptr;
}

// 作为参数：转移所有权
void takeOwnership(std::unique_ptr<Widget> widget) {
    // widget 在函数结束时自动销毁
}

auto w = std::make_unique<Widget>();
takeOwnership(std::move(w));  // 必须显式 move
```

---

## 3. `std::shared_ptr` — 共享所有权

### 3.1 基本概念

`shared_ptr` 使用**引用计数（Reference Counting）**实现共享所有权：多个 `shared_ptr` 可以指向同一对象，当最后一个 `shared_ptr` 被销毁时，对象才被释放。

```cpp
#include <memory>
#include <iostream>

int main() {
    auto sp1 = std::make_shared<int>(42);
    std::cout << "引用计数: " << sp1.use_count() << std::endl;  // 1

    {
        auto sp2 = sp1;  // 共享所有权
        std::cout << "引用计数: " << sp1.use_count() << std::endl;  // 2
        std::cout << *sp2 << std::endl;  // 42
    }
    // sp2 离开作用域，引用计数减少
    std::cout << "引用计数: " << sp1.use_count() << std::endl;  // 1
}
// sp1 离开作用域，引用计数变为 0，对象被释放
```

### 3.2 `make_shared` 的优势

```cpp
// ✅ 推荐：一次内存分配（控制块和对象合并）
auto sp = std::make_shared<Widget>(arg1, arg2);

// ❌ 不推荐：两次内存分配（对象 + 控制块各一次）
std::shared_ptr<Widget> sp(new Widget(arg1, arg2));
```

`make_shared` 的好处：

- **性能更优**：只分配一次内存（对象和控制块在同一内存块上）
- **异常安全**：和 `make_unique` 一样
- **缓存友好**：对象和控制块在相邻内存

### 3.3 shared_ptr 的内部结构

```
shared_ptr 内部：
┌────────────────┐
│  对象指针 ptr   │ ──────→ [ 实际对象数据 ]
├────────────────┤
│ 控制块指针 ctrl │ ──────→ ┌─────────────────┐
└────────────────┘          │ 强引用计数 (use)  │
                            │ 弱引用计数 (weak) │
                            │ 删除器 (deleter)  │
                            │ 分配器 (allocator)│
                            └─────────────────┘
```

每个 `shared_ptr` 占用两个指针大小（通常 16 字节），控制块由所有共享同一对象的 `shared_ptr` 和 `weak_ptr` 共同维护。

### 3.4 注意事项

```cpp
// ❌ 不要用同一个裸指针创建多个 shared_ptr
int* raw = new int(42);
std::shared_ptr<int> sp1(raw);
std::shared_ptr<int> sp2(raw);  // 灾难！两个独立的引用计数
// 会导致双重释放（double free）

// ✅ 正确：从已有的 shared_ptr 拷贝
auto sp1 = std::make_shared<int>(42);
auto sp2 = sp1;  // 共享同一个控制块
```

---

## 4. `std::weak_ptr` — 弱引用

### 4.1 解决循环引用问题

当两个对象互相持有 `shared_ptr` 时，引用计数永远不会降为 0，导致内存泄漏：

```cpp
struct Node {
    std::shared_ptr<Node> next;
    std::shared_ptr<Node> prev;  // ❌ 循环引用！
    ~Node() { std::cout << "Node 被销毁" << std::endl; }
};

void circularReference() {
    auto node1 = std::make_shared<Node>();
    auto node2 = std::make_shared<Node>();

    node1->next = node2;
    node2->prev = node1;  // 循环引用形成

    // 离开作用域：
    // node1 引用计数 = 1（被 node2->prev 持有）
    // node2 引用计数 = 1（被 node1->next 持有）
    // 两个对象都不会被释放！析构函数不会被调用
}
```

**解决方案**：将其中一方改为 `weak_ptr`：

```cpp
struct Node {
    std::shared_ptr<Node> next;
    std::weak_ptr<Node> prev;   // ✅ 使用 weak_ptr 打破循环
    ~Node() { std::cout << "Node 被销毁" << std::endl; }
};
```

### 4.2 weak_ptr 的使用

`weak_ptr` 不增加引用计数，不影响对象的生命周期。它需要先通过 `lock()` 转换为 `shared_ptr` 才能访问对象：

```cpp
auto sp = std::make_shared<int>(42);
std::weak_ptr<int> wp = sp;  // 不增加引用计数

std::cout << wp.use_count() << std::endl;  // 1（只统计 shared_ptr）
std::cout << wp.expired() << std::endl;    // false

// 通过 lock() 安全访问
if (auto locked = wp.lock()) {
    // locked 是 shared_ptr<int>，此时引用计数临时变为 2
    std::cout << *locked << std::endl;  // 42
}

sp.reset();  // 释放唯一的 shared_ptr
std::cout << wp.expired() << std::endl;    // true

if (auto locked = wp.lock()) {
    // 不会进入这里
} else {
    std::cout << "对象已被销毁" << std::endl;
}
```

### 4.3 weak_ptr 的典型应用场景

- **缓存（Cache）**：缓存对象但不阻止其被回收
- **观察者模式**：观察者持有 `weak_ptr`，不影响被观察对象的生命周期
- **打破循环引用**：双向链表、树的父子关系等

---

## 5. 所有权转移与 `std::move`

### 5.1 unique_ptr 的所有权转移

```cpp
auto p1 = std::make_unique<std::string>("Hello");

// 将所有权从 p1 转移到 p2
auto p2 = std::move(p1);  // p1 变为 nullptr

// 转移到函数
void process(std::unique_ptr<std::string> data) {
    std::cout << *data << std::endl;
}
process(std::move(p2));  // p2 变为 nullptr
```

### 5.2 shared_ptr 也支持移动

```cpp
auto sp1 = std::make_shared<int>(42);
std::cout << sp1.use_count() << std::endl;  // 1

auto sp2 = std::move(sp1);  // 移动而非拷贝，引用计数不变
std::cout << sp2.use_count() << std::endl;  // 1（不是 2）
// sp1 变为 nullptr
```

> 💡 移动 `shared_ptr` 比拷贝更高效：移动只转移指针，不需要原子性地操作引用计数。

---

## 6. 自定义删除器

默认情况下，智能指针使用 `delete` 或 `delete[]` 释放资源。可以自定义删除器来管理其他类型的资源：

### 6.1 unique_ptr 的自定义删除器

```cpp
// 管理 FILE* 资源
auto fileDeleter = [](FILE* fp) {
    if (fp) {
        std::cout << "关闭文件" << std::endl;
        fclose(fp);
    }
};

std::unique_ptr<FILE, decltype(fileDeleter)> file(
    fopen("data.txt", "r"), fileDeleter
);
// 离开作用域时自动调用 fclose
```

### 6.2 shared_ptr 的自定义删除器

`shared_ptr` 的删除器更灵活，不需要体现在类型中：

```cpp
// 管理 C 风格资源
std::shared_ptr<FILE> file(fopen("data.txt", "r"), [](FILE* fp) {
    if (fp) fclose(fp);
});

// 管理数组（C++17 之前 shared_ptr 不直接支持数组）
std::shared_ptr<int> arr(new int[10], std::default_delete<int[]>());
// 或
std::shared_ptr<int> arr(new int[10], [](int* p) { delete[] p; });
```

---

## 7. 智能指针的选择策略

| 场景                 | 推荐         | 说明                     |
| -------------------- | ------------ | ------------------------ |
| 独占资源，不共享     | `unique_ptr` | 开销最小，零成本抽象     |
| 多个对象共享同一资源 | `shared_ptr` | 引用计数自动管理生命周期 |
| 观察但不拥有         | `weak_ptr`   | 不影响生命周期           |
| 函数内临时使用       | 裸指针或引用 | 不涉及所有权             |
| 工厂函数返回值       | `unique_ptr` | 调用方可转为 shared_ptr  |

> 💡 **经验法则**：优先使用 `unique_ptr`，只在确实需要共享所有权时才使用 `shared_ptr`。`unique_ptr` 可以隐式转换为 `shared_ptr`，反之不行。

```cpp
// unique_ptr 可以轻松转换为 shared_ptr
std::unique_ptr<Widget> up = std::make_unique<Widget>();
std::shared_ptr<Widget> sp = std::move(up);  // ✅ 隐式转换
```

---

## 8. 小结

| 智能指针     | 所有权 | 可复制 | 可移动 | 引用计数 | 典型用途               |
| ------------ | ------ | ------ | ------ | -------- | ---------------------- |
| `unique_ptr` | 独占   | ❌     | ✅     | 无       | 工厂、容器、成员变量   |
| `shared_ptr` | 共享   | ✅     | ✅     | 有       | 共享资源、跨模块传递   |
| `weak_ptr`   | 无     | ✅     | ✅     | 弱       | 缓存、观察者、打破引用 |

> 🎯 **核心原则**：现代 C++ 中，除了与 C API 交互或非拥有（non-owning）场景外，应尽量避免使用裸指针进行内存管理。让智能指针帮你守护内存安全。
