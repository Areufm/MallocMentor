---
title: "互斥锁与条件变量"
category: "concurrency"
difficulty: "Hard"
tags: ["mutex", "lock_guard", "condition_variable"]
author: "MallocMentor"
summary: "掌握互斥锁、读写锁、条件变量等同步原语"
estimatedTime: 50
---

> 在多线程编程中，仅仅使用基本的 `std::mutex` 往往不够。C++ 标准库提供了多种锁类型和同步原语，以应对不同的并发场景：从基本的互斥访问，到读多写少的读写锁，再到线程间的条件通知机制。

## 1. 锁的类型

### 1.1 `std::lock_guard` — 最简单的 RAII 锁

`lock_guard` 在构造时加锁，析构时解锁。不可移动，不可复制，不支持手动解锁：

```cpp
#include <mutex>

std::mutex mtx;
int sharedData = 0;

void safeUpdate() {
    std::lock_guard<std::mutex> lock(mtx);
    // 临界区开始
    ++sharedData;
    // 临界区结束（lock 析构时自动解锁）
}
```

适用场景：简单的临界区保护，不需要中途解锁。

### 1.2 `std::unique_lock` — 灵活的锁

`unique_lock` 比 `lock_guard` 功能更强大：

- 支持**延迟加锁**
- 支持**中途解锁/重新加锁**
- 支持**try_lock**（尝试加锁，失败不阻塞）
- 支持**超时加锁**
- **可移动**（可以从函数返回）
- 是使用 `condition_variable` 的**必要条件**

```cpp
std::mutex mtx;

void flexibleLocking() {
    // 延迟加锁
    std::unique_lock<std::mutex> lock(mtx, std::defer_lock);
    // 此时 mtx 未被锁定

    // 稍后手动加锁
    lock.lock();
    // 临界区...
    lock.unlock();  // 可以中途解锁

    // 重新加锁
    lock.lock();
    // 更多操作...
    // 析构时自动解锁
}

void tryLocking() {
    std::unique_lock<std::mutex> lock(mtx, std::try_to_lock);
    if (lock.owns_lock()) {
        // 加锁成功
        std::cout << "获得锁" << std::endl;
    } else {
        // 加锁失败，不阻塞
        std::cout << "锁被占用" << std::endl;
    }
}

void timedLocking() {
    std::timed_mutex tmtx;
    std::unique_lock<std::timed_mutex> lock(tmtx, std::defer_lock);

    // 尝试在 100ms 内获取锁
    if (lock.try_lock_for(std::chrono::milliseconds(100))) {
        std::cout << "获得锁" << std::endl;
    } else {
        std::cout << "超时" << std::endl;
    }
}
```

### 1.3 `std::scoped_lock`（C++17）— 同时锁多个互斥量

`scoped_lock` 可以一次性锁定**多个** mutex，自动使用死锁避免算法：

```cpp
std::mutex mtx1, mtx2;

void transferMoney(int& from, int& to, int amount) {
    // 同时锁定两个 mutex，避免死锁
    std::scoped_lock lock(mtx1, mtx2);
    from -= amount;
    to += amount;
}
```

在 C++17 之前需要使用 `std::lock` 手动实现：

```cpp
// C++11/14 的做法
void transferMoneyOld(int& from, int& to, int amount) {
    std::unique_lock<std::mutex> lock1(mtx1, std::defer_lock);
    std::unique_lock<std::mutex> lock2(mtx2, std::defer_lock);
    std::lock(lock1, lock2);  // 同时锁定，避免死锁

    from -= amount;
    to += amount;
}
```

### 1.4 锁类型对比

| 锁类型        | 自动解锁 | 手动解锁 | 多锁 | 移动 | 延迟/尝试 | 条件变量 |
| ------------- | -------- | -------- | ---- | ---- | --------- | -------- |
| `lock_guard`  | ✅       | ❌       | ❌   | ❌   | ❌        | ❌       |
| `unique_lock` | ✅       | ✅       | ❌   | ✅   | ✅        | ✅       |
| `scoped_lock` | ✅       | ❌       | ✅   | ❌   | ❌        | ❌       |

> 💡 选择建议：简单场景用 `lock_guard`，需要灵活控制或配合条件变量用 `unique_lock`，需要同时锁多个用 `scoped_lock`。

---

## 2. `std::condition_variable` — 条件变量

条件变量允许线程**等待**某个条件成立，另一个线程在条件满足时**通知**等待的线程。它是实现生产者-消费者模式等经典并发模式的关键。

### 2.1 基本用法

```cpp
#include <condition_variable>
#include <mutex>
#include <queue>
#include <thread>

std::mutex mtx;
std::condition_variable cv;
bool ready = false;

void worker() {
    std::unique_lock<std::mutex> lock(mtx);
    cv.wait(lock, [] { return ready; });  // 等待 ready 变为 true
    // 被唤醒后继续执行
    std::cout << "Worker 开始工作" << std::endl;
}

int main() {
    std::thread t(worker);

    std::this_thread::sleep_for(std::chrono::seconds(1));
    {
        std::lock_guard<std::mutex> lock(mtx);
        ready = true;
    }
    cv.notify_one();  // 唤醒一个等待的线程

    t.join();
}
```

### 2.2 `wait()` 的原理

```cpp
cv.wait(lock, predicate);
```

等价于：

```cpp
while (!predicate()) {
    cv.wait(lock);  // 1. 释放锁 2. 阻塞线程 3. 被唤醒后重新获取锁
}
```

> ⚠️ **虚假唤醒（Spurious Wakeup）**：`condition_variable` 可能在没有被 `notify` 的情况下被唤醒。因此必须使用**带谓词的 `wait`**（或在 while 循环中检查条件），不能使用无条件 `wait` 就认为条件已满足。

### 2.3 `notify_one()` vs `notify_all()`

| 方法           | 说明               |
| -------------- | ------------------ |
| `notify_one()` | 唤醒一个等待的线程 |
| `notify_all()` | 唤醒所有等待的线程 |

```cpp
cv.notify_one();  // 只唤醒一个（适合一个消费者的场景）
cv.notify_all();  // 唤醒所有（适合广播通知的场景）
```

---

## 3. 生产者-消费者模型

这是多线程编程中最经典的模式之一：

```cpp
#include <condition_variable>
#include <mutex>
#include <queue>
#include <thread>
#include <iostream>

template<typename T>
class ThreadSafeQueue {
    std::queue<T> queue;
    mutable std::mutex mtx;
    std::condition_variable cvNotEmpty;
    std::condition_variable cvNotFull;
    size_t maxSize;

public:
    explicit ThreadSafeQueue(size_t maxSize = 10) : maxSize(maxSize) {}

    // 生产者：放入数据
    void push(T item) {
        std::unique_lock<std::mutex> lock(mtx);
        cvNotFull.wait(lock, [this] { return queue.size() < maxSize; });

        queue.push(std::move(item));
        cvNotEmpty.notify_one();  // 通知消费者
    }

    // 消费者：取出数据
    T pop() {
        std::unique_lock<std::mutex> lock(mtx);
        cvNotEmpty.wait(lock, [this] { return !queue.empty(); });

        T item = std::move(queue.front());
        queue.pop();
        cvNotFull.notify_one();  // 通知生产者
        return item;
    }

    bool empty() const {
        std::lock_guard<std::mutex> lock(mtx);
        return queue.empty();
    }
};

int main() {
    ThreadSafeQueue<int> queue(5);

    // 生产者线程
    std::thread producer([&queue] {
        for (int i = 0; i < 20; ++i) {
            queue.push(i);
            std::cout << "生产: " << i << std::endl;
        }
    });

    // 消费者线程
    std::thread consumer([&queue] {
        for (int i = 0; i < 20; ++i) {
            int item = queue.pop();
            std::cout << "消费: " << item << std::endl;
        }
    });

    producer.join();
    consumer.join();
}
```

---

## 4. `std::shared_mutex` — 读写锁（C++17）

在很多场景中，数据**读多写少**。使用普通 mutex 会让多个读者互相阻塞，浪费性能。`shared_mutex` 支持：

- **共享锁（shared lock）**：多个读者可以同时持有
- **独占锁（exclusive lock）**：写者独占，其他读写都被阻塞

```cpp
#include <shared_mutex>
#include <map>
#include <string>

class ThreadSafeConfig {
    std::map<std::string, std::string> data;
    mutable std::shared_mutex mtx;

public:
    // 读操作：使用共享锁，多个线程可以同时读
    std::string get(const std::string& key) const {
        std::shared_lock<std::shared_mutex> lock(mtx);
        auto it = data.find(key);
        return it != data.end() ? it->second : "";
    }

    // 写操作：使用独占锁，写时其他线程不能读也不能写
    void set(const std::string& key, const std::string& value) {
        std::unique_lock<std::shared_mutex> lock(mtx);
        data[key] = value;
    }

    bool contains(const std::string& key) const {
        std::shared_lock<std::shared_mutex> lock(mtx);
        return data.count(key) > 0;
    }
};
```

### 4.1 读写锁 vs 普通 mutex

```
场景：4 个读线程 + 1 个写线程

使用 std::mutex（互斥锁）：
时间 →
R1: [====]
R2:       [====]
R3:             [====]
R4:                   [====]
W1:                         [====]
（所有操作完全串行）

使用 std::shared_mutex（读写锁）：
时间 →
R1: [====]
R2: [====]     ← 读操作可以并发！
R3: [====]
R4: [====]
W1:       [====]  ← 写操作仍然独占
（读操作并行，大幅提升吞吐量）
```

---

## 5. 死锁

### 5.1 什么是死锁

两个或多个线程互相等待对方释放锁，导致所有线程永久阻塞：

```cpp
std::mutex mtxA, mtxB;

void thread1() {
    std::lock_guard<std::mutex> lockA(mtxA);  // 先锁 A
    std::this_thread::sleep_for(std::chrono::milliseconds(1));
    std::lock_guard<std::mutex> lockB(mtxB);  // 再锁 B → 等待 B 释放
}

void thread2() {
    std::lock_guard<std::mutex> lockB(mtxB);  // 先锁 B
    std::this_thread::sleep_for(std::chrono::milliseconds(1));
    std::lock_guard<std::mutex> lockA(mtxA);  // 再锁 A → 等待 A 释放
}

// thread1 持有 A 等 B，thread2 持有 B 等 A → 死锁！
```

### 5.2 死锁的四个必要条件

1. **互斥**：资源一次只能被一个线程持有
2. **持有并等待**：持有锁的线程等待其他锁
3. **不可抢占**：锁不能被强制剥夺
4. **循环等待**：存在线程之间的循环等待链

> 破坏任意一个条件即可避免死锁。

### 5.3 死锁避免策略

#### 策略 1：固定加锁顺序

```cpp
// 所有线程都按相同顺序加锁（先 A 后 B）
void thread1() {
    std::lock_guard<std::mutex> lockA(mtxA);
    std::lock_guard<std::mutex> lockB(mtxB);
    // ...
}

void thread2() {
    std::lock_guard<std::mutex> lockA(mtxA);  // 也是先 A 后 B
    std::lock_guard<std::mutex> lockB(mtxB);
    // ...
}
```

#### 策略 2：使用 `std::lock` 或 `std::scoped_lock`

```cpp
// std::scoped_lock 内部使用死锁避免算法
void thread1() {
    std::scoped_lock lock(mtxA, mtxB);
    // ...
}

void thread2() {
    std::scoped_lock lock(mtxB, mtxA);  // 顺序无所谓！
    // ...
}
```

#### 策略 3：使用 `try_lock` 避免死等

```cpp
void thread1() {
    while (true) {
        std::unique_lock<std::mutex> lockA(mtxA);
        if (mtxB.try_lock()) {
            std::lock_guard<std::mutex> lockB(mtxB, std::adopt_lock);
            // 两个锁都获得了
            break;
        }
        // 获取 B 失败，释放 A 重试
    }
}
```

#### 策略 4：减小锁的粒度

```cpp
// ❌ 粗粒度锁：锁住整个操作
void badApproach() {
    std::lock_guard<std::mutex> lock(globalMtx);
    readFromDatabase();    // 耗时操作
    processData();         // 耗时操作
    writeToFile();         // 耗时操作
}

// ✅ 细粒度锁：只锁必要的共享数据访问
void goodApproach() {
    auto data = readFromDatabase();     // 不需要锁
    auto result = processData(data);    // 不需要锁
    {
        std::lock_guard<std::mutex> lock(fileMtx);
        writeToFile(result);            // 只锁文件写入
    }
}
```

---

## 6. `std::promise` 与 `std::future`

`promise`/`future` 提供了线程间**一次性**数据传递和同步的机制。

### 6.1 基本用法

```cpp
#include <future>
#include <thread>

void compute(std::promise<int> prom) {
    // 模拟耗时计算
    std::this_thread::sleep_for(std::chrono::seconds(1));
    prom.set_value(42);  // 设置结果
}

int main() {
    std::promise<int> prom;
    std::future<int> fut = prom.get_future();  // 获取关联的 future

    std::thread t(compute, std::move(prom));

    // 在主线程中获取结果
    std::cout << "等待结果..." << std::endl;
    int result = fut.get();  // 阻塞直到 promise set_value
    std::cout << "结果: " << result << std::endl;  // 42

    t.join();
}
```

### 6.2 `std::async` — 更简洁的异步调用

```cpp
#include <future>

int heavyComputation(int x) {
    std::this_thread::sleep_for(std::chrono::seconds(2));
    return x * x;
}

int main() {
    // 异步启动计算
    std::future<int> fut = std::async(std::launch::async, heavyComputation, 42);

    std::cout << "计算进行中..." << std::endl;
    // 做其他事情...

    int result = fut.get();  // 获取结果，必要时阻塞
    std::cout << "结果: " << result << std::endl;  // 1764
}
```

### 6.3 启动策略

```cpp
// std::launch::async：保证在新线程中执行
auto f1 = std::async(std::launch::async, task);

// std::launch::deferred：延迟执行，在调用 get() 时在当前线程执行
auto f2 = std::async(std::launch::deferred, task);

// 默认（async | deferred）：由实现决定
auto f3 = std::async(task);
```

### 6.4 异常传递

```cpp
int riskyTask() {
    throw std::runtime_error("出错了！");
    return 0;
}

auto fut = std::async(std::launch::async, riskyTask);
try {
    int result = fut.get();  // 异常在此处重新抛出
} catch (const std::exception& e) {
    std::cout << "捕获异常: " << e.what() << std::endl;
}
```

### 6.5 `std::shared_future`

`future` 只能 `get()` 一次。如果需要多个线程获取同一个结果，使用 `shared_future`：

```cpp
std::promise<int> prom;
std::shared_future<int> sfut = prom.get_future().share();

// 多个线程都可以 get()
std::thread t1([sfut] { std::cout << sfut.get() << std::endl; });
std::thread t2([sfut] { std::cout << sfut.get() << std::endl; });

prom.set_value(42);
t1.join();
t2.join();
```

---

## 7. 并发编程最佳实践

### 7.1 设计原则

| 原则             | 说明                                         |
| ---------------- | -------------------------------------------- |
| 最小化共享状态   | 减少共享数据，多用线程局部数据               |
| 最小化锁的范围   | 只在必须同步的代码段加锁                     |
| 避免嵌套锁       | 如果必须，使用 `scoped_lock`                 |
| 优先使用高层抽象 | `async`/`future` 优于手动 `thread` + `mutex` |
| 不变量保护       | 确保锁保护的范围覆盖所有不变量               |

### 7.2 常见并发模式总结

```cpp
// 模式 1：线程池（简化版思路）
// 真实项目建议使用成熟的线程池库

// 模式 2：生产者-消费者（见第 3 节）

// 模式 3：异步任务
auto result = std::async(std::launch::async, [] {
    return computeHeavyTask();
});
// 继续做其他事...
auto value = result.get();

// 模式 4：并行计算
std::vector<std::future<int>> futures;
for (int i = 0; i < 10; ++i) {
    futures.push_back(std::async(std::launch::async, [i] {
        return heavyCompute(i);
    }));
}
int totalResult = 0;
for (auto& f : futures) {
    totalResult += f.get();
}
```

---

## 8. 小结

| 概念                 | 说明                                          |
| -------------------- | --------------------------------------------- |
| `lock_guard`         | 最简单的 RAII 锁，构造加锁析构解锁            |
| `unique_lock`        | 灵活的锁，支持延迟/尝试/中途解锁              |
| `scoped_lock`        | C++17，同时安全锁定多个 mutex                 |
| `condition_variable` | 线程间等待/通知机制                           |
| `shared_mutex`       | C++17 读写锁，支持共享读 + 独占写             |
| 死锁                 | 线程互相等待，用固定顺序或 `scoped_lock` 避免 |
| `promise/future`     | 一次性线程间数据传递                          |
| `std::async`         | 简洁的异步任务启动                            |

> 🎯 **核心理念**：并发编程的难点在于**正确性**而非性能。先确保线程安全（没有数据竞争和死锁），再优化性能。能用高层抽象（`async`/`future`）的场景就不要用底层的 `thread` + `mutex`。
