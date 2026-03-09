---
title: "基本数据类型和变量"
category: "basics"
difficulty: "Easy"
tags: ["数据类型", "变量"]
author: "MallocMentor"
summary: "学习 C++ 的基本数据类型、变量声明和初始化"
estimatedTime: 20
---

# 基本数据类型和变量

C++ 是一门**强类型**语言——每个变量在使用前必须声明其类型，编译器根据类型分配内存和检查操作合法性。理解数据类型是编程的第一步。

---

## 1. 基本数据类型

### 1.1 整数类型

| 类型        | 最小大小 | 典型大小（64 位系统） | 值范围（典型）                 |
| ----------- | -------- | --------------------- | ------------------------------ |
| `short`     | 16 位    | 2 字节                | -32,768 ~ 32,767               |
| `int`       | 16 位    | 4 字节                | -2,147,483,648 ~ 2,147,483,647 |
| `long`      | 32 位    | 4 或 8 字节           | 至少 -2^31 ~ 2^31-1            |
| `long long` | 64 位    | 8 字节                | -2^63 ~ 2^63-1                 |

```cpp
short s = 32767;
int i = 2147483647;
long l = 100000L;
long long ll = 9223372036854775807LL;
```

#### 有符号与无符号

默认情况下整数是**有符号**的（可以表示负数）。加上 `unsigned` 前缀表示无符号（只表示非负数，范围翻倍）：

```cpp
unsigned int ui = 4294967295U;      // 0 ~ 4,294,967,295
unsigned short us = 65535;           // 0 ~ 65,535
unsigned long long ull = 18446744073709551615ULL;  // 0 ~ 2^64-1
```

> ⚠️ **注意**：有符号和无符号混合运算容易产生 bug。`-1 < 1u` 在 C++ 中是 `false`！因为 `-1` 会被隐式转换为一个很大的无符号数。

#### 固定宽度整数类型（C++11，推荐）

标准整数大小是"至少"而非"精确"的，如果需要确定大小，使用 `<cstdint>` 中的类型：

```cpp
#include <cstdint>

int8_t   a = 127;       // 精确 8 位有符号
int16_t  b = 32767;     // 精确 16 位
int32_t  c = 100000;    // 精确 32 位
int64_t  d = 100000LL;  // 精确 64 位

uint8_t  e = 255;       // 精确 8 位无符号
uint32_t f = 4000000000U;
```

### 1.2 浮点类型

| 类型          | 典型大小     | 有效位数 | 范围          |
| ------------- | ------------ | -------- | ------------- |
| `float`       | 4 字节       | ~7 位    | ±3.4 × 10^38  |
| `double`      | 8 字节       | ~15 位   | ±1.7 × 10^308 |
| `long double` | 8/12/16 字节 | ≥15 位   | 平台相关      |

```cpp
float f = 3.14f;           // 注意 f 后缀
double d = 3.141592653589;
long double ld = 3.14159265358979323846L;

// 科学计数法
double avogadro = 6.022e23;    // 6.022 × 10^23
double planck = 6.626e-34;     // 6.626 × 10^-34
```

> ⚠️ **浮点精度问题**：浮点数不能精确表示所有十进制小数。

```cpp
double a = 0.1 + 0.2;
std::cout << std::setprecision(17) << a << std::endl;
// 输出: 0.30000000000000004

// 比较浮点数不要用 ==
if (std::abs(a - 0.3) < 1e-9) {
    std::cout << "近似相等" << std::endl;
}
```

### 1.3 字符类型

| 类型       | 大小     | 说明                   |
| ---------- | -------- | ---------------------- |
| `char`     | 1 字节   | ASCII 字符（或小整数） |
| `wchar_t`  | 2/4 字节 | 宽字符                 |
| `char16_t` | 2 字节   | UTF-16（C++11）        |
| `char32_t` | 4 字节   | UTF-32（C++11）        |
| `char8_t`  | 1 字节   | UTF-8（C++20）         |

```cpp
char c = 'A';           // 单引号表示字符
char newline = '\n';     // 转义字符
char tab = '\t';

// char 本质上是整数
std::cout << (int)c << std::endl;    // 65（ASCII 码）
std::cout << (char)66 << std::endl;  // B

// 常用转义字符
// \n 换行  \t 制表符  \\ 反斜杠  \' 单引号  \" 双引号  \0 空字符
```

### 1.4 布尔类型

```cpp
bool isReady = true;
bool isEmpty = false;

// bool 与整数的转换
bool b1 = 42;     // true（非零即 true）
bool b2 = 0;      // false
int n = true;     // 1
int m = false;    // 0

// 逻辑运算
bool result = (5 > 3) && (2 < 4);  // true
```

### 1.5 `void` 类型

`void` 表示"无类型"，主要用于：

```cpp
// 1. 函数不返回值
void printHello() {
    std::cout << "Hello" << std::endl;
}

// 2. void 指针（通用指针，可指向任何类型）
void* ptr = nullptr;
int x = 42;
ptr = &x;
// 使用时需要强制转换
int* ip = static_cast<int*>(ptr);
```

---

## 2. 使用 `sizeof` 查看类型大小

```cpp
#include <iostream>

int main() {
    std::cout << "bool: "       << sizeof(bool) << " 字节" << std::endl;
    std::cout << "char: "       << sizeof(char) << " 字节" << std::endl;
    std::cout << "short: "      << sizeof(short) << " 字节" << std::endl;
    std::cout << "int: "        << sizeof(int) << " 字节" << std::endl;
    std::cout << "long: "       << sizeof(long) << " 字节" << std::endl;
    std::cout << "long long: "  << sizeof(long long) << " 字节" << std::endl;
    std::cout << "float: "      << sizeof(float) << " 字节" << std::endl;
    std::cout << "double: "     << sizeof(double) << " 字节" << std::endl;
    std::cout << "指针: "       << sizeof(int*) << " 字节" << std::endl;
}
```

典型输出（64 位系统）：

```
bool: 1 字节
char: 1 字节
short: 2 字节
int: 4 字节
long: 4 字节（Windows）/ 8 字节（Linux/macOS）
long long: 8 字节
float: 4 字节
double: 8 字节
指针: 8 字节
```

---

## 3. 变量声明与初始化

### 3.1 声明

```cpp
int age;           // 声明一个 int 变量（未初始化，值是不确定的！）
double salary;     // 声明一个 double 变量
std::string name;  // 声明一个 string 变量（默认初始化为空字符串）
```

### 3.2 初始化方式

C++ 提供了多种初始化语法：

```cpp
// 1. 拷贝初始化（C 风格）
int a = 10;
double pi = 3.14;

// 2. 直接初始化
int b(20);
double e(2.718);

// 3. 列表初始化（C++11，推荐）
int c{30};
double g{9.8};
int d{};          // 值初始化为 0

// 4. 列表初始化（拷贝形式）
int f = {40};
```

> 💡 **推荐使用列表初始化 `{}`**，因为它会检查**窄化转换**：

```cpp
int x = 3.14;    // ⚠️ 编译通过，x = 3（精度丢失，无警告）
int y{3.14};     // ❌ 编译错误！列表初始化禁止窄化转换
```

### 3.3 `auto` 自动类型推导（C++11）

让编译器自动推导变量类型：

```cpp
auto i = 42;           // int
auto d = 3.14;         // double
auto s = std::string("hello");  // std::string
auto b = true;         // bool

// 特别适合长类型名
std::map<std::string, std::vector<int>> data;
auto it = data.begin();  // 比写 std::map<std::string, std::vector<int>>::iterator 方便多了

// auto 与引用
int x = 10;
auto& ref = x;   // int&（引用）
const auto& cref = x;  // const int&
```

> ⚠️ `auto` 必须在声明时初始化，因为编译器需要从初始化表达式推导类型。

### 3.4 `decltype`（C++11）

获取表达式的类型，但不求值：

```cpp
int x = 42;
decltype(x) y = 100;    // y 的类型是 int
decltype(x + 0.5) z;    // z 的类型是 double

// 常用于模板编程
template<typename T1, typename T2>
auto add(T1 a, T2 b) -> decltype(a + b) {
    return a + b;
}
```

---

## 4. 常量

### 4.1 `const`

```cpp
const int MAX_SIZE = 100;    // 编译时或运行时常量
const double PI = 3.14159;

// MAX_SIZE = 200;  // ❌ 编译错误：不能修改 const 变量

// const 通常与引用配合，避免拷贝且防止修改
void print(const std::string& s) {
    std::cout << s << std::endl;
    // s = "new value";  // ❌ 不能修改
}
```

### 4.2 `constexpr`（C++11）

保证在**编译时**求值的常量，比 `const` 更强：

```cpp
constexpr int ARRAY_SIZE = 10;
constexpr double PI = 3.14159265358979;

// constexpr 函数：编译时可计算
constexpr int square(int x) {
    return x * x;
}

constexpr int result = square(5);  // 编译时计算为 25
int arr[square(3)];                // 编译时确定数组大小为 9
```

### 4.3 `#define` 宏（不推荐）

```cpp
#define MAX_SIZE 100    // C 风格宏，预处理器文本替换

// 问题：
// 1. 没有类型检查
// 2. 没有作用域
// 3. 调试困难（替换后的代码看不到宏名）
// 推荐用 const 或 constexpr 替代
```

---

## 5. 类型转换

### 5.1 隐式转换（自动转换）

编译器在必要时自动进行类型转换：

```cpp
int i = 42;
double d = i;        // int → double（安全，提升）
int j = d;           // double → int（危险，截断，丢失小数部分）

// 整数提升
short s = 10;
int result = s + 1;  // short 自动提升为 int

// 算术转换：不同类型运算，较小的类型提升
double mixed = 5 / 2;      // 结果是 2.0！（5/2 是整数除法=2，然后转 double）
double correct = 5.0 / 2;  // 结果是 2.5（5.0 是 double，2 提升为 double）
```

### 5.2 显式转换（C++ 风格）

```cpp
// static_cast：编译时类型转换（最常用）
double d = 3.14;
int i = static_cast<int>(d);       // 3（明确截断）

// const_cast：去除或添加 const
const int* cp = &i;
int* p = const_cast<int*>(cp);     // 去除 const（慎用）

// reinterpret_cast：底层二进制重新解释（危险）
int* ip = &i;
char* bytes = reinterpret_cast<char*>(ip);  // 将 int 当作字节数组

// dynamic_cast：运行时多态转换（需要虚函数，见多态章节）
```

> ⚠️ 避免使用 C 风格强转 `(int)d`，推荐使用 `static_cast` 等，意图更明确且更容易搜索。

---

## 6. 字符串

### 6.1 C 风格字符串

```cpp
const char* str1 = "Hello";       // 字符串字面量（只读）
char str2[] = "World";            // 字符数组（可修改）
char str3[10] = "Hi";             // 固定大小，剩余填 \0

// C 字符串以 \0（空字符）结尾
// "Hello" 在内存中: ['H', 'e', 'l', 'l', 'o', '\0']
```

### 6.2 `std::string`（推荐）

```cpp
#include <string>

std::string s1 = "Hello";
std::string s2("World");
std::string s3 = s1 + ", " + s2 + "!";  // 拼接

// 常用操作
s1.length();        // 5（或 s1.size()）
s1.empty();         // false
s1[0];              // 'H'
s1.at(0);           // 'H'（边界检查）
s1.substr(1, 3);    // "ell"（从位置 1 开始，长度 3）
s1.find("ll");      // 2（找到的位置）
s1.append(" C++");  // "Hello C++"

// 比较
if (s1 == s2) { /* ... */ }
if (s1 < s2)  { /* 字典序比较 */ }

// 遍历
for (char c : s1) {
    std::cout << c << " ";
}

// C++11 原始字符串（不转义）
std::string path = R"(C:\Users\test\file.txt)";
// 等价于 "C:\\Users\\test\\file.txt"
```

---

## 7. 输入与输出

### 7.1 基本 I/O

```cpp
#include <iostream>

int age;
std::string name;

std::cout << "请输入姓名: ";
std::cin >> name;       // 读取一个单词（以空格分隔）

std::cout << "请输入年龄: ";
std::cin >> age;

std::cout << "你好, " << name << "! 你 " << age << " 岁了。" << std::endl;

// 读取整行（包含空格）
std::cin.ignore();      // 忽略上一次 >> 留下的换行符
std::string fullName;
std::getline(std::cin, fullName);
```

### 7.2 格式化输出

```cpp
#include <iostream>
#include <iomanip>

double pi = 3.14159265358979;

std::cout << std::fixed << std::setprecision(2) << pi << std::endl;  // 3.14
std::cout << std::scientific << pi << std::endl;   // 3.14e+00

std::cout << std::setw(10) << std::setfill('0') << 42 << std::endl;
// 输出: 0000000042

std::cout << std::hex << 255 << std::endl;   // ff
std::cout << std::oct << 255 << std::endl;   // 377
std::cout << std::dec << 255 << std::endl;   // 255（恢复十进制）

// C++20: std::format（类似 Python 的 f-string）
// std::cout << std::format("Pi = {:.2f}", pi) << std::endl;
```

---

## 8. 小结

| 概念                | 说明                                           |
| ------------------- | ---------------------------------------------- |
| 整数类型            | `short`, `int`, `long`, `long long`，有/无符号 |
| 浮点类型            | `float` (4B), `double` (8B)，注意精度问题      |
| 字符类型            | `char` (1B)，本质是小整数                      |
| 布尔类型            | `bool`，`true`/`false`                         |
| 初始化              | 推荐列表初始化 `{}`，防止窄化转换              |
| `auto`              | 自动类型推导，简化代码                         |
| `const`/`constexpr` | 常量，`constexpr` 保证编译时计算               |
| `std::string`       | C++ 字符串类，比 C 字符串安全方便              |
| 类型转换            | 推荐 `static_cast`，避免 C 风格强转            |

> 🎯 **核心建议**：用 `int` 处理整数，`double` 处理浮点数，`std::string` 处理字符串，`bool` 处理逻辑值。需要精确大小时用 `<cstdint>` 中的固定宽度类型。
