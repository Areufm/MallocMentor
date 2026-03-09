---
title: "STL 容器详解"
category: "stl"
difficulty: "Medium"
tags: ["vector", "map", "set", "list"]
author: "MallocMentor"
summary: "全面介绍 STL 序列容器和关联容器的用法与底层实现"
estimatedTime: 50
---

# STL 容器详解

STL（Standard Template Library，标准模板库）容器是 C++ 标准库中最常用的组件。它们是**泛型的**数据结构，用模板参数化元素类型，搭配迭代器和算法形成强大的编程范式。

---

## 1. 容器分类总览

```
STL 容器
├── 序列容器（Sequence Containers）
│   ├── array          固定大小数组
│   ├── vector         动态数组
│   ├── deque          双端队列
│   ├── list           双向链表
│   └── forward_list   单向链表
├── 关联容器（Associative Containers）
│   ├── set / multiset     有序集合
│   └── map / multimap     有序键值对
├── 无序容器（Unordered Containers）（C++11）
│   ├── unordered_set / unordered_multiset
│   └── unordered_map / unordered_multimap
└── 容器适配器（Container Adaptors）
    ├── stack          栈
    ├── queue          队列
    └── priority_queue 优先队列
```

---

## 2. 序列容器

### 2.1 `std::array`（C++11）

固定大小的数组封装，大小在编译时确定。存储在栈上，无动态分配开销。

```cpp
#include <array>

std::array<int, 5> arr = {1, 2, 3, 4, 5};

arr[0] = 10;                // 下标访问（不检查边界）
arr.at(1) = 20;             // at() 访问（检查边界，越界抛 out_of_range）
std::cout << arr.size() << std::endl;    // 5
std::cout << arr.front() << std::endl;   // 10
std::cout << arr.back() << std::endl;    // 5

// 遍历
for (const auto& elem : arr) {
    std::cout << elem << " ";
}
```

**底层实现**：对原生数组 `T[N]` 的薄封装。

适用场景：大小固定且编译时已知的小数组。

### 2.2 `std::vector`

**最常用的容器**。动态数组，支持随机访问，尾部操作高效。

```cpp
#include <vector>

// 创建
std::vector<int> v1;                    // 空 vector
std::vector<int> v2(5);                 // 5 个元素，值初始化为 0
std::vector<int> v3(5, 42);             // 5 个 42
std::vector<int> v4 = {1, 2, 3, 4, 5}; // 初始化列表

// 添加元素
v1.push_back(10);           // 尾部添加
v1.emplace_back(20);        // 尾部就地构造（避免拷贝，C++11）

// 访问
v4[0];                       // 下标访问
v4.at(0);                    // 边界检查访问
v4.front();                  // 首元素
v4.back();                   // 末元素
v4.data();                   // 底层数组指针

// 大小与容量
v4.size();                   // 当前元素数量：5
v4.capacity();               // 当前分配的容量：≥ 5
v4.empty();                  // 是否为空
v4.reserve(100);             // 预分配容量（不改变 size）
v4.shrink_to_fit();          // 释放多余容量

// 删除
v4.pop_back();               // 删除末尾元素
v4.erase(v4.begin() + 1);   // 删除第 2 个元素
v4.clear();                  // 清空所有元素
```

**底层实现**：连续内存的动态数组。

```
vector 内部：
┌──────────────────────────────────────┐
│ 10 │ 20 │ 30 │    │    │    │       │
└──────────────────────────────────────┘
  ↑               ↑                   ↑
 begin          size=3            capacity=7
```

**扩容机制**：当 `size == capacity` 时，分配一块更大的内存（通常是 2 倍），将现有元素移动过去，释放旧内存。

> ⚠️ 扩容会导致所有迭代器、指针、引用失效！

### 2.3 `std::deque`

双端队列，支持头尾两端的高效插入和删除。

```cpp
#include <deque>

std::deque<int> dq = {2, 3, 4};

dq.push_front(1);    // 头部插入：{1, 2, 3, 4}
dq.push_back(5);     // 尾部插入：{1, 2, 3, 4, 5}
dq.pop_front();      // 头部删除：{2, 3, 4, 5}
dq.pop_back();       // 尾部删除：{2, 3, 4}

dq[1];               // 随机访问：3
```

**底层实现**：分段连续的内存块（通常是一个指针数组，每个指针指向固定大小的缓冲区）。

```
deque 内部（示意）：
map（指针数组）
┌───┐
│ ──┼──→ [  │1│2│]
├───┤
│ ──┼──→ [3│4│5│6]
├───┤
│ ──┼──→ [7│8│  │]
└───┘
```

### 2.4 `std::list`

双向链表，任意位置插删 O(1)，但不支持随机访问。

```cpp
#include <list>

std::list<int> lst = {1, 3, 5};

lst.push_front(0);                    // {0, 1, 3, 5}
lst.push_back(7);                     // {0, 1, 3, 5, 7}

auto it = std::find(lst.begin(), lst.end(), 3);
lst.insert(it, 2);                    // 在 3 前面插入 2：{0, 1, 2, 3, 5, 7}
lst.erase(it);                        // 删除 3：{0, 1, 2, 5, 7}

lst.sort();                           // 链表自带 sort（不能用 std::sort）
lst.reverse();                        // 反转
lst.unique();                         // 去除连续重复（需先排序）

// list 特有：splice（拼接），O(1) 将另一个 list 的节点移入
std::list<int> other = {10, 20};
lst.splice(lst.end(), other);         // other 变空，元素移入 lst
```

**底层实现**：双向链表，每个节点独立分配内存。

> 💡 `std::forward_list` 是单向链表，内存更省（每个节点少一个指针），但只能单向遍历。

---

## 3. 关联容器

关联容器元素按**键值排序**存储，底层通常使用**红黑树**实现。

### 3.1 `std::set` / `std::multiset`

有序集合，元素自动排序且不可修改。`set` 元素唯一，`multiset` 允许重复。

```cpp
#include <set>

std::set<int> s = {5, 3, 1, 4, 2, 3};
// s = {1, 2, 3, 4, 5}（自动排序，重复的 3 被忽略）

s.insert(6);                    // {1, 2, 3, 4, 5, 6}
s.insert(3);                    // 无效，3 已存在
s.erase(4);                     // {1, 2, 3, 5, 6}

auto it = s.find(3);            // O(log n) 查找
if (it != s.end()) {
    std::cout << "找到: " << *it << std::endl;
}

s.count(3);                     // 1（set 中只有 0 或 1）

// 自定义比较器
std::set<int, std::greater<int>> descSet = {3, 1, 4};
// descSet = {4, 3, 1}（降序）
```

### 3.2 `std::map` / `std::multimap`

有序键值对容器。`map` 键唯一，`multimap` 允许重复键。

```cpp
#include <map>

std::map<std::string, int> scores;

// 插入
scores["Alice"] = 95;
scores["Bob"] = 87;
scores.insert({"Charlie", 92});
scores.emplace("David", 88);

// 访问
std::cout << scores["Alice"] << std::endl;  // 95
// ⚠️ scores["Eve"] 会插入一个值为 0 的新元素！

// 安全访问
if (auto it = scores.find("Bob"); it != scores.end()) {
    std::cout << it->first << ": " << it->second << std::endl;
}

// C++11: at() 方法，键不存在时抛异常
try {
    std::cout << scores.at("Eve") << std::endl;
} catch (const std::out_of_range& e) {
    std::cout << "键不存在" << std::endl;
}

// 遍历（按键排序）
for (const auto& [name, score] : scores) {  // C++17 结构化绑定
    std::cout << name << ": " << score << std::endl;
}

// 删除
scores.erase("Charlie");
```

**底层实现**：红黑树（自平衡二叉搜索树），保证所有操作 O(log n)。

```
红黑树示意（map<string, int>）：
             [Charlie:92]
            /              \
     [Alice:95]        [David:88]
                      /
               [Bob:87]
```

---

## 4. 无序容器（C++11）

无序容器使用**哈希表**实现，平均 O(1) 的查找/插入/删除，但不保证元素顺序。

### 4.1 `std::unordered_map` / `std::unordered_set`

```cpp
#include <unordered_map>
#include <unordered_set>

// unordered_set
std::unordered_set<std::string> words = {"hello", "world", "cpp"};
words.insert("stl");
words.count("hello");  // 1

// unordered_map
std::unordered_map<std::string, int> wordCount;
std::vector<std::string> text = {"the", "cat", "sat", "on", "the", "mat"};

for (const auto& w : text) {
    wordCount[w]++;  // 统计词频
}

for (const auto& [word, count] : wordCount) {
    std::cout << word << ": " << count << std::endl;
}

// 哈希桶信息
std::cout << "桶数量: " << wordCount.bucket_count() << std::endl;
std::cout << "负载因子: " << wordCount.load_factor() << std::endl;
std::cout << "最大负载因子: " << wordCount.max_load_factor() << std::endl;
```

**底层实现**：哈希表（拉链法——数组 + 链表/红黑树）。

```
哈希表示意：
bucket[0]: → ["cat", 1]
bucket[1]: → ["the", 2] → ["mat", 1]
bucket[2]: → (空)
bucket[3]: → ["sat", 1] → ["on", 1]
```

### 4.2 自定义类型作为键

```cpp
struct Point {
    int x, y;
    bool operator==(const Point& other) const {
        return x == other.x && y == other.y;
    }
};

// 自定义哈希函数
struct PointHash {
    size_t operator()(const Point& p) const {
        size_t h1 = std::hash<int>{}(p.x);
        size_t h2 = std::hash<int>{}(p.y);
        return h1 ^ (h2 << 1);  // 组合哈希
    }
};

std::unordered_set<Point, PointHash> points;
points.insert({1, 2});
points.insert({3, 4});
```

---

## 5. 底层实现对比

| 容器                | 底层结构 | 有序   | 元素连续 |
| ------------------- | -------- | ------ | -------- |
| `array`             | 原生数组 | 不排序 | ✅       |
| `vector`            | 动态数组 | 不排序 | ✅       |
| `deque`             | 分段数组 | 不排序 | 部分     |
| `list`              | 双向链表 | 不排序 | ❌       |
| `set/map`           | 红黑树   | ✅     | ❌       |
| `unordered_set/map` | 哈希表   | ❌     | ❌       |

---

## 6. 时间复杂度对比

| 操作     | `vector`  | `deque` | `list` | `set/map` | `unordered_*` |
| -------- | --------- | ------- | ------ | --------- | ------------- |
| 随机访问 | O(1)      | O(1)    | O(n)   | O(log n)  | O(n)          |
| 头部插删 | O(n)      | O(1)    | O(1)   | —         | —             |
| 尾部插删 | 均摊 O(1) | O(1)    | O(1)   | —         | —             |
| 中间插删 | O(n)      | O(n)    | O(1)\* | —         | —             |
| 查找     | O(n)      | O(n)    | O(n)   | O(log n)  | 均摊 O(1)     |
| 插入     | —         | —       | —      | O(log n)  | 均摊 O(1)     |

> \* list 中间插删本身 O(1)，但找到位置需要 O(n)

---

## 7. 容器选型指南

```
需要随机访问？
├── 是 → 大小固定？
│        ├── 是 → std::array
│        └── 否 → std::vector（首选！）
└── 否 → 需要按键查找？
         ├── 是 → 需要有序？
         │        ├── 是 → std::map / std::set
         │        └── 否 → std::unordered_map / std::unordered_set
         └── 否 → 主要在哪里插删？
                  ├── 两端 → std::deque
                  └── 中间频繁 → std::list
```

**经验法则**：

| 场景         | 推荐容器                               |
| ------------ | -------------------------------------- |
| 通用场景     | `vector`（默认选择）                   |
| 键值查找     | `unordered_map`（无序）/ `map`（有序） |
| 去重         | `unordered_set` / `set`                |
| 频繁头尾操作 | `deque`                                |
| 频繁中间插删 | `list`（大量元素时）                   |
| 固定大小     | `array`                                |
| 需要有序遍历 | `map` / `set`                          |

> 💡 **90% 的场景用 `vector` 就够了。** 即使理论上 `list` 在中间插删上复杂度更优，`vector` 的缓存友好性在实际中往往让它更快。先用 `vector`，遇到性能问题再考虑换。

---

## 8. 小结

| 类别 | 容器                | 核心特点                     |
| ---- | ------------------- | ---------------------------- |
| 序列 | `vector`            | 动态数组，随机访问，尾插高效 |
| 序列 | `deque`             | 双端高效插删，随机访问       |
| 序列 | `list`              | 双向链表，任意位置 O(1) 插删 |
| 序列 | `array`             | 固定大小，栈上分配           |
| 关联 | `map/set`           | 红黑树，有序，O(log n)       |
| 无序 | `unordered_map/set` | 哈希表，O(1) 平均            |

> 🎯 **核心原则**：选择容器时，先考虑你最频繁的操作是什么（随机访问？查找？插删？），再选择时间复杂度最优的容器。如果不确定，就用 `vector`。
