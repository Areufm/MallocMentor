---
title: "函数与参数传递"
category: "basics"
difficulty: "Easy"
tags: ["函数", "参数传递", "重载"]
author: "MallocMentor"
summary: "理解函数定义、参数传递方式（值传递、引用传递、指针传递）"
estimatedTime: 30
---

> 函数是 C++ 程序的基本组织单元，将代码划分为可复用的独立模块。理解函数的定义、调用和参数传递方式，是写出结构清晰、可维护代码的基础。

## 1. 函数的定义与声明

### 1.1 基本结构

```cpp
// 函数定义
返回类型 函数名(参数列表) {
    // 函数体
    return 返回值;
}

// 示例
int add(int a, int b) {
    return a + b;
}

// 无返回值
void greet(const std::string& name) {
    std::cout << "Hello, " << name << "!" << std::endl;
}
```

### 1.2 函数声明（前向声明）

在 C++ 中，函数必须先声明后使用。可以将**声明**放在前面，**定义**放在后面：

```cpp
// 声明（原型）——告诉编译器函数的签名
int add(int a, int b);       // 参数名可以省略：int add(int, int);
void greet(const std::string& name);

int main() {
    std::cout << add(3, 4) << std::endl;   // 7
    greet("World");
    return 0;
}

// 定义——实现函数体
int add(int a, int b) {
    return a + b;
}

void greet(const std::string& name) {
    std::cout << "Hello, " << name << "!" << std::endl;
}
```

> 💡 在实际项目中，声明通常放在**头文件**（`.h`/`.hpp`），定义放在**源文件**（`.cpp`）。

### 1.3 头文件与源文件分离

```cpp
// math_utils.h —— 头文件（声明）
#pragma once    // 防止重复包含

int add(int a, int b);
int multiply(int a, int b);

// math_utils.cpp —— 源文件（定义）
#include "math_utils.h"

int add(int a, int b) {
    return a + b;
}

int multiply(int a, int b) {
    return a * b;
}

// main.cpp —— 使用
#include "math_utils.h"

int main() {
    std::cout << add(3, 4) << std::endl;
    return 0;
}
```

---

## 2. 参数传递方式

这是本文最核心的内容。C++ 提供三种参数传递方式，各有适用场景。

### 2.1 值传递（Pass by Value）

函数接收的是实参的**副本**，修改形参不影响实参：

```cpp
void increment(int n) {
    n++;   // 只修改了副本
    std::cout << "函数内: " << n << std::endl;   // 11
}

int main() {
    int x = 10;
    increment(x);
    std::cout << "函数外: " << x << std::endl;   // 10（未改变）
}
```

```
内存示意：
  main:       increment:
  ┌─────┐     ┌─────┐
  │ x=10│ ──→ │ n=10│  （拷贝一份）
  └─────┘     │ n=11│  （修改副本）
              └─────┘
  x 仍然是 10
```

### 2.2 引用传递（Pass by Reference）

函数接收的是实参的**引用**（别名），修改形参就是修改实参：

```cpp
void increment(int& n) {   // 注意 & 符号
    n++;   // 修改的是原始变量
}

int main() {
    int x = 10;
    increment(x);
    std::cout << x << std::endl;   // 11（被修改了）
}
```

#### `const` 引用——只读不拷贝

```cpp
// 大对象传递时，使用 const 引用避免拷贝，同时防止修改
void printVector(const std::vector<int>& v) {
    for (const auto& elem : v) {
        std::cout << elem << " ";
    }
    std::cout << std::endl;
    // v.push_back(1);  // ❌ 编译错误：const 不允许修改
}
```

### 2.3 指针传递（Pass by Pointer）

函数接收的是指向实参的**指针**：

```cpp
void increment(int* p) {
    if (p != nullptr) {     // 安全检查
        (*p)++;
    }
}

int main() {
    int x = 10;
    increment(&x);          // 传递地址
    std::cout << x << std::endl;   // 11
}
```

### 2.4 三种方式对比

| 方式       | 语法            | 能否修改实参 | 能否为 null | 拷贝开销 | 适用场景                  |
| ---------- | --------------- | ------------ | ----------- | -------- | ------------------------- |
| 值传递     | `f(int n)`      | ❌           | —           | 有       | 基本类型、小对象          |
| const 引用 | `f(const T& n)` | ❌           | ❌          | 无       | 大对象的只读访问          |
| 引用       | `f(T& n)`       | ✅           | ❌          | 无       | 需要修改实参              |
| 指针       | `f(T* p)`       | ✅           | ✅          | 无       | 可能为 null、需要重新指向 |

> 🎯 **选择建议**：
>
> - 不需要修改、基本类型 → **值传递**
> - 不需要修改、大对象 → **`const` 引用**
> - 需要修改原始数据 → **引用**
> - 可能为空、或需要 C 兼容 → **指针**

---

## 3. 返回值

### 3.1 返回基本类型

```cpp
int square(int x) {
    return x * x;
}
```

### 3.2 返回引用

```cpp
// 返回引用可以避免拷贝，也可以用于链式调用
class Counter {
    int count_ = 0;
public:
    Counter& increment() {
        count_++;
        return *this;   // 返回自身引用，支持链式调用
    }
    int get() const { return count_; }
};

Counter c;
c.increment().increment().increment();   // 链式调用
std::cout << c.get() << std::endl;       // 3
```

> ⚠️ **永远不要返回局部变量的引用或指针！** 局部变量在函数结束后销毁，引用会成为悬空引用。

```cpp
int& badFunction() {
    int local = 42;
    return local;    // ❌ 危险！局部变量即将销毁
}
```

### 3.3 返回多个值

```cpp
// 方法 1：使用 std::pair / std::tuple
std::pair<int, int> divide(int a, int b) {
    return {a / b, a % b};   // 商和余数
}

auto [quotient, remainder] = divide(17, 5);  // C++17 结构化绑定

// 方法 2：使用输出参数（引用）
void divide(int a, int b, int& quotient, int& remainder) {
    quotient = a / b;
    remainder = a % b;
}

// 方法 3：使用结构体（参数多时推荐）
struct DivResult {
    int quotient;
    int remainder;
};

DivResult divide(int a, int b) {
    return {a / b, a % b};
}
```

---

## 4. 默认参数

```cpp
void printMessage(const std::string& msg, int times = 1, char end = '\n') {
    for (int i = 0; i < times; i++) {
        std::cout << msg << end;
    }
}

printMessage("Hello");            // 打印 1 次，换行
printMessage("Hi", 3);            // 打印 3 次，换行
printMessage("Go", 2, ' ');       // 打印 2 次，空格分隔
```

> ⚠️ **规则**：默认参数必须从**右到左**连续提供，中间不能跳过：

```cpp
void f(int a, int b = 10, int c = 20);   // ✅ 正确
void f(int a, int b = 10, int c);         // ❌ 错误：c 没有默认值却在 b 右边
```

---

## 5. 函数重载

同名函数，但参数列表不同（参数个数、类型或顺序不同）：

```cpp
// 重载 print 函数
void print(int n) {
    std::cout << "整数: " << n << std::endl;
}

void print(double d) {
    std::cout << "浮点数: " << d << std::endl;
}

void print(const std::string& s) {
    std::cout << "字符串: " << s << std::endl;
}

void print(int a, int b) {
    std::cout << "两个整数: " << a << ", " << b << std::endl;
}

int main() {
    print(42);           // 调用 print(int)
    print(3.14);         // 调用 print(double)
    print("hello"s);     // 调用 print(const string&)
    print(1, 2);         // 调用 print(int, int)
}
```

> ⚠️ **注意**：返回类型不同不构成重载。以下是**错误**的：

```cpp
int  compute(int x);     // ❌
double compute(int x);   // 编译错误：无法仅通过返回类型区分
```

### 重载决议

编译器根据实参类型选择最佳匹配。如果匹配有歧义，编译会报错：

```cpp
void f(int n);
void f(double d);

f(3.14f);   // float → 可以转为 int 也可以转为 double → 歧义！编译错误
```

---

## 6. 内联函数

`inline` 建议编译器将函数体直接插入调用处，避免函数调用开销。适合**短小、频繁调用**的函数：

```cpp
inline int max(int a, int b) {
    return (a > b) ? a : b;
}

// 编译器可能将 max(3, 5) 直接替换为 (3 > 5) ? 3 : 5
```

> 💡 `inline` 只是**建议**，编译器可以忽略。现代编译器通常会自行决定是否内联。类内定义的成员函数默认是 `inline` 的。

---

## 7. `constexpr` 函数（C++11）

编译时求值的函数，可用于常量表达式：

```cpp
constexpr int factorial(int n) {
    return (n <= 1) ? 1 : n * factorial(n - 1);
}

constexpr int result = factorial(5);   // 编译时计算为 120
int arr[factorial(4)];                 // 编译时确定数组大小为 24

// C++14 起 constexpr 函数可以包含循环和局部变量
constexpr int fibonacci(int n) {
    if (n <= 1) return n;
    int a = 0, b = 1;
    for (int i = 2; i <= n; i++) {
        int temp = a + b;
        a = b;
        b = temp;
    }
    return b;
}
```

---

## 8. 递归

函数调用自身。必须有**终止条件**，否则会栈溢出：

```cpp
// 阶乘
int factorial(int n) {
    if (n <= 1) return 1;      // 终止条件（基准情形）
    return n * factorial(n - 1);  // 递归调用
}

// 调用过程：
// factorial(4)
//   → 4 * factorial(3)
//     → 3 * factorial(2)
//       → 2 * factorial(1)
//         → 1            ← 终止条件
//       ← 2 * 1 = 2
//     ← 3 * 2 = 6
//   ← 4 * 6 = 24
```

#### 斐波那契数列（递归 vs 迭代）

```cpp
// 递归版本 —— 简单但效率极低（指数时间复杂度）
int fib_recursive(int n) {
    if (n <= 1) return n;
    return fib_recursive(n - 1) + fib_recursive(n - 2);
}

// 迭代版本 —— 高效（线性时间复杂度）
int fib_iterative(int n) {
    if (n <= 1) return n;
    int a = 0, b = 1;
    for (int i = 2; i <= n; i++) {
        int temp = a + b;
        a = b;
        b = temp;
    }
    return b;
}
```

> ⚠️ 递归要注意**栈空间**。每次递归调用都会在栈上分配帧，递归太深会导致栈溢出。

---

## 9. Lambda 表达式（C++11）

匿名函数，可以在使用处直接定义：

```cpp
// 基本语法：[捕获列表](参数列表) -> 返回类型 { 函数体 }
auto add = [](int a, int b) -> int {
    return a + b;
};
std::cout << add(3, 4) << std::endl;   // 7

// 返回类型通常可以省略（自动推导）
auto square = [](int x) { return x * x; };

// 捕获外部变量
int factor = 10;
auto multiply = [factor](int x) { return x * factor; };
std::cout << multiply(5) << std::endl;   // 50

// 按引用捕获
int total = 0;
auto accumulate = [&total](int x) { total += x; };
accumulate(10);
accumulate(20);
std::cout << total << std::endl;   // 30
```

### 捕获列表

| 语法      | 含义                   |
| --------- | ---------------------- |
| `[]`      | 不捕获任何变量         |
| `[x]`     | 按值捕获 x             |
| `[&x]`    | 按引用捕获 x           |
| `[=]`     | 按值捕获所有外部变量   |
| `[&]`     | 按引用捕获所有外部变量 |
| `[=, &x]` | 默认按值，但 x 按引用  |
| `[&, x]`  | 默认按引用，但 x 按值  |

### Lambda 与 STL 配合

```cpp
std::vector<int> nums = {3, 1, 4, 1, 5, 9, 2, 6};

// 排序（自定义比较）
std::sort(nums.begin(), nums.end(), [](int a, int b) {
    return a > b;   // 降序
});

// 查找第一个大于 4 的元素
auto it = std::find_if(nums.begin(), nums.end(), [](int n) {
    return n > 4;
});

// 统计偶数个数
int count = std::count_if(nums.begin(), nums.end(), [](int n) {
    return n % 2 == 0;
});
```

---

## 10. 函数指针与 `std::function`

### 10.1 函数指针

```cpp
int add(int a, int b) { return a + b; }
int sub(int a, int b) { return a - b; }

// 声明函数指针
int (*operation)(int, int);

operation = add;
std::cout << operation(3, 4) << std::endl;  // 7

operation = sub;
std::cout << operation(3, 4) << std::endl;  // -1

// 使用 typedef 简化
typedef int (*MathOp)(int, int);
// 或 C++11:
using MathOp = int(*)(int, int);

void calculate(int a, int b, MathOp op) {
    std::cout << op(a, b) << std::endl;
}

calculate(10, 3, add);   // 13
calculate(10, 3, sub);   // 7
```

### 10.2 `std::function`（C++11，推荐）

比函数指针更通用，可以包装函数、Lambda、函数对象：

```cpp
#include <functional>

std::function<int(int, int)> op;

op = add;                           // 普通函数
op = [](int a, int b) { return a * b; };  // Lambda
op = std::multiplies<int>{};        // 函数对象

std::cout << op(3, 4) << std::endl;   // 12
```

---

## 11. 小结

| 概念            | 说明                        |
| --------------- | --------------------------- |
| 值传递          | 传递副本，不影响原始值      |
| 引用传递        | 传递别名，可修改原始值      |
| const 引用      | 不拷贝、不修改，大对象首选  |
| 指针传递        | 传递地址，可以为 null       |
| 默认参数        | 从右到左提供默认值          |
| 重载            | 同名不同参，编译器自动选择  |
| `inline`        | 建议编译器内联展开          |
| `constexpr`     | 编译时求值                  |
| Lambda          | 匿名函数，配合 STL 算法使用 |
| `std::function` | 通用可调用对象包装器        |

> 🎯 **核心建议**：小类型用值传递，大对象用 `const` 引用传递，需要修改时用引用传递。优先使用 Lambda 和 `std::function` 替代函数指针。
