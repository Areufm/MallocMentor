---
title: "指针基础"
category: "pointer"
difficulty: "Medium"
tags: ["指针", "地址", "解引用"]
author: "MallocMentor"
summary: "深入理解指针的概念、声明、使用和常见陷阱"
estimatedTime: 40
---

# 指针基础

指针是 C/C++ 最核心也最强大的特性之一。它直接操作内存地址，赋予程序员对底层资源的精细控制能力。理解指针是掌握动态内存管理、数据结构实现和系统级编程的基础。

---

## 1. 什么是指针

指针是一个**变量**，它存储的值是另一个变量的**内存地址**，而非普通数据。

```
内存示意图：

变量 a:  [ 42 ]    地址: 0x7ffc0010
指针 p:  [0x7ffc0010]  地址: 0x7ffc0018
              |
              +-------> 指向变量 a
```

每个变量在内存中都有确定的地址，指针就是用来**间接访问**这些地址中的数据的工具。

---

## 2. 指针的声明与初始化

### 2.1 声明语法

```cpp
type* pointer_name;   // 推荐风格：* 靠近类型
type *pointer_name;   // C 风格：* 靠近变量名
type * pointer_name;  // 也合法，但不推荐
```

常见类型的指针声明：

```cpp
int* p1;       // 指向 int 的指针
double* p2;    // 指向 double 的指针
char* p3;      // 指向 char 的指针
void* p4;      // 万能指针，可以指向任意类型
```

> ⚠️ **注意**：在一行中声明多个变量时，`*` 仅修饰紧邻的变量：
>
> ```cpp
> int* a, b;  // a 是 int*，b 是 int（不是指针！）
> int *a, *b; // a 和 b 都是 int*
> ```

### 2.2 初始化

指针在声明后应立即初始化，未初始化的指针包含**不确定的值**，使用它会导致未定义行为。

```cpp
int value = 42;
int* ptr = &value;      // 用取地址运算符初始化
int* ptr2 = nullptr;    // 初始化为空指针（C++11）
int* ptr3 = NULL;       // C 风格空指针（不推荐在 C++ 中使用）
int* ptr4 = 0;          // 等价于 NULL（不推荐）
```

---

## 3. 取地址运算符 `&` 与解引用运算符 `*`

### 3.1 取地址 `&`

`&` 运算符返回操作数的内存地址：

```cpp
int x = 100;
int* p = &x;  // p 存储 x 的地址

std::cout << "x 的值: " << x << std::endl;     // 100
std::cout << "x 的地址: " << &x << std::endl;  // 0x7ffc...（某个地址）
std::cout << "p 的值: " << p << std::endl;      // 与 &x 相同
```

### 3.2 解引用 `*`

`*` 运算符（用于已声明的指针时）访问指针所指向地址处的值：

```cpp
int x = 100;
int* p = &x;

std::cout << *p << std::endl;  // 100，读取 p 指向的值

*p = 200;                      // 通过指针修改 x 的值
std::cout << x << std::endl;   // 200
```

> 声明时的 `*` 表示"这是一个指针"，表达式中的 `*` 表示"解引用"。两者含义完全不同。

### 3.3 多级指针

指针本身也是变量，因此可以有指向指针的指针：

```cpp
int val = 10;
int* p = &val;     // 一级指针
int** pp = &p;     // 二级指针
int*** ppp = &pp;  // 三级指针

std::cout << **pp << std::endl;   // 10
std::cout << ***ppp << std::endl; // 10
```

多级指针在动态二维数组和函数参数传递中有实际应用，但一般不建议超过二级。

---

## 4. 指针算术

指针支持加减运算，但运算的单位是**所指向类型的大小**，而非字节。

### 4.1 指针加减整数

```cpp
int arr[] = {10, 20, 30, 40, 50};
int* p = arr;  // 指向 arr[0]

std::cout << *p << std::endl;       // 10
std::cout << *(p + 1) << std::endl; // 20（前进 sizeof(int) 字节）
std::cout << *(p + 3) << std::endl; // 40

p += 2;  // p 现在指向 arr[2]
std::cout << *p << std::endl;       // 30

p--;     // p 现在指向 arr[1]
std::cout << *p << std::endl;       // 20
```

### 4.2 指针之间的减法

两个同类型指针相减，结果是它们之间元素的个数（类型为 `ptrdiff_t`）：

```cpp
int arr[] = {10, 20, 30, 40, 50};
int* p1 = &arr[1];
int* p2 = &arr[4];

ptrdiff_t diff = p2 - p1;  // 3（相差 3 个 int 元素）
```

> ⚠️ 两个指针相加是**非法的**，没有语义意义。

### 4.3 指针比较

指针可以使用关系运算符进行比较：

```cpp
int arr[] = {10, 20, 30};
int* p1 = &arr[0];
int* p2 = &arr[2];

if (p1 < p2) {
    std::cout << "p1 在 p2 前面" << std::endl;  // 将输出
}

if (p1 == p2) {
    std::cout << "指向同一位置" << std::endl;
}
```

---

## 5. 空指针 `nullptr`

### 5.1 为什么需要空指针

空指针表示"不指向任何有效对象"，是判断指针是否可用的重要标志。

```cpp
int* p = nullptr;  // C++11 推荐的空指针表示

// 使用前务必检查
if (p != nullptr) {
    std::cout << *p << std::endl;
} else {
    std::cout << "指针为空，无法解引用" << std::endl;
}
```

### 5.2 `nullptr` vs `NULL` vs `0`

| 表达      | 类型                     | 推荐度          |
| --------- | ------------------------ | --------------- |
| `nullptr` | `std::nullptr_t`         | ✅ C++11 推荐   |
| `NULL`    | 通常为 `0` 或 `(void*)0` | ⚠️ 可能引起歧义 |
| `0`       | `int`                    | ❌ 不推荐       |

`nullptr` 的类型安全优势：

```cpp
void func(int n)    { std::cout << "int 版本" << std::endl; }
void func(int* ptr) { std::cout << "指针版本" << std::endl; }

func(NULL);     // 可能调用 int 版本！（NULL 可能被定义为 0）
func(nullptr);  // 明确调用指针版本 ✅
```

---

## 6. 野指针与悬空指针

### 6.1 野指针（Wild Pointer）

未初始化的指针，它的值是内存中的随机垃圾值，指向不确定的位置：

```cpp
int* p;          // 野指针！值未知
*p = 42;         // ❌ 未定义行为，可能崩溃
```

**防范**：声明指针时**立即初始化**。

```cpp
int* p = nullptr;  // ✅ 安全
```

### 6.2 悬空指针（Dangling Pointer）

指针原本指向合法对象，但该对象已被销毁，指针仍保留旧地址：

```cpp
// 情况 1：指向已释放的堆内存
int* p = new int(42);
delete p;
// p 现在是悬空指针，*p 是未定义行为
*p = 100;  // ❌ 危险！

// 情况 2：指向已离开作用域的局部变量
int* createDangling() {
    int local = 10;
    return &local;  // ❌ local 在函数返回后已销毁
}

// 情况 3：指向已被 realloc 的内存
```

**防范**：释放后将指针置为 `nullptr`。

```cpp
int* p = new int(42);
delete p;
p = nullptr;  // ✅ 释放后置空

if (p != nullptr) {
    // 安全使用
}
```

---

## 7. 指针与数组的关系

在 C/C++ 中，数组名在大多数表达式中会**隐式退化**为指向首元素的指针。

### 7.1 数组名退化

```cpp
int arr[] = {10, 20, 30, 40, 50};
int* p = arr;  // arr 退化为 &arr[0]

// 以下两种访问方式等价
std::cout << arr[2] << std::endl;     // 30
std::cout << *(p + 2) << std::endl;   // 30
std::cout << *(arr + 2) << std::endl; // 30
std::cout << p[2] << std::endl;       // 30
```

> 编译器将 `arr[i]` 转换为 `*(arr + i)`，下标运算符本质上就是指针算术。

### 7.2 数组名 ≠ 指针

尽管数组名可以退化为指针，但它们有本质区别：

```cpp
int arr[5] = {1, 2, 3, 4, 5};
int* p = arr;

std::cout << sizeof(arr) << std::endl;  // 20（5 * sizeof(int)）
std::cout << sizeof(p) << std::endl;    // 8（64 位系统上指针大小）

// arr = p;  // ❌ 编译错误：数组名不可赋值
```

### 7.3 使用指针遍历数组

```cpp
int arr[] = {10, 20, 30, 40, 50};
int len = sizeof(arr) / sizeof(arr[0]);

// 指针遍历
for (int* p = arr; p < arr + len; ++p) {
    std::cout << *p << " ";
}
// 输出: 10 20 30 40 50
```

### 7.4 指针与字符串

C 风格字符串本质上是 `char` 数组，通常使用 `const char*` 指向字符串字面量：

```cpp
const char* greeting = "Hello, World!";
// greeting 指向只读的字符串字面量

// 遍历字符串
while (*greeting != '\0') {
    std::cout << *greeting;
    ++greeting;
}
```

---

## 8. const 指针

`const` 与指针的组合有多种形式，理解它们的区别至关重要。

### 8.1 指向常量的指针（pointer to const）

不能通过指针修改所指向的值，但指针本身可以改指向别处：

```cpp
int a = 10, b = 20;
const int* p = &a;  // 或 int const* p = &a;

// *p = 30;   // ❌ 编译错误：不能通过 p 修改值
p = &b;       // ✅ 可以改变指针的指向
```

### 8.2 常量指针（const pointer）

指针本身不可更改指向，但可以通过它修改所指向的值：

```cpp
int a = 10, b = 20;
int* const p = &a;

*p = 30;      // ✅ 可以修改指向的值
// p = &b;    // ❌ 编译错误：不能改变指针的指向
```

### 8.3 指向常量的常量指针（const pointer to const）

既不能改指向，也不能通过它修改值：

```cpp
int a = 10;
const int* const p = &a;

// *p = 30;   // ❌ 不能修改值
// p = &b;    // ❌ 不能改指向
```

### 8.4 记忆口诀

从右往左读，`const` 修饰它**左边**最近的东西：

| 声明                 | 含义                         | 口诀           |
| -------------------- | ---------------------------- | -------------- |
| `const int* p`       | 指向 const int 的指针        | 指向的值不可变 |
| `int* const p`       | 指向 int 的 const 指针       | 指针本身不可变 |
| `const int* const p` | 指向 const int 的 const 指针 | 都不可变       |

---

## 9. 指针作为函数参数

### 9.1 通过指针修改外部变量

```cpp
void swap(int* a, int* b) {
    int temp = *a;
    *a = *b;
    *b = temp;
}

int main() {
    int x = 10, y = 20;
    swap(&x, &y);
    std::cout << x << " " << y << std::endl;  // 20 10
}
```

### 9.2 数组作为参数传递

数组传入函数时退化为指针，需要额外传递长度：

```cpp
void printArray(const int* arr, int size) {
    for (int i = 0; i < size; ++i) {
        std::cout << arr[i] << " ";
    }
    std::cout << std::endl;
}

int main() {
    int arr[] = {1, 2, 3, 4, 5};
    printArray(arr, 5);
}
```

---

## 10. 小结

| 概念         | 说明                                   |
| ------------ | -------------------------------------- |
| 指针声明     | `type* name;` 存储地址的变量           |
| `&`          | 取地址运算符，获取变量地址             |
| `*`          | 解引用运算符，访问指针指向的值         |
| 指针算术     | 以指向类型大小为单位移动               |
| `nullptr`    | C++11 类型安全空指针                   |
| 野指针       | 未初始化的指针，值不确定               |
| 悬空指针     | 指向已销毁对象的指针                   |
| 数组退化     | 数组名在表达式中退化为指向首元素的指针 |
| `const` 指针 | 根据 `const` 位置决定何者不可变        |

> 💡 **最佳实践**：始终初始化指针，释放后置空，优先使用引用和智能指针替代裸指针。现代 C++ 中，裸指针主要用于非拥有（non-owning）的观察场景。
