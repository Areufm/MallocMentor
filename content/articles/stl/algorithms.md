---
title: "STL 算法库"
category: "stl"
difficulty: "Medium"
tags: ["sort", "find", "transform", "lambda"]
author: "MallocMentor"
summary: "学习常用 STL 算法及 lambda 表达式"
estimatedTime: 35
---

# STL 算法库

STL 算法库（`<algorithm>`）提供了大量通用算法，它们通过迭代器操作容器中的元素，实现了容器与算法的解耦。掌握这些算法可以大幅减少手写循环，让代码更简洁、更不易出错。

---

## 1. 概述

STL 算法的设计哲学：

- **操作迭代器范围**：`[begin, end)` 半开区间
- **不了解容器**：算法不直接操作容器，只操作通过迭代器暴露的元素
- **支持自定义行为**：通过函数对象、lambda 表达式自定义比较/操作逻辑

```cpp
#include <algorithm>
#include <numeric>    // accumulate, iota 等
#include <vector>

std::vector<int> vec = {5, 3, 1, 4, 2};
std::sort(vec.begin(), vec.end());
// vec = {1, 2, 3, 4, 5}
```

---

## 2. 非修改算法

这些算法不改变容器中的元素。

### 2.1 `std::find` / `std::find_if`

在范围中查找元素：

```cpp
std::vector<int> vec = {10, 20, 30, 40, 50};

// find：查找值等于 30 的元素
auto it = std::find(vec.begin(), vec.end(), 30);
if (it != vec.end()) {
    std::cout << "找到: " << *it << std::endl;             // 找到: 30
    std::cout << "位置: " << (it - vec.begin()) << std::endl; // 位置: 2
}

// find_if：查找满足条件的第一个元素
auto it2 = std::find_if(vec.begin(), vec.end(), [](int x) {
    return x > 25;
});
std::cout << *it2 << std::endl;  // 30

// find_if_not：查找第一个不满足条件的元素
auto it3 = std::find_if_not(vec.begin(), vec.end(), [](int x) {
    return x < 30;
});
std::cout << *it3 << std::endl;  // 30
```

### 2.2 `std::count` / `std::count_if`

统计元素个数：

```cpp
std::vector<int> vec = {1, 2, 3, 2, 4, 2, 5};

int c1 = std::count(vec.begin(), vec.end(), 2);
std::cout << "2 出现了 " << c1 << " 次" << std::endl;  // 3

int c2 = std::count_if(vec.begin(), vec.end(), [](int x) {
    return x > 3;
});
std::cout << "大于3的数有 " << c2 << " 个" << std::endl;  // 2
```

### 2.3 `std::accumulate`

累积运算（在 `<numeric>` 头文件中）：

```cpp
#include <numeric>

std::vector<int> vec = {1, 2, 3, 4, 5};

// 求和
int sum = std::accumulate(vec.begin(), vec.end(), 0);
std::cout << "求和: " << sum << std::endl;  // 15

// 求积
int product = std::accumulate(vec.begin(), vec.end(), 1, std::multiplies<int>());
std::cout << "求积: " << product << std::endl;  // 120

// 自定义操作：字符串拼接
std::vector<std::string> words = {"Hello", " ", "World", "!"};
std::string sentence = std::accumulate(words.begin(), words.end(), std::string(""));
std::cout << sentence << std::endl;  // Hello World!
```

### 2.4 其他非修改算法

```cpp
std::vector<int> vec = {1, 2, 3, 4, 5};

// all_of / any_of / none_of（C++11）
bool allPositive = std::all_of(vec.begin(), vec.end(), [](int x) { return x > 0; });
bool anyEven = std::any_of(vec.begin(), vec.end(), [](int x) { return x % 2 == 0; });
bool noneNeg = std::none_of(vec.begin(), vec.end(), [](int x) { return x < 0; });

// for_each：对每个元素执行操作
std::for_each(vec.begin(), vec.end(), [](int x) {
    std::cout << x * x << " ";
});
// 输出: 1 4 9 16 25

// min_element / max_element
auto minIt = std::min_element(vec.begin(), vec.end());  // 指向 1
auto maxIt = std::max_element(vec.begin(), vec.end());  // 指向 5
auto [minEl, maxEl] = std::minmax_element(vec.begin(), vec.end());  // C++11
```

---

## 3. 修改算法

这些算法会修改元素的值或容器的结构。

### 3.1 `std::sort`

```cpp
std::vector<int> vec = {5, 3, 1, 4, 2};

// 升序排序（默认）
std::sort(vec.begin(), vec.end());
// vec = {1, 2, 3, 4, 5}

// 降序排序
std::sort(vec.begin(), vec.end(), std::greater<int>());
// vec = {5, 4, 3, 2, 1}

// 自定义比较器
struct Student {
    std::string name;
    int score;
};

std::vector<Student> students = {
    {"Alice", 90}, {"Bob", 85}, {"Charlie", 95}
};

std::sort(students.begin(), students.end(), [](const Student& a, const Student& b) {
    return a.score > b.score;  // 按分数降序
});
// Charlie(95), Alice(90), Bob(85)
```

> `std::sort` 要求随机访问迭代器，所以不能用于 `list`（用 `list::sort()`）和 `set/map`（本身有序）。

### 3.2 `std::stable_sort` 与 `std::partial_sort`

```cpp
// stable_sort：保持相等元素的相对顺序
std::stable_sort(vec.begin(), vec.end());

// partial_sort：只排前 K 个
std::vector<int> vec = {5, 3, 1, 4, 2};
std::partial_sort(vec.begin(), vec.begin() + 3, vec.end());
// 前 3 个是排好的最小值：{1, 2, 3, ...}

// nth_element：找到第 N 小的元素，左边都比它小，右边都比它大
std::vector<int> vec2 = {5, 3, 1, 4, 2};
std::nth_element(vec2.begin(), vec2.begin() + 2, vec2.end());
// vec2[2] = 3（第 3 小的元素），左边 ≤ 3，右边 ≥ 3
```

### 3.3 `std::transform`

对每个元素应用函数，将结果写入目标范围：

```cpp
std::vector<int> src = {1, 2, 3, 4, 5};
std::vector<int> dst(src.size());

// 一元变换：每个元素平方
std::transform(src.begin(), src.end(), dst.begin(), [](int x) {
    return x * x;
});
// dst = {1, 4, 9, 16, 25}

// 二元变换：两个范围的元素相加
std::vector<int> a = {1, 2, 3};
std::vector<int> b = {10, 20, 30};
std::vector<int> c(3);

std::transform(a.begin(), a.end(), b.begin(), c.begin(), std::plus<int>());
// c = {11, 22, 33}

// 就地变换
std::transform(src.begin(), src.end(), src.begin(), [](int x) {
    return x * 2;
});
// src = {2, 4, 6, 8, 10}
```

### 3.4 `std::remove` / `std::remove_if`

> ⚠️ `remove` 不真正删除元素，而是将不满足条件的元素移到前面，返回新的"逻辑结束"迭代器。需要配合 `erase` 真正删除。

```cpp
std::vector<int> vec = {1, 2, 3, 2, 4, 2, 5};

// remove 将不等于 2 的元素移到前面
auto newEnd = std::remove(vec.begin(), vec.end(), 2);
// vec 的内容可能是：{1, 3, 4, 5, ?, ?, ?}
//                           ↑ newEnd

// erase-remove 惯用法
vec.erase(newEnd, vec.end());
// vec = {1, 3, 4, 5}

// 一步到位
std::vector<int> vec2 = {1, 2, 3, 4, 5, 6};
vec2.erase(
    std::remove_if(vec2.begin(), vec2.end(), [](int x) { return x % 2 == 0; }),
    vec2.end()
);
// vec2 = {1, 3, 5}

// C++20 更简洁
// std::erase_if(vec2, [](int x) { return x % 2 == 0; });
```

### 3.5 其他常用修改算法

```cpp
std::vector<int> vec = {1, 2, 3, 4, 5};

// reverse：反转
std::reverse(vec.begin(), vec.end());
// vec = {5, 4, 3, 2, 1}

// rotate：旋转
std::vector<int> v2 = {1, 2, 3, 4, 5};
std::rotate(v2.begin(), v2.begin() + 2, v2.end());
// v2 = {3, 4, 5, 1, 2}

// unique：去除连续重复（需先排序）
std::vector<int> v3 = {1, 1, 2, 2, 3, 3, 3};
auto last = std::unique(v3.begin(), v3.end());
v3.erase(last, v3.end());
// v3 = {1, 2, 3}

// fill：填充
std::fill(vec.begin(), vec.end(), 0);
// vec = {0, 0, 0, 0, 0}

// iota：生成递增序列（<numeric>）
std::iota(vec.begin(), vec.end(), 1);
// vec = {1, 2, 3, 4, 5}

// copy / copy_if
std::vector<int> src = {1, 2, 3, 4, 5};
std::vector<int> dst;
std::copy_if(src.begin(), src.end(), std::back_inserter(dst), [](int x) {
    return x > 3;
});
// dst = {4, 5}

// swap_ranges：交换两个范围
std::vector<int> a = {1, 2, 3};
std::vector<int> b = {4, 5, 6};
std::swap_ranges(a.begin(), a.end(), b.begin());
// a = {4, 5, 6}, b = {1, 2, 3}
```

---

## 4. Lambda 表达式与算法结合

### 4.1 Lambda 语法

```cpp
// 完整语法
[capture](parameters) mutable -> return_type { body }

// 简写形式
[](int x) { return x * 2; }         // 自动推导返回类型
[](int x, int y) { return x + y; }  // 多参数
```

### 4.2 捕获列表

```cpp
int threshold = 10;
std::string prefix = "value: ";

// 值捕获：拷贝外部变量
auto f1 = [threshold](int x) { return x > threshold; };

// 引用捕获：引用外部变量
auto f2 = [&threshold](int x) { threshold = x; };

// 混合捕获
auto f3 = [threshold, &prefix](int x) {
    prefix += std::to_string(x);
    return x > threshold;
};

// 默认捕获
auto f4 = [=](int x) { return x > threshold; };    // 全部值捕获
auto f5 = [&](int x) { threshold = x; };            // 全部引用捕获
auto f6 = [=, &prefix](int x) {                     // 默认值捕获，prefix 引用捕获
    prefix += std::to_string(x);
    return x > threshold;
};

// C++14 泛型 lambda
auto f7 = [](auto x, auto y) { return x + y; };
f7(1, 2);       // int: 3
f7(1.5, 2.5);   // double: 4.0
```

### 4.3 Lambda 与算法配合

```cpp
std::vector<int> scores = {85, 92, 67, 78, 95, 88, 72};

// 筛选及格（≥60）的成绩
std::vector<int> passed;
std::copy_if(scores.begin(), scores.end(), std::back_inserter(passed),
    [](int s) { return s >= 60; });

// 按降序排列
std::sort(passed.begin(), passed.end(), [](int a, int b) {
    return a > b;
});

// 计算平均分
double avg = std::accumulate(scores.begin(), scores.end(), 0.0) / scores.size();

// 统计优秀（≥90）人数
int excellent = std::count_if(scores.begin(), scores.end(),
    [](int s) { return s >= 90; });

// 判断是否全部及格
bool allPassed = std::all_of(scores.begin(), scores.end(),
    [](int s) { return s >= 60; });
```

---

## 5. `std::function`

`std::function` 是通用的函数包装器，可以存储任何可调用对象（函数指针、lambda、函数对象、成员函数指针等）：

```cpp
#include <functional>

// 存储 lambda
std::function<int(int, int)> add = [](int a, int b) { return a + b; };

// 存储函数指针
int multiply(int a, int b) { return a * b; }
std::function<int(int, int)> mul = multiply;

// 存储函数对象
struct Divider {
    double operator()(double a, double b) { return a / b; }
};
std::function<double(double, double)> div = Divider{};

// 作为参数传递
void applyAndPrint(std::vector<int>& vec,
                   std::function<int(int)> func) {
    for (auto& elem : vec) {
        elem = func(elem);
    }
}

std::vector<int> data = {1, 2, 3, 4, 5};
applyAndPrint(data, [](int x) { return x * x; });
// data = {1, 4, 9, 16, 25}
```

> ⚠️ `std::function` 有类型擦除的开销（堆分配、虚函数调用）。如果不需要存储或传递可调用对象，直接使用 lambda 或模板参数更高效。

---

## 6. 自定义比较器

### 6.1 函数对象（Functor）

```cpp
struct AbsCompare {
    bool operator()(int a, int b) const {
        return std::abs(a) < std::abs(b);
    }
};

std::vector<int> vec = {-5, 3, -1, 4, -2};
std::sort(vec.begin(), vec.end(), AbsCompare{});
// vec = {-1, -2, 3, 4, -5}（按绝对值排序）

// 也可以用在关联容器中
std::set<int, AbsCompare> s = {-5, 3, -1, 4, -2};
```

### 6.2 标准库提供的比较器

```cpp
#include <functional>

std::sort(vec.begin(), vec.end(), std::less<int>());     // 升序（默认）
std::sort(vec.begin(), vec.end(), std::greater<int>());  // 降序

// C++14 透明比较器
std::sort(vec.begin(), vec.end(), std::less<>());        // 自动推导类型
std::sort(vec.begin(), vec.end(), std::greater<>());
```

---

## 7. C++20 Ranges 简介

C++20 引入了 Ranges 库，对传统 STL 算法进行了现代化改造。

### 7.1 核心改进

```cpp
#include <ranges>
#include <algorithm>

std::vector<int> vec = {5, 3, 1, 4, 2};

// 传统写法
std::sort(vec.begin(), vec.end());

// C++20 Ranges 写法：直接传容器
std::ranges::sort(vec);

// 传统 find
auto it = std::find(vec.begin(), vec.end(), 3);

// Ranges find
auto it2 = std::ranges::find(vec, 3);
```

### 7.2 视图（Views）— 惰性求值

```cpp
#include <ranges>

std::vector<int> vec = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10};

// 管道语法：筛选偶数 → 平方 → 取前 3 个
auto result = vec
    | std::views::filter([](int x) { return x % 2 == 0; })
    | std::views::transform([](int x) { return x * x; })
    | std::views::take(3);

for (int x : result) {
    std::cout << x << " ";
}
// 输出: 4 16 36

// 注意：views 是惰性的，不会创建新容器
// 只有在遍历时才会计算
```

### 7.3 常用 Views

```cpp
// iota：生成序列
for (int x : std::views::iota(1, 6)) {
    std::cout << x << " ";  // 1 2 3 4 5
}

// reverse：反向
for (int x : vec | std::views::reverse) {
    std::cout << x << " ";  // 10 9 8 ... 1
}

// drop / take
auto first3 = vec | std::views::take(3);      // 前 3 个
auto skip2 = vec | std::views::drop(2);       // 跳过前 2 个

// keys / values（用于 map 等键值容器）
std::map<std::string, int> m = {{"a", 1}, {"b", 2}};
for (const auto& key : m | std::views::keys) {
    std::cout << key << " ";  // a b
}
```

### 7.4 Ranges 的优势

| 特性 | 传统 STL              | C++20 Ranges                  |
| ---- | --------------------- | ----------------------------- |
| 传参 | `begin, end` 两个参数 | 直接传容器                    |
| 组合 | 需要临时容器          | 管道 `\|` 组合，惰性求值      |
| 约束 | 无编译检查            | concepts 约束，更好的错误信息 |
| 投影 | 需要 lambda 封装      | 内置投影（projection）支持    |

---

## 8. 小结

| 类别            | 常用算法                                 | 说明                   |
| --------------- | ---------------------------------------- | ---------------------- |
| 非修改          | `find`, `count`, `accumulate`, `all_of`  | 不改变元素             |
| 排序            | `sort`, `stable_sort`, `partial_sort`    | 各种排序需求           |
| 修改            | `transform`, `remove`, `reverse`, `fill` | 改变元素值/顺序        |
| Lambda          | `[capture](params) { body }`             | 内联函数对象           |
| `std::function` | 通用函数包装器                           | 存储任意可调用对象     |
| 比较器          | `less<>`, `greater<>`, 自定义 functor    | 控制排序/比较逻辑      |
| C++20 Ranges    | `ranges::sort`, `views::filter`          | 现代化的算法和惰性视图 |

> 🎯 **核心理念**：优先使用标准算法而非手写循环。算法经过高度优化，且语义表达力更强。配合 lambda 表达式，几乎所有数据处理需求都能简洁优雅地实现。
