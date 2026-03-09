---
title: "多态与虚函数"
category: "oop"
difficulty: "Medium"
tags: ["多态", "虚函数", "vtable"]
author: "MallocMentor"
summary: "深入理解运行时多态、虚函数表与纯虚函数"
estimatedTime: 40
---

# 多态与虚函数

多态（Polymorphism）是面向对象编程的灵魂。它允许通过同一个接口调用不同对象的具体实现，让代码更加灵活和可扩展。C++ 中的多态分为**编译时多态**和**运行时多态**两种。

---

## 1. 编译时多态（静态多态）

编译时多态在**编译阶段**确定调用哪个函数，通过函数重载和模板实现。

### 1.1 函数重载（Overloading）

同一作用域内，函数名相同但**参数列表不同**（参数个数、类型或顺序不同）：

```cpp
class Printer {
public:
    void print(int x) {
        std::cout << "整数: " << x << std::endl;
    }

    void print(double x) {
        std::cout << "浮点数: " << x << std::endl;
    }

    void print(const std::string& s) {
        std::cout << "字符串: " << s << std::endl;
    }

    void print(int x, int y) {
        std::cout << "两个整数: " << x << ", " << y << std::endl;
    }
};

Printer p;
p.print(42);          // 调用 print(int)
p.print(3.14);        // 调用 print(double)
p.print("hello");     // 调用 print(const string&)
p.print(1, 2);        // 调用 print(int, int)
```

> ⚠️ **仅返回值类型不同**不能构成重载。`int func()` 和 `double func()` 不是合法重载。

### 1.2 运算符重载

```cpp
class Vector2D {
public:
    double x, y;

    Vector2D(double x = 0, double y = 0) : x(x), y(y) {}

    // 加法运算符重载
    Vector2D operator+(const Vector2D& other) const {
        return Vector2D(x + other.x, y + other.y);
    }

    // 输出运算符重载（友元函数）
    friend std::ostream& operator<<(std::ostream& os, const Vector2D& v) {
        os << "(" << v.x << ", " << v.y << ")";
        return os;
    }
};

Vector2D a(1, 2), b(3, 4);
Vector2D c = a + b;
std::cout << c << std::endl;  // (4, 6)
```

### 1.3 模板（Templates）

模板让编译器根据使用时的**具体类型**生成对应的函数或类：

```cpp
// 函数模板
template<typename T>
T maximum(T a, T b) {
    return (a > b) ? a : b;
}

std::cout << maximum(3, 7) << std::endl;       // int 版本 → 7
std::cout << maximum(3.14, 2.72) << std::endl;  // double 版本 → 3.14
std::cout << maximum<std::string>("abc", "xyz") << std::endl;  // string 版本 → xyz

// 类模板
template<typename T, size_t N>
class FixedArray {
    T data[N];
public:
    T& operator[](size_t i) { return data[i]; }
    constexpr size_t size() const { return N; }
};

FixedArray<int, 5> arr;   // 编译时生成 int[5] 的版本
FixedArray<double, 3> darr; // 编译时生成 double[3] 的版本
```

---

## 2. 运行时多态（动态多态）

运行时多态通过**虚函数 + 继承 + 基类指针/引用**实现，在**运行时**决定调用哪个函数。

### 2.1 问题引入

```cpp
class Shape {
public:
    void draw() {
        std::cout << "绘制形状" << std::endl;
    }
};

class Circle : public Shape {
public:
    void draw() {
        std::cout << "绘制圆形" << std::endl;
    }
};

Shape* s = new Circle();
s->draw();  // 输出：绘制形状 ← 调用的是 Shape::draw，不是我们期望的！
delete s;
```

基类指针调用非虚函数时，始终调用**基类版本**——这叫**静态绑定**。

### 2.2 虚函数（Virtual Function）

在基类中用 `virtual` 关键字声明的函数，通过基类指针或引用调用时，会在运行时调用**实际对象**的版本：

```cpp
class Shape {
public:
    virtual void draw() {
        std::cout << "绘制形状" << std::endl;
    }

    virtual double area() {
        return 0.0;
    }

    // 虚析构函数 —— 非常重要！
    virtual ~Shape() {
        std::cout << "Shape 析构" << std::endl;
    }
};

class Circle : public Shape {
    double radius;
public:
    Circle(double r) : radius(r) {}

    void draw() override {
        std::cout << "绘制圆形，半径 = " << radius << std::endl;
    }

    double area() override {
        return 3.14159 * radius * radius;
    }

    ~Circle() override {
        std::cout << "Circle 析构" << std::endl;
    }
};

class Rectangle : public Shape {
    double width, height;
public:
    Rectangle(double w, double h) : width(w), height(h) {}

    void draw() override {
        std::cout << "绘制矩形，" << width << " x " << height << std::endl;
    }

    double area() override {
        return width * height;
    }
};

// 运行时多态的威力
void renderAll(std::vector<Shape*>& shapes) {
    for (auto* shape : shapes) {
        shape->draw();    // 运行时决定调用哪个 draw
        std::cout << "面积: " << shape->area() << std::endl;
    }
}

int main() {
    std::vector<Shape*> shapes;
    shapes.push_back(new Circle(5.0));
    shapes.push_back(new Rectangle(3.0, 4.0));
    shapes.push_back(new Circle(2.0));

    renderAll(shapes);  // 每个 shape 调用自己的 draw 和 area

    for (auto* s : shapes) delete s;  // 虚析构确保正确释放
}
```

### 2.3 虚析构函数

通过基类指针 `delete` 派生类对象时，如果析构函数不是虚函数，**只会调用基类的析构函数**，派生类的析构函数不会被调用，导致资源泄漏：

```cpp
class Base {
public:
    ~Base() { std::cout << "~Base" << std::endl; }  // 非虚析构
};

class Derived : public Base {
    int* data;
public:
    Derived() : data(new int[100]) {}
    ~Derived() {
        delete[] data;
        std::cout << "~Derived" << std::endl;
    }
};

Base* p = new Derived();
delete p;  // ❌ 只调用 ~Base，~Derived 不执行 → 内存泄漏！
```

> 🔴 **规则：只要类有虚函数（即设计为被继承），析构函数就应该声明为 `virtual`。**

---

## 3. 虚函数表（vtable）原理

### 3.1 vtable 机制

当类中声明了虚函数时，编译器会为该类生成一个**虚函数表（vtable）**——一个函数指针数组。每个含虚函数的对象内部包含一个**虚表指针（vptr）**，指向所属类的 vtable。

```
Shape 的 vtable:                Circle 的 vtable:
┌──────────────────┐            ┌──────────────────┐
│ &Shape::draw     │            │ &Circle::draw    │  ← 覆盖
│ &Shape::area     │            │ &Circle::area    │  ← 覆盖
│ &Shape::~Shape   │            │ &Circle::~Circle │  ← 覆盖
└──────────────────┘            └──────────────────┘

Shape 对象内存:     Circle 对象内存:
┌────────┐          ┌────────┐
│  vptr ─┼──→ Shape vtable    │  vptr ─┼──→ Circle vtable
├────────┤          ├────────┤
│ (成员) │          │ radius │
└────────┘          └────────┘
```

### 3.2 动态分派过程

```cpp
Shape* s = new Circle(5.0);
s->draw();
```

编译器生成的伪代码：

```
1. 从对象 s 获取 vptr        → Circle 的 vtable
2. 在 vtable 中查找 draw 的槽位 → &Circle::draw
3. 调用 Circle::draw()
```

这就是为什么通过基类指针可以调用派生类的函数——运行时通过 vptr 查 vtable 找到正确的函数。

### 3.3 虚函数的开销

| 开销 | 说明                                             |
| ---- | ------------------------------------------------ |
| 空间 | 每个对象增加一个 vptr（通常 8 字节）             |
| 时间 | 每次虚函数调用多一次间接寻址（vtable 查找）      |
| 内联 | 虚函数无法内联（编译器不知道运行时调用哪个版本） |

> 对于性能极其敏感的场景（如游戏引擎的热路径），考虑使用 CRTP（Curiously Recurring Template Pattern）等编译时多态技术。

---

## 4. 纯虚函数与抽象类

### 4.1 纯虚函数

在虚函数声明末尾添加 `= 0`，使其成为**纯虚函数**。包含纯虚函数的类是**抽象类**，不能直接实例化：

```cpp
class Shape {
public:
    // 纯虚函数：没有默认实现，派生类必须覆盖
    virtual void draw() const = 0;
    virtual double area() const = 0;
    virtual double perimeter() const = 0;

    virtual ~Shape() = default;

    // 抽象类可以有非纯虚函数和普通成员
    void describe() const {
        std::cout << "这是一个形状，面积 = " << area() << std::endl;
    }
};

// Shape s;  // ❌ 编译错误：不能实例化抽象类

class Circle : public Shape {
    double radius;
public:
    Circle(double r) : radius(r) {}

    void draw() const override {
        std::cout << "○ (r=" << radius << ")" << std::endl;
    }

    double area() const override {
        return 3.14159 * radius * radius;
    }

    double perimeter() const override {
        return 2 * 3.14159 * radius;
    }
};

Circle c(5);
c.draw();        // ✅
c.describe();    // ✅ 调用基类的非纯虚函数
```

### 4.2 纯虚函数也可以有实现

```cpp
class Base {
public:
    virtual void func() = 0;  // 仍然是纯虚函数，类仍然是抽象类
};

// 在类外提供默认实现
void Base::func() {
    std::cout << "Base 的默认实现" << std::endl;
}

class Derived : public Base {
public:
    void func() override {
        Base::func();  // 可以显式调用基类的实现
        std::cout << "Derived 的扩展" << std::endl;
    }
};
```

### 4.3 接口类（Interface）

只包含纯虚函数的抽象类，等价于其他语言中的「接口」：

```cpp
class ISerializable {
public:
    virtual std::string serialize() const = 0;
    virtual void deserialize(const std::string& data) = 0;
    virtual ~ISerializable() = default;
};

class IDrawable {
public:
    virtual void draw() const = 0;
    virtual ~IDrawable() = default;
};

// 一个类可以"实现"多个接口
class Widget : public ISerializable, public IDrawable {
public:
    std::string serialize() const override { return "widget_data"; }
    void deserialize(const std::string& data) override { /* ... */ }
    void draw() const override { std::cout << "Widget" << std::endl; }
};
```

---

## 5. `override` 和 `final` 关键字

### 5.1 `override`（C++11）

显式标记函数为覆盖基类虚函数。如果签名不匹配，编译器会报错：

```cpp
class Base {
public:
    virtual void func(int x) {}
};

class Derived : public Base {
public:
    // void func(double x) override {}  // ❌ 编译错误！签名不匹配，不是覆盖
    void func(int x) override {}        // ✅ 正确覆盖
};
```

没有 `override` 时，签名写错只会变成一个**新函数**，不会覆盖基类版本，bug 极难发现。

> 💡 **最佳实践**：所有覆盖虚函数的地方都加上 `override`。

### 5.2 `final`（C++11）

`final` 可以用于：

**防止类被继续继承：**

```cpp
class Singleton final {
    // ...
};

// class Derived : public Singleton {};  // ❌ 编译错误
```

**防止虚函数被进一步覆盖：**

```cpp
class Base {
public:
    virtual void func() {}
};

class Middle : public Base {
public:
    void func() override final {}  // 到此为止，不允许再覆盖
};

class Bottom : public Middle {
public:
    // void func() override {}  // ❌ 编译错误：func 已被标记为 final
};
```

---

## 6. RTTI 与 `dynamic_cast`

RTTI（Run-Time Type Information，运行时类型信息）允许在运行时查询对象的实际类型。

### 6.1 `dynamic_cast`

用于在继承层次中进行安全的向下转型（downcast）：

```cpp
class Base {
public:
    virtual ~Base() = default;  // 必须有虚函数才能使用 dynamic_cast
};

class Derived : public Base {
public:
    void specialMethod() {
        std::cout << "Derived 的特殊方法" << std::endl;
    }
};

class Other : public Base {};

void process(Base* base) {
    // 尝试将 Base* 转为 Derived*
    if (Derived* d = dynamic_cast<Derived*>(base)) {
        // 转换成功
        d->specialMethod();
    } else {
        // 转换失败，返回 nullptr
        std::cout << "不是 Derived 类型" << std::endl;
    }
}

Base* b1 = new Derived();
Base* b2 = new Other();

process(b1);  // Derived 的特殊方法
process(b2);  // 不是 Derived 类型

delete b1;
delete b2;
```

### 6.2 引用的 `dynamic_cast`

对引用使用 `dynamic_cast` 时，失败会抛出 `std::bad_cast` 异常：

```cpp
void process(Base& base) {
    try {
        Derived& d = dynamic_cast<Derived&>(base);
        d.specialMethod();
    } catch (const std::bad_cast& e) {
        std::cout << "类型转换失败: " << e.what() << std::endl;
    }
}
```

### 6.3 `typeid` 运算符

```cpp
#include <typeinfo>

Base* b = new Derived();
std::cout << typeid(*b).name() << std::endl;  // 输出实际类型（编译器相关）

if (typeid(*b) == typeid(Derived)) {
    std::cout << "是 Derived 类型" << std::endl;
}

delete b;
```

### 6.4 转型方式对比

| 转型               | 检查时机 | 安全性                        | 开销   |
| ------------------ | -------- | ----------------------------- | ------ |
| `static_cast`      | 编译时   | 不安全（可能错误）            | 零     |
| `dynamic_cast`     | 运行时   | 安全（返回 nullptr 或抛异常） | 有开销 |
| `reinterpret_cast` | 无检查   | 不安全                        | 零     |
| C 风格强转         | 无检查   | 不安全                        | 零     |

> ⚠️ 频繁使用 `dynamic_cast` 通常说明设计有问题。优先通过虚函数实现多态，而非通过类型判断来分支。

---

## 7. 多态的实际应用模式

### 7.1 策略模式

```cpp
class SortStrategy {
public:
    virtual void sort(std::vector<int>& data) = 0;
    virtual ~SortStrategy() = default;
};

class BubbleSort : public SortStrategy {
public:
    void sort(std::vector<int>& data) override {
        // 冒泡排序实现...
        std::cout << "使用冒泡排序" << std::endl;
    }
};

class QuickSort : public SortStrategy {
public:
    void sort(std::vector<int>& data) override {
        // 快速排序实现...
        std::cout << "使用快速排序" << std::endl;
    }
};

class Sorter {
    std::unique_ptr<SortStrategy> strategy;
public:
    void setStrategy(std::unique_ptr<SortStrategy> s) {
        strategy = std::move(s);
    }
    void doSort(std::vector<int>& data) {
        strategy->sort(data);
    }
};
```

---

## 8. 小结

| 概念           | 说明                                |
| -------------- | ----------------------------------- |
| 编译时多态     | 函数重载、模板，编译期确定          |
| 运行时多态     | 虚函数 + 继承，运行时确定           |
| `virtual`      | 声明虚函数，启用动态分派            |
| vtable/vptr    | 虚函数表 + 虚表指针，实现运行时查找 |
| 纯虚函数 `= 0` | 无默认实现，派生类必须覆盖          |
| 抽象类         | 含纯虚函数的类，不能实例化          |
| `override`     | 显式标记覆盖，防止签名错误          |
| `final`        | 禁止继续继承或覆盖                  |
| `dynamic_cast` | 安全的运行时向下转型                |

> 🎯 **核心理念**：多态让代码面向**接口**编程而非面向**实现**编程。通过基类指针或引用操作不同派生类对象，实现开闭原则（对扩展开放，对修改关闭）。
