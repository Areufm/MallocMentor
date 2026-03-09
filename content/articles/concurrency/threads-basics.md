---
title: "多线程基础"
category: "concurrency"
difficulty: "Hard"
tags: ["thread", "mutex", "线程安全"]
author: "MallocMentor"
summary: "学习 C++11 线程库基础，理解线程创建与同步"
estimatedTime: 45
---

C++11 引入了原生的线程支持库 `<thread>`，让多线程编程成为语言标准的一部分。此前 C++ 开发者不得不依赖平台特定的 API（如 POSIX threads、Windows threads），而现在可以编写跨平台的并发代码。

## 1. `std::thread` 创建线程

### 1.1 基本用法

```cpp
#include <thread>
#include <iostream>

void hello() {
    std::cout << "Hello from thread! ID: "
              << std::this_thread::get_id() << std::endl;
}

int main() {
    std::thread t(hello);  // 创建线程并立即开始执行 hello()

    std::cout << "Hello from main! ID: "
              << std::this_thread::get_id() << std::endl;

    t.join();  // 等待线程 t 执行完毕
    return 0;
}
```

> 编译时需要链接线程库：`g++ -std=c++17 -pthread main.cpp`

### 1.2 使用 Lambda 创建线程

```cpp
std::thread t([] {
    std::cout << "Lambda 线程运行中" << std::endl;
});
t.join();
```

### 1.3 使用函数对象

```cpp
class Task {
public:
    void operator()() const {
        std::cout << "函数对象线程运行中" << std::endl;
    }
};

// 注意：使用额外的花括号或圆括号避免"最令人困惑的解析"
std::thread t{Task{}};    // ✅
// std::thread t(Task());  // ❌ 会被解析为函数声明！
t.join();
```

### 1.4 使用成员函数

```cpp
class Worker {
public:
    void doWork(int id) {
        std::cout << "Worker " << id << " 工作中" << std::endl;
    }
};

Worker w;
std::thread t(&Worker::doWork, &w, 42);  // 传入成员函数指针、对象指针、参数
t.join();
```

---

## 2. `join()` 与 `detach()`

### 2.1 `join()` — 等待线程完成

调用 `join()` 后，当前线程会**阻塞**，直到目标线程执行完毕：

```cpp
std::thread t([] {
    std::this_thread::sleep_for(std::chrono::seconds(2));
    std::cout << "线程执行完毕" << std::endl;
});

std::cout << "等待线程..." << std::endl;
t.join();  // 阻塞直到 t 完成
std::cout << "线程已结束" << std::endl;
```

### 2.2 `detach()` — 分离线程

使线程在后台独立运行，主线程不再等待它：

```cpp
std::thread t([] {
    std::this_thread::sleep_for(std::chrono::seconds(2));
    std::cout << "后台线程完成" << std::endl;
});

t.detach();  // 线程在后台运行
// t 不再与 std::thread 对象关联
// 如果 main 先结束，这个后台线程可能被强制终止
```

### 2.3 必须 join 或 detach

`std::thread` 对象销毁时，如果线程仍然是 **joinable** 的（既没有 `join` 也没有 `detach`），程序会调用 `std::terminate()` 终止：

```cpp
void bad() {
    std::thread t([] { /* ... */ });
    // 函数结束，t 被销毁但未 join 或 detach
    // → std::terminate()！程序崩溃
}
```

**安全模式**：使用 RAII 包装确保 join：

```cpp
class JoinGuard {
    std::thread& t;
public:
    explicit JoinGuard(std::thread& t) : t(t) {}
    ~JoinGuard() {
        if (t.joinable()) t.join();
    }
    JoinGuard(const JoinGuard&) = delete;
    JoinGuard& operator=(const JoinGuard&) = delete;
};

void safe() {
    std::thread t([] { /* ... */ });
    JoinGuard guard(t);  // 函数退出时自动 join
    // 即使抛出异常也会正确 join
}
```

> C++20 引入了 `std::jthread`（joining thread），它在析构时自动 `join()`，推荐使用。

### 2.4 `joinable()` 检查

```cpp
std::thread t([] { /* ... */ });
std::cout << t.joinable() << std::endl;  // true

t.join();
std::cout << t.joinable() << std::endl;  // false
```

---

## 3. 线程参数传递

### 3.1 按值传递

```cpp
void process(int x, std::string s) {
    std::cout << s << ": " << x << std::endl;
}

std::thread t(process, 42, std::string("结果"));
t.join();
```

> ⚠️ 参数默认是**拷贝**到新线程的。即使函数签名使用引用，`std::thread` 构造函数也会先拷贝参数。

### 3.2 按引用传递

要真正传引用，必须使用 `std::ref` / `std::cref`：

```cpp
void increment(int& value) {
    ++value;
}

int x = 0;
// std::thread t(increment, x);       // ❌ x 被拷贝，修改的是副本
std::thread t(increment, std::ref(x));  // ✅ 传引用
t.join();
std::cout << x << std::endl;  // 1
```

### 3.3 移动语义

对于只能移动不能拷贝的对象，使用 `std::move`：

```cpp
void process(std::unique_ptr<int> data) {
    std::cout << *data << std::endl;
}

auto ptr = std::make_unique<int>(42);
std::thread t(process, std::move(ptr));
// ptr 现在为 nullptr
t.join();
```

---

## 4. 线程安全与数据竞争

### 4.1 什么是数据竞争（Data Race）

当两个或多个线程**同时**访问同一内存位置，且**至少一个是写操作**，并且没有同步机制时，产生数据竞争。数据竞争是**未定义行为**。

```cpp
int counter = 0;

void unsafeIncrement() {
    for (int i = 0; i < 100000; ++i) {
        ++counter;  // ❌ 数据竞争！
    }
}

int main() {
    std::thread t1(unsafeIncrement);
    std::thread t2(unsafeIncrement);
    t1.join();
    t2.join();

    // counter 的值不确定！可能是 120000、150000、200000...
    // 不一定是预期的 200000
    std::cout << "counter = " << counter << std::endl;
}
```

### 4.2 为什么 `++counter` 不是原子操作

`++counter` 在 CPU 层面通常包含三个步骤：

```
1. 从内存读取 counter 的值到寄存器  （READ）
2. 寄存器值 +1                      （MODIFY）
3. 将新值写回内存                    （WRITE）
```

两个线程可能产生这样的交错：

```
线程1: READ (counter=0)
线程2: READ (counter=0)      ← 读到旧值
线程1: MODIFY (reg=1)
线程2: MODIFY (reg=1)        ← 基于旧值计算
线程1: WRITE (counter=1)
线程2: WRITE (counter=1)     ← 覆盖了线程1的结果
// 两次递增只增加了 1！
```

---

## 5. `std::mutex` 基本用法

互斥锁（mutex）是最基本的同步原语，保证同一时刻只有一个线程进入临界区。

### 5.1 直接使用 mutex

```cpp
#include <mutex>

int counter = 0;
std::mutex mtx;

void safeIncrement() {
    for (int i = 0; i < 100000; ++i) {
        mtx.lock();     // 获取锁
        ++counter;      // 临界区：同一时刻只有一个线程执行
        mtx.unlock();   // 释放锁
    }
}

int main() {
    std::thread t1(safeIncrement);
    std::thread t2(safeIncrement);
    t1.join();
    t2.join();

    std::cout << "counter = " << counter << std::endl;  // 确定是 200000
}
```

### 5.2 使用 `lock_guard`（RAII 锁）

手动 `lock`/`unlock` 容易忘记解锁（尤其是异常路径）。`lock_guard` 在构造时加锁，析构时自动解锁：

```cpp
void safeIncrement() {
    for (int i = 0; i < 100000; ++i) {
        std::lock_guard<std::mutex> lock(mtx);  // 构造时加锁
        ++counter;
        // lock 离开作用域时自动解锁
    }
}
```

> C++17 可以使用类模板参数推导：`std::lock_guard lock(mtx);`

### 5.3 保护共享数据的示例

```cpp
class ThreadSafeCounter {
    int value = 0;
    mutable std::mutex mtx;

public:
    void increment() {
        std::lock_guard<std::mutex> lock(mtx);
        ++value;
    }

    void decrement() {
        std::lock_guard<std::mutex> lock(mtx);
        --value;
    }

    int get() const {
        std::lock_guard<std::mutex> lock(mtx);
        return value;
    }
};

ThreadSafeCounter counter;

void worker() {
    for (int i = 0; i < 1000; ++i) {
        counter.increment();
    }
}

int main() {
    std::vector<std::thread> threads;
    for (int i = 0; i < 10; ++i) {
        threads.emplace_back(worker);
    }
    for (auto& t : threads) {
        t.join();
    }
    std::cout << counter.get() << std::endl;  // 10000
}
```

---

## 6. `std::atomic` 原子操作

对于简单的数值操作，`std::atomic` 提供了无锁的线程安全保证，比 mutex 更高效：

### 6.1 基本用法

```cpp
#include <atomic>

std::atomic<int> counter(0);  // 原子整数

void atomicIncrement() {
    for (int i = 0; i < 100000; ++i) {
        ++counter;  // 原子操作，线程安全，无需 mutex
    }
}

int main() {
    std::thread t1(atomicIncrement);
    std::thread t2(atomicIncrement);
    t1.join();
    t2.join();

    std::cout << "counter = " << counter.load() << std::endl;  // 200000
}
```

### 6.2 常用操作

```cpp
std::atomic<int> x(0);

x.store(10);          // 原子写入
int v = x.load();     // 原子读取
int old = x.exchange(20);  // 原子交换，返回旧值

x.fetch_add(5);       // 原子加，返回旧值（等价于 x += 5）
x.fetch_sub(3);       // 原子减

// 比较并交换（CAS，无锁编程的基础）
int expected = 22;
bool success = x.compare_exchange_strong(expected, 100);
// 如果 x == expected（22），则 x 设为 100，返回 true
// 否则 expected 被更新为 x 的实际值，返回 false
```

### 6.3 `std::atomic_flag`

最简单的原子类型，只有两种状态（set / clear），可以用来实现自旋锁：

```cpp
std::atomic_flag lock = ATOMIC_FLAG_INIT;

void spinLockExample() {
    while (lock.test_and_set(std::memory_order_acquire)) {
        // 自旋等待
    }
    // 临界区...
    lock.clear(std::memory_order_release);
}
```

### 6.4 mutex vs atomic

| 特性     | `std::mutex`          | `std::atomic`        |
| -------- | --------------------- | -------------------- |
| 适用场景 | 保护复杂操作/数据结构 | 简单数值操作         |
| 性能     | 较重（涉及系统调用）  | 轻量（硬件级指令）   |
| 阻塞     | 可能阻塞线程（sleep） | 无锁（可能自旋）     |
| 复杂度   | 可保护任意代码块      | 仅单个变量的单个操作 |

---

## 7. 线程管理实用技巧

### 7.1 获取线程信息

```cpp
// 当前线程 ID
std::cout << std::this_thread::get_id() << std::endl;

// 硬件支持的并发线程数
unsigned int n = std::thread::hardware_concurrency();
std::cout << "CPU 核心数: " << n << std::endl;
```

### 7.2 线程休眠

```cpp
#include <chrono>

// 精确休眠
std::this_thread::sleep_for(std::chrono::milliseconds(100));
std::this_thread::sleep_for(std::chrono::seconds(1));

// 休眠到指定时间点
auto wake_time = std::chrono::steady_clock::now() + std::chrono::seconds(2);
std::this_thread::sleep_until(wake_time);

// 让出 CPU 时间片
std::this_thread::yield();
```

### 7.3 批量管理线程

```cpp
void worker(int id) {
    std::cout << "线程 " << id << " 执行中" << std::endl;
}

int main() {
    const int numThreads = std::thread::hardware_concurrency();
    std::vector<std::thread> threads;

    // 创建多个线程
    for (int i = 0; i < numThreads; ++i) {
        threads.emplace_back(worker, i);
    }

    // 等待所有线程完成
    for (auto& t : threads) {
        t.join();
    }
}
```

---

## 8. C++20 `std::jthread`

`jthread`（joining thread）在析构时自动 `join()`，并支持**协作式取消**：

```cpp
#include <thread>

// C++20
void work(std::stop_token stoken) {
    while (!stoken.stop_requested()) {
        std::cout << "工作中..." << std::endl;
        std::this_thread::sleep_for(std::chrono::milliseconds(500));
    }
    std::cout << "收到停止请求，退出" << std::endl;
}

int main() {
    std::jthread t(work);  // 自动 join

    std::this_thread::sleep_for(std::chrono::seconds(2));
    t.request_stop();  // 请求停止
    // t 析构时自动 join
}
```

---

## 9. 小结

| 概念           | 说明                                    |
| -------------- | --------------------------------------- |
| `std::thread`  | 创建和管理线程                          |
| `join()`       | 等待线程完成（阻塞）                    |
| `detach()`     | 分离线程（后台运行）                    |
| 参数传递       | 默认拷贝，引用需 `std::ref`             |
| 数据竞争       | 多线程无同步地访问共享数据 → 未定义行为 |
| `std::mutex`   | 互斥锁，保护临界区                      |
| `lock_guard`   | RAII 风格的锁管理                       |
| `std::atomic`  | 无锁原子操作，适合简单数值              |
| `std::jthread` | C++20，自动 join + 协作取消             |

> 🎯 **核心原则**：共享数据必须同步保护。简单计数用 `atomic`，复杂操作用 `mutex`。始终使用 RAII 锁（`lock_guard`），永远不要手动 `lock()`/`unlock()`。
