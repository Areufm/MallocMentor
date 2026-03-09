---
title: "继承与派生"
category: "oop"
difficulty: "Medium"
tags: ["继承", "派生", "访问控制"]
author: "MallocMentor"
summary: "理解 C++ 继承机制、访问控制与菱形继承问题"
estimatedTime: 40
---

> 继承是面向对象编程的核心机制之一：通过已有类（基类）创建新类（派生类），新类自动获得基类的属性和行为，并可以在此基础上扩展或修改。继承实现了代码复用和「is-a」关系的建模。

## 1. 单继承

### 1.1 基本语法

```cpp
// 基类（父类）
class Animal {
public:
    std::string name;
    int age;

    void eat() {
        std::cout << name << " 正在吃东西" << std::endl;
    }

    void sleep() {
        std::cout << name << " 正在睡觉" << std::endl;
    }
};

// 派生类（子类）：公有继承
class Dog : public Animal {
public:
    std::string breed;

    void bark() {
        std::cout << name << " 汪汪叫！" << std::endl;
    }
};

int main() {
    Dog dog;
    dog.name = "旺财";     // 继承自 Animal
    dog.age = 3;           // 继承自 Animal
    dog.breed = "柴犬";    // Dog 自己的成员
    dog.eat();             // 继承自 Animal
    dog.bark();            // Dog 自己的方法
}
```

### 1.2 继承语法解析

```cpp
class Derived : access-specifier Base {
    // ...
};
```

`access-specifier` 可以是 `public`、`protected` 或 `private`，决定了基类成员在派生类中的访问级别。

---

## 2. 访问控制：三种继承方式

### 2.1 继承方式对访问权限的影响

| 基类成员    | `public` 继承 | `protected` 继承 | `private` 继承 |
| ----------- | ------------- | ---------------- | -------------- |
| `public`    | `public`      | `protected`      | `private`      |
| `protected` | `protected`   | `protected`      | `private`      |
| `private`   | 不可访问      | 不可访问         | 不可访问       |

> 规则：基类的 `private` 成员永远不能在派生类中直接访问，但它们**存在于**派生类对象的内存中。

### 2.2 详细示例

```cpp
class Base {
public:
    int pubVar = 1;
protected:
    int protVar = 2;
private:
    int privVar = 3;
};

// public 继承：最常用，保持基类的接口不变
class PubDerived : public Base {
    void test() {
        pubVar = 10;    // ✅ 仍然是 public
        protVar = 20;   // ✅ 仍然是 protected
        // privVar = 30; // ❌ 不可访问
    }
};

// protected 继承：基类的 public 成员变为 protected
class ProtDerived : protected Base {
    void test() {
        pubVar = 10;    // ✅ 变为 protected
        protVar = 20;   // ✅ 仍然是 protected
    }
};

// private 继承：全部变为 private（"以...实现"语义）
class PrivDerived : private Base {
    void test() {
        pubVar = 10;    // ✅ 变为 private
        protVar = 20;   // ✅ 变为 private
    }
};

PubDerived pd;
pd.pubVar = 100;    // ✅

ProtDerived ptd;
// ptd.pubVar = 100; // ❌ 已变为 protected

PrivDerived pvd;
// pvd.pubVar = 100; // ❌ 已变为 private
```

### 2.3 何时使用哪种继承

| 继承方式    | 语义                               | 使用场景                 |
| ----------- | ---------------------------------- | ------------------------ |
| `public`    | is-a（是一种）                     | Dog is-a Animal          |
| `protected` | 限制接口暴露                       | 罕用                     |
| `private`   | implemented-in-terms-of（以…实现） | 实现复用但不暴露基类接口 |

> 💡 **90% 以上的场景使用 `public` 继承**。`private` 继承通常可以用组合（composition）替代。

---

## 3. 构造顺序与析构顺序

### 3.1 构造顺序：从基到派

```cpp
class Base {
public:
    Base() { std::cout << "Base 构造" << std::endl; }
    ~Base() { std::cout << "Base 析构" << std::endl; }
};

class Derived : public Base {
    std::string member;
public:
    Derived() : Base(), member("hello") {
        std::cout << "Derived 构造" << std::endl;
    }
    ~Derived() { std::cout << "Derived 析构" << std::endl; }
};

int main() {
    Derived d;
}
```

输出：

```
Base 构造          ← 1. 先构造基类
Derived 构造       ← 2. 再构造派生类（成员先于函数体）
Derived 析构       ← 3. 先析构派生类
Base 析构          ← 4. 再析构基类
```

### 3.2 构造顺序规则

1. **基类构造函数**（按声明的继承顺序）
2. **成员变量构造**（按类内声明顺序，不是初始化列表顺序）
3. **派生类构造函数体**

析构顺序**完全相反**。

### 3.3 调用基类的特定构造函数

```cpp
class Shape {
protected:
    std::string color;
public:
    Shape() : color("black") {
        std::cout << "Shape 默认构造" << std::endl;
    }
    Shape(const std::string& c) : color(c) {
        std::cout << "Shape(color) 构造" << std::endl;
    }
};

class Circle : public Shape {
    double radius;
public:
    // 在初始化列表中调用基类的参数化构造函数
    Circle(double r, const std::string& c)
        : Shape(c), radius(r) {
        std::cout << "Circle 构造" << std::endl;
    }
};

Circle c(5.0, "red");
// 输出：Shape(color) 构造 → Circle 构造
```

> 如果不显式调用，编译器会调用基类的**默认构造函数**。如果基类没有默认构造函数，则必须显式调用。

---

## 4. 多继承

C++ 支持一个派生类同时继承多个基类：

```cpp
class Flyable {
public:
    void fly() { std::cout << "飞行中..." << std::endl; }
};

class Swimmable {
public:
    void swim() { std::cout << "游泳中..." << std::endl; }
};

// 多继承
class Duck : public Flyable, public Swimmable {
public:
    void quack() { std::cout << "嘎嘎叫！" << std::endl; }
};

Duck duck;
duck.fly();    // 来自 Flyable
duck.swim();   // 来自 Swimmable
duck.quack();  // Duck 自有
```

### 4.1 多继承的名称冲突

当多个基类有同名成员时，产生二义性：

```cpp
class A {
public:
    void func() { std::cout << "A::func" << std::endl; }
};

class B {
public:
    void func() { std::cout << "B::func" << std::endl; }
};

class C : public A, public B {};

C c;
// c.func();    // ❌ 编译错误：二义性，不知道调用哪个
c.A::func();    // ✅ 明确指定调用 A 的版本
c.B::func();    // ✅ 明确指定调用 B 的版本
```

---

## 5. 菱形继承与虚继承

### 5.1 菱形继承问题

```
        Animal
       /      \
     Dog      Cat
       \      /
        DogCat
```

```cpp
class Animal {
public:
    std::string name;
    void breathe() { std::cout << name << " 在呼吸" << std::endl; }
};

class Dog : public Animal {
public:
    void bark() { std::cout << "汪！" << std::endl; }
};

class Cat : public Animal {
public:
    void meow() { std::cout << "喵！" << std::endl; }
};

class DogCat : public Dog, public Cat {};
```

DogCat 内部有**两份** Animal 子对象：

```
DogCat 内存布局：
┌─────────────────┐
│ Dog::Animal::name│  ← 一份 Animal
│ Dog 的成员       │
├─────────────────┤
│ Cat::Animal::name│  ← 又一份 Animal！
│ Cat 的成员       │
├─────────────────┤
│ DogCat 的成员    │
└─────────────────┘
```

```cpp
DogCat dc;
// dc.name = "旺财";      // ❌ 二义性：哪个 name？
dc.Dog::name = "旺财";    // ✅ 指定 Dog 路径的 name
dc.Cat::name = "咪咪";    // ✅ 指定 Cat 路径的 name（不同的副本！）
// dc.breathe();           // ❌ 二义性
```

### 5.2 虚继承解决菱形继承

使用 `virtual` 关键字让 Dog 和 Cat 虚继承 Animal，保证 DogCat 中只有一份 Animal：

```cpp
class Animal {
public:
    std::string name;
    Animal() { std::cout << "Animal 构造" << std::endl; }
};

class Dog : virtual public Animal {
public:
    Dog() { std::cout << "Dog 构造" << std::endl; }
};

class Cat : virtual public Animal {
public:
    Cat() { std::cout << "Cat 构造" << std::endl; }
};

class DogCat : public Dog, public Cat {
public:
    // 虚继承中，最终派生类必须直接调用虚基类的构造函数
    DogCat() : Animal() {
        std::cout << "DogCat 构造" << std::endl;
    }
};

DogCat dc;
dc.name = "旺财";   // ✅ 只有一份 name，无二义性
dc.breathe();       // ✅ 只有一份 Animal
```

### 5.3 虚继承的构造顺序

虚基类的构造函数由**最终派生类**直接调用，先于所有非虚基类：

```
构造顺序：Animal（虚基类）→ Dog → Cat → DogCat
```

> ⚠️ 虚继承会增加对象大小（需要存储虚基类指针 vbptr），且有一定性能开销。仅在确实需要菱形继承时使用。

---

## 6. `using` 声明

### 6.1 引入基类成员

`using` 声明可以将基类的成员引入派生类的作用域：

```cpp
class Base {
public:
    void func(int x) {
        std::cout << "Base::func(int): " << x << std::endl;
    }
};

class Derived : public Base {
public:
    using Base::func;  // 引入 Base::func

    // Derived 的重载版本
    void func(double x) {
        std::cout << "Derived::func(double): " << x << std::endl;
    }
};

Derived d;
d.func(42);     // 调用 Base::func(int)
d.func(3.14);   // 调用 Derived::func(double)
```

如果没有 `using Base::func;`，`Derived::func(double)` 会**隐藏**基类的 `func(int)`，导致 `d.func(42)` 调用的是 `func(double)` 而不是 `func(int)`。

### 6.2 修改继承成员的访问权限

```cpp
class Base {
public:
    int publicVar = 1;
protected:
    int protectedVar = 2;
};

class Derived : private Base {
public:
    // 将 private 继承的成员重新提升为 public
    using Base::publicVar;
protected:
    using Base::protectedVar;
};
```

### 6.3 继承构造函数（C++11）

```cpp
class Base {
public:
    Base(int x) { std::cout << "Base(int)" << std::endl; }
    Base(int x, double y) { std::cout << "Base(int, double)" << std::endl; }
};

class Derived : public Base {
public:
    using Base::Base;  // 继承 Base 的所有构造函数
    // 等价于自动生成：
    // Derived(int x) : Base(x) {}
    // Derived(int x, double y) : Base(x, y) {}
};

Derived d1(42);       // 调用 Base(int)
Derived d2(42, 3.14); // 调用 Base(int, double)
```

---

## 7. 函数隐藏（Name Hiding）

派生类中定义了与基类同名的函数时，基类的所有同名函数都会被**隐藏**（不是重写）：

```cpp
class Base {
public:
    void func() { std::cout << "Base::func()" << std::endl; }
    void func(int x) { std::cout << "Base::func(int)" << std::endl; }
};

class Derived : public Base {
public:
    void func() { std::cout << "Derived::func()" << std::endl; }
    // Base::func() 和 Base::func(int) 都被隐藏了
};

Derived d;
d.func();       // ✅ Derived::func()
// d.func(42);  // ❌ 编译错误：Derived 中没有 func(int)
d.Base::func(42); // ✅ 通过作用域解析访问

// 解决方案：在 Derived 中添加 using Base::func;
```

---

## 8. 小结

| 概念             | 说明                               |
| ---------------- | ---------------------------------- |
| 单继承           | 一个派生类继承一个基类             |
| 多继承           | 一个派生类继承多个基类             |
| `public` 继承    | is-a 关系，最常用                  |
| `protected` 继承 | 限制基类接口对外暴露               |
| `private` 继承   | 实现复用，不暴露基类接口           |
| 构造顺序         | 基类 → 成员 → 派生类（析构相反）   |
| 菱形继承         | 多个路径继承同一基类，产生多副本   |
| 虚继承           | `virtual` 继承，保证虚基类只有一份 |
| `using` 声明     | 引入基类成员、继承构造函数         |
| 名称隐藏         | 派生类同名函数隐藏基类所有同名函数 |

> 🎯 **设计建议**：优先使用 `public` 单继承，谨慎使用多继承，能用组合（composition）替代继承时优先用组合。遵循里氏替换原则（LSP）——派生类对象应该能替代基类对象使用。
