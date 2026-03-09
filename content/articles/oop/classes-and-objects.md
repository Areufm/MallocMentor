---
title: "类与对象"
category: "oop"
difficulty: "Easy"
tags: ["类", "对象", "构造函数"]
author: "MallocMentor"
summary: "学习 C++ 面向对象编程的基础 —— 类与对象"
estimatedTime: 35
---

# 类与对象

类（class）是 C++ 面向对象编程的基石。它将数据和操作数据的函数封装在一起，形成一个自定义类型。对象（object）则是类的实例——一个具体的、占用内存的实体。

---

## 1. 类的定义与实例化

### 1.1 基本语法

```cpp
class Student {
public:
    // 成员变量（数据）
    std::string name;
    int age;
    double gpa;

    // 成员函数（行为）
    void introduce() {
        std::cout << "我是 " << name
                  << "，今年 " << age << " 岁"
                  << "，GPA: " << gpa << std::endl;
    }
};
```

### 1.2 创建对象

```cpp
// 栈上创建
Student s1;
s1.name = "Alice";
s1.age = 20;
s1.gpa = 3.8;
s1.introduce();  // 我是 Alice，今年 20 岁，GPA: 3.8

// 堆上创建（不推荐裸指针，此处用于演示）
Student* s2 = new Student();
s2->name = "Bob";   // 指针用 -> 访问成员
s2->age = 21;
s2->introduce();
delete s2;

// 使用初始化列表（C++11，需要满足聚合类型条件或有对应构造函数）
Student s3{"Charlie", 22, 3.5};
```

### 1.3 `struct` vs `class`

在 C++ 中，`struct` 和 `class` 几乎相同，唯一的区别是**默认访问权限**：

|              | `struct` | `class`   |
| ------------ | -------- | --------- |
| 默认访问权限 | `public` | `private` |
| 默认继承方式 | `public` | `private` |

```cpp
struct Point {
    double x, y;  // 默认 public
};

class Point2 {
    double x, y;  // 默认 private
};
```

> 💡 **惯例**：简单的数据聚合用 `struct`，有复杂行为的用 `class`。

---

## 2. 访问控制

C++ 提供三种访问说明符来控制成员的可见性：

### 2.1 三种访问级别

```cpp
class BankAccount {
public:      // 公有：任何地方都可以访问
    std::string ownerName;
    double getBalance() const { return balance; }

protected:   // 保护：本类和派生类可以访问
    std::string accountId;

private:     // 私有：只有本类可以访问
    double balance;
    std::string password;
};
```

| 访问级别    | 类内部 | 派生类 | 外部代码 |
| ----------- | ------ | ------ | -------- |
| `public`    | ✅     | ✅     | ✅       |
| `protected` | ✅     | ✅     | ❌       |
| `private`   | ✅     | ❌     | ❌       |

### 2.2 封装的意义

```cpp
class Temperature {
public:
    // 通过公有方法控制访问，可以添加验证逻辑
    void setCelsius(double c) {
        if (c < -273.15) {
            throw std::invalid_argument("温度不能低于绝对零度");
        }
        celsius = c;
    }

    double getCelsius() const { return celsius; }
    double getFahrenheit() const { return celsius * 9.0 / 5.0 + 32.0; }

private:
    double celsius = 0.0;
};
```

封装的好处：

- **数据保护**：防止外部代码直接修改内部状态
- **接口稳定**：内部实现可以自由更改，不影响使用方
- **可验证**：setter 可以添加合法性检查

---

## 3. 构造函数与析构函数

### 3.1 构造函数

构造函数在对象创建时自动调用，用于初始化成员变量。

```cpp
class Vector2D {
public:
    // 默认构造函数
    Vector2D() : x(0.0), y(0.0) {}

    // 参数化构造函数
    Vector2D(double x, double y) : x(x), y(y) {}

    // C++11 委托构造函数
    Vector2D(double val) : Vector2D(val, val) {}

    void print() const {
        std::cout << "(" << x << ", " << y << ")" << std::endl;
    }

private:
    double x, y;
};

Vector2D v1;          // 调用默认构造：(0, 0)
Vector2D v2(3.0, 4.0); // 调用参数化构造：(3, 4)
Vector2D v3(5.0);      // 调用委托构造：(5, 5)
```

### 3.2 成员初始化列表

初始化列表在构造函数体执行**之前**初始化成员，效率更高且有些场景下是**必须**的：

```cpp
class Entity {
    const int id;              // const 成员必须在初始化列表中初始化
    std::string& nameRef;     // 引用成员必须在初始化列表中初始化
    std::string name;

public:
    // ✅ 用初始化列表初始化
    Entity(int id, std::string& name)
        : id(id), nameRef(name), name(name) {}

    // ❌ 以下写法对 const 和引用成员会编译失败
    // Entity(int id, std::string& name) {
    //     this->id = id;       // 错误：不能赋值给 const
    //     this->nameRef = name; // 错误：引用必须初始化
    // }
};
```

> 💡 **最佳实践**：始终使用成员初始化列表，尤其是对于类类型成员（避免先默认构造再赋值）。

### 3.3 析构函数

析构函数在对象销毁时自动调用，用于释放资源：

```cpp
class FileLogger {
public:
    FileLogger(const std::string& filename) {
        file = fopen(filename.c_str(), "a");
        if (!file) throw std::runtime_error("无法打开文件");
        std::cout << "日志文件已打开" << std::endl;
    }

    ~FileLogger() {
        if (file) {
            fclose(file);
            std::cout << "日志文件已关闭" << std::endl;
        }
    }

    void log(const std::string& msg) {
        fprintf(file, "%s\n", msg.c_str());
    }

private:
    FILE* file = nullptr;
};

{
    FileLogger logger("app.log");  // 构造：日志文件已打开
    logger.log("Hello");
}  // 离开作用域：日志文件已关闭
```

析构函数的调用时机：

- 栈对象离开作用域时
- `delete` 堆对象时
- 容器销毁时（对所有元素调用析构）

---

## 4. 拷贝构造与拷贝赋值

### 4.1 拷贝构造函数

用已有对象初始化新对象时调用：

```cpp
class DynamicArray {
    int* data;
    size_t size;

public:
    DynamicArray(size_t n) : data(new int[n]()), size(n) {}

    // 拷贝构造函数：深拷贝
    DynamicArray(const DynamicArray& other)
        : data(new int[other.size]), size(other.size) {
        std::copy(other.data, other.data + size, data);
        std::cout << "拷贝构造" << std::endl;
    }

    ~DynamicArray() { delete[] data; }

    int& operator[](size_t i) { return data[i]; }
    size_t getSize() const { return size; }
};

DynamicArray a(5);
a[0] = 42;
DynamicArray b = a;   // 拷贝构造
DynamicArray c(a);     // 也是拷贝构造
```

### 4.2 深拷贝 vs 浅拷贝

```
浅拷贝（默认行为）：             深拷贝（自定义实现）：
a.data ──→ [42, 0, 0, 0, 0]    a.data ──→ [42, 0, 0, 0, 0]
              ↑                  b.data ──→ [42, 0, 0, 0, 0]  (独立副本)
b.data ──────┘ (共享同一内存)
```

浅拷贝的问题：两个对象析构时会对同一块内存 `delete[]` 两次 → 双重释放！

### 4.3 拷贝赋值运算符

用已有对象赋值给另一个已有对象时调用：

```cpp
class DynamicArray {
    // ... 同上 ...

    // 拷贝赋值运算符（Copy-and-Swap 惯用法）
    DynamicArray& operator=(DynamicArray other) {  // 注意：按值传递
        swap(*this, other);
        return *this;
    }

    friend void swap(DynamicArray& a, DynamicArray& b) noexcept {
        using std::swap;
        swap(a.data, b.data);
        swap(a.size, b.size);
    }
};

DynamicArray a(5), b(3);
b = a;  // 拷贝赋值
```

> Copy-and-Swap 惯用法同时保证了**异常安全**和**自赋值安全**。

### 4.4 Rule of Three / Five / Zero

| 规则              | 内容                                                                           |
| ----------------- | ------------------------------------------------------------------------------ |
| **Rule of Three** | 如果你需要自定义析构函数、拷贝构造或拷贝赋值中的任何一个，通常三个都需要自定义 |
| **Rule of Five**  | C++11 新增移动构造和移动赋值，五个特殊成员函数要么全部自定义，要么全部不自定义 |
| **Rule of Zero**  | 让成员使用 RAII 类型（智能指针、容器），不需要自定义任何特殊成员函数           |

```cpp
// Rule of Zero 示例 —— 推荐的现代 C++ 风格
class ModernArray {
    std::vector<int> data;  // vector 已经管理了内存

public:
    ModernArray(size_t n) : data(n) {}
    // 不需要自定义任何拷贝/移动/析构函数！
    // 编译器自动生成的版本完全正确
};
```

---

## 5. `this` 指针

每个非静态成员函数内部都有一个隐含的 `this` 指针，指向调用该函数的对象：

```cpp
class Chain {
    int value;

public:
    Chain(int v) : value(v) {}

    // 返回 *this 实现链式调用
    Chain& add(int n) {
        value += n;
        return *this;
    }

    Chain& multiply(int n) {
        value *= n;
        return *this;
    }

    void print() const {
        std::cout << value << std::endl;
    }
};

Chain c(1);
c.add(2).multiply(3).add(4).print();  // (1 + 2) * 3 + 4 = 13
```

`this` 的常见用途：

- 区分成员变量和同名参数：`this->name = name;`
- 返回自身引用实现链式调用
- 将自身传递给其他函数

---

## 6. 友元函数与友元类

友元可以访问类的 `private` 和 `protected` 成员，是对封装的可控"突破"。

### 6.1 友元函数

```cpp
class Rectangle {
    double width, height;

public:
    Rectangle(double w, double h) : width(w), height(h) {}

    // 声明友元函数
    friend double area(const Rectangle& r);
    friend std::ostream& operator<<(std::ostream& os, const Rectangle& r);
};

// 友元函数的定义（不是成员函数，没有 Rectangle:: 前缀）
double area(const Rectangle& r) {
    return r.width * r.height;  // 可以直接访问 private 成员
}

std::ostream& operator<<(std::ostream& os, const Rectangle& r) {
    os << "Rectangle(" << r.width << " x " << r.height << ")";
    return os;
}

Rectangle r(3, 4);
std::cout << area(r) << std::endl;  // 12
std::cout << r << std::endl;        // Rectangle(3 x 4)
```

### 6.2 友元类

```cpp
class Engine {
    friend class Car;  // Car 可以访问 Engine 的所有私有成员
private:
    int horsepower = 200;
    void start() { std::cout << "引擎启动" << std::endl; }
};

class Car {
    Engine engine;
public:
    void drive() {
        engine.start();  // 可以访问 Engine 的私有方法
        std::cout << "马力: " << engine.horsepower << std::endl;
    }
};
```

> ⚠️ 友元关系**不可传递**（A 是 B 的友元，B 是 C 的友元，A 不是 C 的友元）、**不可继承**、**单向的**。

---

## 7. `static` 成员

### 7.1 静态成员变量

属于类而非对象，所有对象共享同一份：

```cpp
class Player {
    static int playerCount;  // 声明
    std::string name;

public:
    Player(const std::string& name) : name(name) {
        ++playerCount;
    }

    ~Player() {
        --playerCount;
    }

    static int getPlayerCount() {
        return playerCount;
    }
};

// 类外定义并初始化（必须！）
int Player::playerCount = 0;

int main() {
    Player p1("Alice");
    Player p2("Bob");
    std::cout << Player::getPlayerCount() << std::endl;  // 2

    {
        Player p3("Charlie");
        std::cout << Player::getPlayerCount() << std::endl;  // 3
    }
    std::cout << Player::getPlayerCount() << std::endl;  // 2
}
```

### 7.2 静态成员函数

- 没有 `this` 指针
- 只能访问静态成员变量和其他静态成员函数
- 可以通过类名直接调用：`ClassName::staticFunc()`

```cpp
class MathUtils {
public:
    static double pi() { return 3.14159265358979; }

    static double circleArea(double r) {
        return pi() * r * r;
    }
};

double area = MathUtils::circleArea(5.0);
```

### 7.3 C++17 内联静态成员

```cpp
class Config {
public:
    // C++17：inline static 可以直接在类内初始化
    inline static int maxConnections = 100;
    inline static std::string appName = "MallocMentor";
};
```

---

## 8. 小结

| 概念     | 说明                                   |
| -------- | -------------------------------------- |
| 类定义   | `class` / `struct`，封装数据和行为     |
| 访问控制 | `public` / `protected` / `private`     |
| 构造函数 | 对象创建时自动调用，推荐使用初始化列表 |
| 析构函数 | 对象销毁时自动调用，释放资源           |
| 拷贝语义 | 拷贝构造 + 拷贝赋值，注意深浅拷贝      |
| `this`   | 指向当前对象的隐式指针                 |
| 友元     | `friend` 突破封装访问私有成员          |
| `static` | 属于类的成员，所有对象共享             |

> 🎯 **设计原则**：遵循 Rule of Zero，让 RAII 类型管理资源；用封装保护数据完整性；合理使用 `static` 和 `friend`，不要过度破坏封装。
