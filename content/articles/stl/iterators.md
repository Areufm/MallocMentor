---
title: "迭代器与迭代器失效"
category: "stl"
difficulty: "Medium"
tags: ["迭代器", "失效", "分类"]
author: "MallocMentor"
summary: "掌握迭代器的五种分类与常见迭代器失效场景"
estimatedTime: 30
---

> 迭代器（Iterator）是 STL 的核心概念之一，它是容器与算法之间的桥梁。迭代器提供了统一的方式来遍历和操作各种容器中的元素，无需了解容器的底层实现。

## 1. 什么是迭代器

迭代器是行为类似指针的对象，它指向容器中的某个元素，支持通过 `++` 移动到下一个元素，通过 `*` 解引用获取元素值。

```cpp
#include <vector>
#include <iostream>

std::vector<int> vec = {10, 20, 30, 40, 50};

// 使用迭代器遍历
for (std::vector<int>::iterator it = vec.begin(); it != vec.end(); ++it) {
    std::cout << *it << " ";
}
// 输出: 10 20 30 40 50

// C++11 auto 简化
for (auto it = vec.begin(); it != vec.end(); ++it) {
    std::cout << *it << " ";
}

// 范围 for 循环本质上也是迭代器
for (const auto& elem : vec) {
    std::cout << elem << " ";
}
```

---

## 2. 五种迭代器分类

C++ 标准将迭代器按**能力**分为五个层次，每个层次是前一个的超集：

```
能力递增 →
┌──────────┬──────────┬──────────┬──────────┬──────────────┐
│ 输入迭代器 │ 前向迭代器 │ 双向迭代器 │ 随机访问   │ 连续迭代器    │
│  Input   │ Forward  │ Bidirect │ Random   │ Contiguous   │
│          │          │  ional   │ Access   │ (C++17)      │
└──────────┴──────────┴──────────┴──────────┴──────────────┘
```

### 2.1 输入迭代器（Input Iterator）

- 只能**单次遍历**，只能前进（`++`）
- 只读（`*it` 只能出现在赋值右边）
- 典型：`std::istream_iterator`

```cpp
#include <iterator>
#include <sstream>

std::istringstream iss("10 20 30");
std::istream_iterator<int> begin(iss), end;

while (begin != end) {
    std::cout << *begin << " ";
    ++begin;
}
// 输出: 10 20 30
```

### 2.2 输出迭代器（Output Iterator）

- 只能写入（`*it = value`）
- 只能前进，单次遍历
- 典型：`std::ostream_iterator`、`std::back_insert_iterator`

```cpp
#include <iterator>
#include <algorithm>

std::vector<int> src = {1, 2, 3};
std::vector<int> dst;

// back_inserter 返回一个输出迭代器
std::copy(src.begin(), src.end(), std::back_inserter(dst));
// dst = {1, 2, 3}

// ostream_iterator 将元素写入输出流
std::copy(src.begin(), src.end(),
          std::ostream_iterator<int>(std::cout, ", "));
// 输出: 1, 2, 3,
```

### 2.3 前向迭代器（Forward Iterator）

- 可以多次遍历同一范围
- 可读可写
- 只能前进（`++`）
- 典型：`std::forward_list::iterator`、`std::unordered_set::iterator`

```cpp
std::forward_list<int> fwd = {1, 2, 3};
auto it = fwd.begin();
++it;          // ✅ 前进
// --it;       // ❌ 不支持后退
```

### 2.4 双向迭代器（Bidirectional Iterator）

- 在前向迭代器基础上增加**后退**能力（`--`）
- 典型：`std::list::iterator`、`std::set::iterator`、`std::map::iterator`

```cpp
std::list<int> lst = {1, 2, 3, 4, 5};
auto it = lst.end();  // 尾后迭代器
--it;                  // ✅ 后退到最后一个元素
std::cout << *it << std::endl;  // 5

// 可以前后移动
++it;  // 回到 end()
--it;  // 再回到 5
```

### 2.5 随机访问迭代器（Random Access Iterator）

- 支持所有指针运算：`+n`、`-n`、`[]`、`<`、`>`、`<=`、`>=`
- O(1) 跳转到任意位置
- 典型：`std::vector::iterator`、`std::deque::iterator`、原生指针

```cpp
std::vector<int> vec = {10, 20, 30, 40, 50};
auto it = vec.begin();

it += 3;               // ✅ 跳转：指向 40
std::cout << it[-1] << std::endl;  // 30（像指针一样用下标）
std::cout << it[1] << std::endl;   // 50

auto diff = vec.end() - vec.begin();  // 5（元素个数）

if (vec.begin() < vec.end()) {
    std::cout << "begin 在 end 前面" << std::endl;
}
```

### 2.6 迭代器能力对照表

| 能力        | Input | Output | Forward | Bidirectional | Random Access |
| ----------- | ----- | ------ | ------- | ------------- | ------------- |
| 读取 `*it`  | ✅    | —      | ✅      | ✅            | ✅            |
| 写入 `*it=` | —     | ✅     | ✅      | ✅            | ✅            |
| `++it`      | ✅    | ✅     | ✅      | ✅            | ✅            |
| `--it`      | —     | —      | —       | ✅            | ✅            |
| `it + n`    | —     | —      | —       | —             | ✅            |
| `it[n]`     | —     | —      | —       | —             | ✅            |
| `it1 < it2` | —     | —      | —       | —             | ✅            |
| 多次遍历    | —     | —      | ✅      | ✅            | ✅            |

### 2.7 各容器迭代器类型

| 容器                  | 迭代器类型 |
| --------------------- | ---------- |
| `array`               | 随机访问   |
| `vector`              | 随机访问   |
| `deque`               | 随机访问   |
| `list`                | 双向       |
| `forward_list`        | 前向       |
| `set / map`           | 双向       |
| `unordered_set / map` | 前向       |

---

## 3. `begin()` / `end()` 与相关函数

### 3.1 基本用法

```cpp
std::vector<int> vec = {1, 2, 3, 4, 5};

vec.begin();    // 指向首元素的迭代器
vec.end();      // 指向尾后位置的迭代器（不是最后一个元素！）
vec.cbegin();   // const 版本，不能通过它修改元素
vec.cend();     // const 尾后迭代器

vec.rbegin();   // 反向迭代器，指向最后一个元素
vec.rend();     // 反向尾后，指向首元素之前
vec.crbegin();  // const 反向迭代器
vec.crend();    // const 反向尾后迭代器
```

### 3.2 图示

```
容器: [1] [2] [3] [4] [5]
       ↑                   ↑
     begin()             end()

反向:
容器: [1] [2] [3] [4] [5]
  ↑                    ↑
rend()              rbegin()
```

### 3.3 全局 `std::begin()` / `std::end()`

C++11 提供了全局版本，可以统一处理容器和原生数组：

```cpp
int arr[] = {1, 2, 3, 4, 5};

// 原生数组没有 .begin() 成员函数
// auto it = arr.begin();  // ❌

// 使用全局函数
auto it = std::begin(arr);   // ✅
auto end = std::end(arr);    // ✅

for (; it != end; ++it) {
    std::cout << *it << " ";
}
```

---

## 4. 迭代器适配器

### 4.1 反向迭代器（`reverse_iterator`）

```cpp
std::vector<int> vec = {1, 2, 3, 4, 5};

// 反向遍历
for (auto rit = vec.rbegin(); rit != vec.rend(); ++rit) {
    std::cout << *rit << " ";
}
// 输出: 5 4 3 2 1

// reverse_iterator 和普通迭代器的转换
auto rit = vec.rbegin();
auto base_it = rit.base();  // 返回对应的正向迭代器
// 注意：base() 返回的迭代器指向 reverse_iterator 的下一个位置
```

### 4.2 插入迭代器（Insert Iterators）

插入迭代器在赋值时不覆盖现有元素，而是插入新元素：

```cpp
std::vector<int> vec = {1, 2, 3};
std::vector<int> src = {10, 20, 30};

// back_insert_iterator：尾部插入
std::copy(src.begin(), src.end(), std::back_inserter(vec));
// vec = {1, 2, 3, 10, 20, 30}

// front_insert_iterator：头部插入（仅支持 deque/list）
std::list<int> lst = {1, 2, 3};
std::copy(src.begin(), src.end(), std::front_inserter(lst));
// lst = {30, 20, 10, 1, 2, 3}（注意顺序！）

// insert_iterator：在指定位置插入
std::vector<int> dst = {100, 200};
std::copy(src.begin(), src.end(), std::inserter(dst, dst.begin() + 1));
// dst = {100, 10, 20, 30, 200}
```

### 4.3 移动迭代器（`move_iterator`，C++11）

```cpp
std::vector<std::string> src = {"hello", "world", "cpp"};
std::vector<std::string> dst;

// 使用移动迭代器，元素被移动而非拷贝
std::move(src.begin(), src.end(), std::back_inserter(dst));
// src 中的元素变为空字符串（已被移动走）
// dst = {"hello", "world", "cpp"}
```

---

## 5. 迭代器失效

迭代器失效是 C++ 中最常见的 bug 来源之一。当容器结构发生变化时，某些迭代器可能变得无效。

### 5.1 `vector` 的迭代器失效

**插入元素时：**

- 如果**触发扩容**（size > capacity）：**所有**迭代器、指针、引用失效
- 如果**未扩容**：插入点之后的迭代器失效，之前的仍有效

```cpp
std::vector<int> vec = {1, 2, 3, 4, 5};
vec.reserve(10);  // 预留足够容量，避免扩容

auto it = vec.begin() + 2;  // 指向 3
vec.insert(vec.begin() + 1, 99);
// it 现在已失效！即使没有扩容，it 在插入点之后

// ❌ 使用 *it 是未定义行为
```

**删除元素时：**

- 被删元素及其之后的所有迭代器失效

```cpp
std::vector<int> vec = {1, 2, 3, 4, 5};

// ❌ 错误的删除方式
for (auto it = vec.begin(); it != vec.end(); ++it) {
    if (*it % 2 == 0) {
        vec.erase(it);  // erase 后 it 失效，++it 是未定义行为
    }
}

// ✅ 正确：erase 返回下一个有效迭代器
for (auto it = vec.begin(); it != vec.end(); ) {
    if (*it % 2 == 0) {
        it = vec.erase(it);  // 接收返回的新迭代器
    } else {
        ++it;
    }
}

// ✅ 更好：使用 erase-remove 惯用法
vec.erase(
    std::remove_if(vec.begin(), vec.end(), [](int x) { return x % 2 == 0; }),
    vec.end()
);

// ✅ C++20：std::erase_if
std::erase_if(vec, [](int x) { return x % 2 == 0; });
```

### 5.2 `deque` 的迭代器失效

- 在**头部或尾部**插删：可能使所有迭代器失效（但首尾元素的引用仍有效）
- 在**中间**插删：**所有**迭代器、引用、指针失效

### 5.3 `list` 的迭代器失效

`list` 的迭代器失效规则最宽松：

- 插入操作：**不影响**任何现有迭代器
- 删除操作：只有被删元素的迭代器失效，其他全部有效

```cpp
std::list<int> lst = {1, 2, 3, 4, 5};

auto it = std::find(lst.begin(), lst.end(), 3);
lst.insert(it, 99);   // it 仍然有效，仍指向 3
lst.erase(it);         // it 失效，但其他迭代器仍有效
```

### 5.4 `map`/`set` 的迭代器失效

与 `list` 类似：

- 插入操作：**不影响**任何现有迭代器
- 删除操作：只有被删元素的迭代器失效

```cpp
std::map<int, std::string> m = {{1, "a"}, {2, "b"}, {3, "c"}};

// ✅ 安全的遍历删除
for (auto it = m.begin(); it != m.end(); ) {
    if (it->first == 2) {
        it = m.erase(it);  // C++11 起 erase 返回下一个迭代器
    } else {
        ++it;
    }
}
```

### 5.5 `unordered_map`/`unordered_set` 的迭代器失效

- 插入可能触发**rehash**（重新哈希），此时**所有**迭代器失效
- 删除操作：只有被删元素的迭代器失效

### 5.6 迭代器失效总结

| 容器          | 插入                           | 删除                       |
| ------------- | ------------------------------ | -------------------------- |
| `vector`      | 扩容则全失效；否则插入点后失效 | 被删点及之后失效           |
| `deque`       | 头尾可能全失效；中间全失效     | 头尾可能全失效；中间全失效 |
| `list`        | 无失效                         | 仅被删元素失效             |
| `set/map`     | 无失效                         | 仅被删元素失效             |
| `unordered_*` | rehash 则全失效                | 仅被删元素失效             |

---

## 6. 实用技巧

### 6.1 `std::advance` 和 `std::next`/`std::prev`

```cpp
std::list<int> lst = {10, 20, 30, 40, 50};
auto it = lst.begin();

std::advance(it, 3);             // it 前进 3 步，指向 40（修改 it 本身）
auto it2 = std::next(it);        // 返回 it 的下一个位置（不修改 it）
auto it3 = std::prev(it);        // 返回 it 的前一个位置
auto it4 = std::next(lst.begin(), 2); // 返回 begin 后第 2 个位置

std::cout << *it << std::endl;   // 40
std::cout << *it2 << std::endl;  // 50
std::cout << *it3 << std::endl;  // 30
```

### 6.2 `std::distance`

```cpp
std::vector<int> vec = {1, 2, 3, 4, 5};
auto d = std::distance(vec.begin(), vec.end());  // 5（元素个数）

std::list<int> lst = {1, 2, 3};
auto d2 = std::distance(lst.begin(), lst.end()); // 3
```

---

## 7. 小结

| 概念                | 说明                                                         |
| ------------------- | ------------------------------------------------------------ |
| 迭代器              | 容器与算法之间的桥梁，行为类似指针                           |
| 五种分类            | Input → Forward → Bidirectional → Random Access → Contiguous |
| `begin()`/`end()`   | 首元素 / 尾后位置                                            |
| `rbegin()`/`rend()` | 反向迭代                                                     |
| 插入迭代器          | `back_inserter`、`front_inserter`、`inserter`                |
| 迭代器失效          | 容器修改时某些迭代器变无效，需谨慎处理                       |

> 🎯 **核心建议**：时刻注意迭代器失效问题。遍历中删除元素时，使用 `it = container.erase(it)` 模式。优先使用标准算法（如 `erase-remove` 惯用法）来避免手动管理迭代器。
