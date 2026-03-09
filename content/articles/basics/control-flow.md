---
title: "控制流语句"
category: "basics"
difficulty: "Easy"
tags: ["if", "switch", "循环"]
author: "MallocMentor"
summary: "掌握 if、switch、for、while 等控制流语句"
estimatedTime: 25
---

> 控制流语句决定了程序的执行顺序。C++ 支持**顺序执行**（从上到下逐行）、**选择执行**（条件分支）和**循环执行**（重复操作）三种基本结构。

## 1. 条件语句

### 1.1 `if` / `else if` / `else`

```cpp
int score = 85;

if (score >= 90) {
    std::cout << "优秀" << std::endl;
} else if (score >= 80) {
    std::cout << "良好" << std::endl;
} else if (score >= 60) {
    std::cout << "及格" << std::endl;
} else {
    std::cout << "不及格" << std::endl;
}
```

#### C++17: 带初始化的 `if`

```cpp
// 变量 it 的作用域限定在 if 语句内部
if (auto it = myMap.find("key"); it != myMap.end()) {
    std::cout << "找到: " << it->second << std::endl;
} else {
    std::cout << "未找到" << std::endl;
}
// it 在这里不可用，不会污染外层作用域
```

### 1.2 三元运算符 `? :`

```cpp
int a = 10, b = 20;
int max = (a > b) ? a : b;   // max = 20

// 也可以嵌套（但不推荐过度嵌套，影响可读性）
std::string grade = (score >= 90) ? "A"
                  : (score >= 80) ? "B"
                  : (score >= 60) ? "C" : "F";
```

### 1.3 `switch`

`switch` 用于对一个整数或枚举值进行多分支匹配：

```cpp
int day = 3;

switch (day) {
    case 1:
        std::cout << "星期一" << std::endl;
        break;
    case 2:
        std::cout << "星期二" << std::endl;
        break;
    case 3:
        std::cout << "星期三" << std::endl;
        break;
    case 4:
    case 5:
        std::cout << "星期四或五" << std::endl;  // 合并多个 case
        break;
    default:
        std::cout << "周末" << std::endl;
        break;
}
```

> ⚠️ **不要忘记 `break`！** 没有 `break` 会发生"穿透"（fall-through），继续执行下一个 case。

```cpp
// C++17: [[fallthrough]] 属性表示有意穿透
switch (level) {
    case 3:
        enableAdvanced();
        [[fallthrough]];   // 告诉编译器：这里不写 break 是故意的
    case 2:
        enableMedium();
        [[fallthrough]];
    case 1:
        enableBasic();
        break;
    default:
        break;
}
```

#### C++17: 带初始化的 `switch`

```cpp
switch (auto len = str.length(); len) {
    case 0:
        std::cout << "空字符串" << std::endl;
        break;
    case 1:
        std::cout << "单字符" << std::endl;
        break;
    default:
        std::cout << "长度: " << len << std::endl;
        break;
}
```

---

## 2. 循环语句

### 2.1 `for` 循环

```cpp
// 基本 for 循环
for (int i = 0; i < 10; i++) {
    std::cout << i << " ";
}
// 输出: 0 1 2 3 4 5 6 7 8 9

// 递减
for (int i = 10; i > 0; i--) {
    std::cout << i << " ";
}

// 步长为 2
for (int i = 0; i < 20; i += 2) {
    std::cout << i << " ";
}
// 输出: 0 2 4 6 8 10 12 14 16 18

// 多变量
for (int i = 0, j = 10; i < j; i++, j--) {
    std::cout << "i=" << i << " j=" << j << std::endl;
}
```

### 2.2 范围 `for` 循环（C++11，推荐）

遍历容器或数组的最简洁方式：

```cpp
std::vector<int> nums = {1, 2, 3, 4, 5};

// 按值遍历（拷贝每个元素）
for (int n : nums) {
    std::cout << n << " ";
}

// 按引用遍历（可修改元素）
for (int& n : nums) {
    n *= 2;  // 每个元素翻倍
}

// 按 const 引用遍历（不拷贝、不修改，最高效的只读方式）
for (const auto& n : nums) {
    std::cout << n << " ";
}

// 遍历数组
int arr[] = {10, 20, 30};
for (int x : arr) {
    std::cout << x << " ";
}

// 遍历初始化列表
for (auto x : {1, 2, 3, 4}) {
    std::cout << x << " ";
}
```

> 💡 **最佳实践**：遍历容器时使用 `for (const auto& elem : container)`，避免不必要的拷贝。

### 2.3 `while` 循环

```cpp
int count = 0;
while (count < 5) {
    std::cout << count << " ";
    count++;
}
// 输出: 0 1 2 3 4

// 典型用法：处理输入
int num;
std::cout << "输入数字（0 结束）: ";
while (std::cin >> num && num != 0) {
    std::cout << "你输入了: " << num << std::endl;
}
```

### 2.4 `do-while` 循环

先执行一次，再判断条件。适合需要**至少执行一次**的场景：

```cpp
int input;
do {
    std::cout << "请输入 1~100 之间的数: ";
    std::cin >> input;
} while (input < 1 || input > 100);

std::cout << "你输入了: " << input << std::endl;
```

### 2.5 `while` vs `do-while` 对比

```
while:
  ┌─→ [条件判断] ─── false ──→ 退出
  │      │ true
  │      ↓
  │   [循环体]
  └──────┘

do-while:
  ┌─→ [循环体]
  │      │
  │   [条件判断] ─── false ──→ 退出
  │      │ true
  └──────┘
```

---

## 3. 循环控制

### 3.1 `break`

立即跳出**当前**循环：

```cpp
for (int i = 0; i < 100; i++) {
    if (i == 5) {
        break;   // 跳出循环
    }
    std::cout << i << " ";
}
// 输出: 0 1 2 3 4
```

### 3.2 `continue`

跳过本次循环的剩余部分，进入**下一次**迭代：

```cpp
for (int i = 0; i < 10; i++) {
    if (i % 2 == 0) {
        continue;   // 跳过偶数
    }
    std::cout << i << " ";
}
// 输出: 1 3 5 7 9
```

### 3.3 嵌套循环与 `break`

`break` 只跳出最内层循环。跳出多层循环可以用标志变量或函数封装：

```cpp
// 方法 1：标志变量
bool found = false;
for (int i = 0; i < 10 && !found; i++) {
    for (int j = 0; j < 10; j++) {
        if (matrix[i][j] == target) {
            std::cout << "找到: (" << i << "," << j << ")" << std::endl;
            found = true;
            break;   // 跳出内层循环
        }
    }
}

// 方法 2：封装为函数（推荐）
auto findInMatrix = [&]() -> std::pair<int, int> {
    for (int i = 0; i < 10; i++) {
        for (int j = 0; j < 10; j++) {
            if (matrix[i][j] == target) {
                return {i, j};
            }
        }
    }
    return {-1, -1};
};
```

---

## 4. 实战示例

### 4.1 九九乘法表

```cpp
for (int i = 1; i <= 9; i++) {
    for (int j = 1; j <= i; j++) {
        std::cout << j << "×" << i << "=" << std::setw(2) << i * j << " ";
    }
    std::cout << std::endl;
}
```

### 4.2 判断素数

```cpp
bool isPrime(int n) {
    if (n < 2) return false;
    if (n < 4) return true;
    if (n % 2 == 0 || n % 3 == 0) return false;

    for (int i = 5; i * i <= n; i += 6) {
        if (n % i == 0 || n % (i + 2) == 0) {
            return false;
        }
    }
    return true;
}

// 输出 100 以内的素数
for (int n = 2; n < 100; n++) {
    if (isPrime(n)) {
        std::cout << n << " ";
    }
}
```

### 4.3 猜数字游戏

```cpp
#include <iostream>
#include <random>

int main() {
    // 生成 1~100 的随机数
    std::random_device rd;
    std::mt19937 gen(rd());
    std::uniform_int_distribution<> dist(1, 100);
    int target = dist(gen);

    int guess;
    int attempts = 0;

    std::cout << "猜一个 1~100 的数字！" << std::endl;

    do {
        std::cout << "你的猜测: ";
        std::cin >> guess;
        attempts++;

        if (guess < target) {
            std::cout << "太小了！" << std::endl;
        } else if (guess > target) {
            std::cout << "太大了！" << std::endl;
        }
    } while (guess != target);

    std::cout << "恭喜你！猜了 " << attempts << " 次。" << std::endl;
    return 0;
}
```

---

## 5. 小结

| 语句        | 用途           | 关键点                                     |
| ----------- | -------------- | ------------------------------------------ |
| `if`/`else` | 条件分支       | C++17 支持带初始化                         |
| `switch`    | 多值匹配       | 别忘 `break`，C++17 支持 `[[fallthrough]]` |
| `for`       | 已知次数的循环 | 三段式：初始化; 条件; 递增                 |
| 范围 `for`  | 遍历容器       | `for (const auto& x : container)`          |
| `while`     | 条件循环       | 先判断后执行                               |
| `do-while`  | 至少一次的循环 | 先执行后判断                               |
| `break`     | 跳出循环       | 只跳出最内层                               |
| `continue`  | 跳到下次迭代   | 跳过当前迭代剩余代码                       |

> 🎯 **核心建议**：优先使用范围 for 循环遍历容器；使用 C++17 的 `if`/`switch` 带初始化语法缩小变量作用域；避免过深的嵌套，必要时抽取为函数。
