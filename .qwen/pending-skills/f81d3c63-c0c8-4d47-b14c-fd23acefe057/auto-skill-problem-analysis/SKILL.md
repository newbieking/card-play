---
name: problem-analysis
description: 分析问题的根本原因，制定修复方案
source: auto-skill
extracted_at: '2026-07-16T02:18:17.075Z'
---

# 问题分析技能

本技能提供系统化的问题分析方法，帮助找到根本原因并制定有效的修复方案。

## 使用场景

- 遇到 bug 或错误
- 性能问题
- 行为不符合预期
- 需要理解现有代码逻辑

## 分析步骤

### 1. 问题描述

**目的**：清晰定义问题

**5W1H 分析法**：
- **What**：问题是什么？
- **Where**：问题发生在哪里？
- **When**：问题什么时候发生？
- **Who**：谁遇到这个问题？
- **Why**：为什么这是个问题？
- **How**：问题是如何被发现的？

**示例**：
```
What：用户登录时密码验证失败
Where：登录页面，点击登录按钮后
When：每天上午 9-10 点高峰期
Who：所有用户，特别是新注册用户
Why：导致用户无法登录，影响用户体验
How：用户反馈和监控系统报警
```

### 2. 信息收集

**需要收集的信息**：

#### 环境信息
- 操作系统和版本
- 浏览器/客户端版本
- 网络环境
- 数据库状态

#### 错误信息
- 错误消息全文
- 错误代码
- 堆栈跟踪
- 相关日志

#### 复现步骤
1. 详细的操作步骤
2. 输入的数据
3. 预期结果
4. 实际结果

#### 时机信息
- 问题发生的时间
- 持续时长
- 发生频率
- 是否有规律

**信息收集模板**：
```markdown
## 问题信息收集

### 环境信息
- 操作系统：
- 浏览器：
- 网络：

### 错误信息
- 错误消息：
- 错误代码：
- 堆栈跟踪：

### 复现步骤
1. 
2. 
3. 

### 预期 vs 实际
- 预期：
- 实际：

### 时机信息
- 时间：
- 频率：
- 规律：
```

### 3. 假设生成

**目的**：基于信息生成可能的原因

**头脑风暴原则**：
- 不评判任何假设
- 鼓励大胆猜测
- 数量优于质量
- 结合不同角度

**常见假设类别**：

#### 技术层面
- 代码逻辑错误
- 配置错误
- 依赖版本问题
- 环境差异

#### 数据层面
- 数据格式错误
- 数据缺失
- 数据不一致
- 并发问题

#### 外部因素
- 网络问题
- 第三方服务问题
- 资源限制
- 权限问题

**假设示例**：
```
假设1：密码验证逻辑有 bug
假设2：数据库连接池耗尽
假设3：Redis 缓存过期策略问题
假设4：第三方验证服务响应超时
假设5：并发登录导致数据竞争
```

### 4. 假设验证

**验证方法**：

#### 代码审查
```bash
# 查看相关代码
git log --oneline -10  # 查看最近变更
git diff <commit>      # 查看具体变更

# 搜索相关代码
grep -r "password" --include="*.js"
grep -r "login" --include="*.js"
```

#### 日志分析
```bash
# 查看错误日志
tail -f /var/log/app/error.log

# 搜索特定错误
grep "password" /var/log/app/error.log
```

#### 数据验证
```sql
-- 检查用户数据
SELECT * FROM users WHERE username = 'testuser';

-- 检查登录记录
SELECT * FROM login_logs ORDER BY created_at DESC LIMIT 10;
```

#### 环境测试
```bash
# 测试数据库连接
mysql -u user -p -h host

# 测试 Redis 连接
redis-cli ping

# 测试网络连通性
curl -I https://api.example.com
```

**验证记录模板**：
```markdown
## 假设验证记录

### 假设1：密码验证逻辑有 bug
- 验证方法：代码审查
- 结果：❌ 不成立
- 证据：代码逻辑正确

### 假设2：数据库连接池耗尽
- 验证方法：日志分析
- 结果：✅ 成立
- 证据：日志显示 "Connection pool exhausted"
```

### 5. 根因确定

**根因分析工具**：

#### 5 Whys 分析法
连续问"为什么"，直到找到根本原因：

```
问题：用户登录失败
Why 1：为什么登录失败？→ 密码验证失败
Why 2：为什么密码验证失败？→ 数据库查询返回空
Why 3：为什么数据库查询返回空？→ 用户表没有这个用户
Why 4：为什么用户表没有这个用户？→ 注册时没有插入成功
Why 5：为什么注册时没有插入成功？→ 注册接口有 bug，事务没有提交
根因：注册接口事务管理有问题
```

#### 鱼骨图分析
从多个维度分析可能的原因：

```
        人
        |
代码 ---|--- 数据
        |
配置 ---|--- 环境
        |
        依赖
```

#### 故障树分析
构建故障树，分析所有可能的故障路径：

```
           登录失败
          /        \
    密码错误      账户不存在
    /     \        /     \
  输入错  验证错  注册错  删除错
```

### 6. 影响分析

**影响范围评估**：

#### 用户影响
- 影响多少用户？
- 问题严重程度？
- 用户体验影响？

#### 业务影响
- 对业务指标的影响？
- 财务损失？
- 声誉影响？

#### 技术影响
- 系统稳定性？
- 数据完整性？
- 性能影响？

**影响矩阵**：
| 影响维度 | 高 | 中 | 低 |
|---------|---|---|---|
| 用户影响 | 大量用户无法使用 | 部分功能受限 | 个别用户问题 |
| 业务影响 | 收入损失 | 用户体验下降 | 无直接影响 |
| 技术影响 | 系统崩溃 | 性能下降 | 无影响 |

### 7. 修复方案

**方案类型**：

#### 临时方案（Workaround）
- 快速缓解问题
- 不解决根本原因
- 用于紧急情况

**示例**：
```bash
# 重启服务
systemctl restart app

# 清理缓存
redis-cli FLUSHALL

# 扩容资源
kubectl scale deployment app --replicas=5
```

#### 永久方案（Fix）
- 解决根本原因
- 需要测试验证
- 可能需要发布时间

**示例**：
```javascript
// 修复密码验证逻辑
async function validatePassword(username, password) {
  const user = await db.users.findOne({ username });
  if (!user) {
    throw new Error('User not found');
  }
  // 添加密码哈希验证
  const isValid = await bcrypt.compare(password, user.passwordHash);
  return isValid;
}
```

#### 预防方案（Prevention）
- 防止问题再次发生
- 改进系统设计
- 增加监控告警

**示例**：
```javascript
// 添加密码验证监控
app.post('/login', async (req, res) => {
  try {
    const result = await validatePassword(req.body.username, req.body.password);
    if (!result) {
      metrics.increment('login.password_invalid');
    }
    res.json({ success: result });
  } catch (error) {
    metrics.increment('login.error');
    throw error;
  }
});
```

**方案评估矩阵**：
| 方案 | 实施成本 | 风险 | 效果 | 时间 |
|------|---------|------|------|------|
| 临时方案 | 低 | 低 | 短期 | 快 |
| 永久方案 | 中 | 中 | 长期 | 中 |
| 预防方案 | 高 | 低 | 永久 | 长 |

## 分析工具

### 1. 代码分析工具
```bash
# 静态分析
eslint src/
tslint src/

# 依赖分析
npm audit
yarn audit

# 代码搜索
grep -r "pattern" src/
ack "pattern" src/
rg "pattern" src/
```

### 2. 日志分析工具
```bash
# 实时日志
tail -f app.log

# 日志搜索
grep "ERROR" app.log
grep -A 5 -B 5 "exception" app.log

# 日志统计
awk '/ERROR/ {print $1}' app.log | sort | uniq -c
```

### 3. 性能分析工具
```bash
# 内存分析
heapdump
node --inspect

# CPU 分析
profiling
flamegraph

# 网络分析
tcpdump
wireshark
```

### 4. 数据库分析工具
```sql
-- 查询分析
EXPLAIN SELECT * FROM users WHERE id = 1;

-- 索引分析
SHOW INDEX FROM users;

-- 慢查询日志
SHOW VARIABLES LIKE 'slow_query%';
```

## 分析报告模板

```markdown
# 问题分析报告

## 问题概述
- **问题标题**：
- **发现时间**：
- **影响范围**：
- **严重程度**：

## 问题描述
### 现象
[问题现象描述]

### 复现步骤
1. 
2. 
3. 

### 预期行为
[应该发生什么]

### 实际行为
[实际发生了什么]

## 分析过程
### 信息收集
[收集到的信息]

### 假设生成
1. [假设1]
2. [假设2]
3. [假设3]

### 假设验证
[验证过程和结果]

### 根因确定
[根本原因分析]

## 影响分析
### 用户影响
[对用户的影响]

### 业务影响
[对业务的影响]

### 技术影响
[对系统的影响]

## 修复方案
### 临时方案
[临时解决方案]

### 永久方案
[永久解决方案]

### 预防方案
[预防措施]

## 实施计划
- [ ] [任务1]
- [ ] [任务2]
- [ ] [任务3]

## 验证计划
- [ ] [验证点1]
- [ ] [验证点2]
- [ ] [验证点3]

## 经验教训
### 做得好的地方
- [优点1]
- [优点2]

### 需要改进的地方
- [改进点1]
- [改进点2]

### 行动项
- [行动1]
- [行动2]
```

## 常见问题模式

### 1. 空指针/未定义错误
**模式**：访问未定义的属性或方法
**常见原因**：
- 异步操作未等待
- 条件判断不完整
- 数据结构变化

**预防措施**：
```javascript
// 使用可选链
const value = obj?.property?.nested;

// 使用默认值
const value = obj.property ?? defaultValue;

// 类型检查
if (typeof obj.property === 'string') {
  // 安全使用
}
```

### 2. 并发问题
**模式**：多个操作同时修改共享资源
**常见原因**：
- 缺少锁机制
- 事务隔离级别不当
- 缓存一致性问题

**预防措施**：
```javascript
// 使用锁
const lock = await acquireLock('resource');
try {
  // 操作资源
} finally {
  await releaseLock(lock);
}

// 使用事务
await db.transaction(async (trx) => {
  // 事务操作
});
```

### 3. 内存泄漏
**模式**：内存使用持续增长
**常见原因**：
- 未清理的事件监听器
- 全局变量积累
- 闭包引用

**预防措施**：
```javascript
// 清理事件监听器
componentWillUnmount() {
  window.removeEventListener('resize', this.handleResize);
}

// 避免全局变量
const localVar = {};

// 注意闭包
function createCounter() {
  let count = 0;
  return {
    increment: () => ++count,
    getCount: () => count
  };
}
```

### 4. 性能问题
**模式**：响应时间过长
**常见原因**：
- 算法复杂度高
- 数据库查询慢
- 资源未缓存

**预防措施**：
```javascript
// 优化算法
// O(n²) → O(n log n)

// 优化查询
// 添加索引
// 使用 JOIN 代替子查询

// 添加缓存
const cache = new Map();
function getData(key) {
  if (cache.has(key)) {
    return cache.get(key);
  }
  const data = fetchData(key);
  cache.set(key, data);
  return data;
}
```

## 总结

问题分析是开发者的核心技能。通过系统化的分析方法，可以：
1. **快速定位**：高效找到问题根源
2. **有效修复**：制定合理的修复方案
3. **预防复发**：建立预防机制
4. **积累经验**：形成知识库

记住：**好的分析是成功的一半**。不要急于修复，先理解问题！