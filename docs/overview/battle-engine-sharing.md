# 战斗引擎共用方案

> 配套文档：`battle-protocol.md`（确定性帧协议）、`tech-stack.md`（技术选型）
> 目标：解决"战斗引擎代码客户端/服务端共用一份 TS 实现"的工程化落地问题

---

## 一、背景

战斗引擎必须**确定性**——相同输入（阵容 + 指令 + 种子）在任何端得到相同输出。因此：

- 客户端（Cocos Creator 3.x）和服务端（Node.js）需要运行**同一份 TypeScript 战斗逻辑代码**
- 代码包括：伤害计算、Buff 结算、AI 决策、元素克制、怒气/冷却管理等
- 约 2000-5000 行 TS 代码（预估）

---

## 二、方案对比

### 方案 A：Git Submodule

```
card-play/
├── client/          (Cocos Creator 项目)
├── server/          (Node.js 项目)
├── shared/          (Git submodule → 独立仓库 battle-engine)
│   ├── src/
│   │   ├── BattleEngine.ts
│   │   ├── DamageCalc.ts
│   │   ├── BuffManager.ts
│   │   ├── ElementSystem.ts
│   │   └── ...
│   ├── package.json
│   └── tsconfig.json
└── .gitmodules
```

| 维度 | 评分 | 说明 |
|---|---|---|
| 版本控制 | ⭐⭐⭐⭐ | 独立版本管理，可锁定特定 commit |
| 依赖管理 | ⭐⭐⭐ | 需手动 npm install + 链接 |
| 开发体验 | ⭐⭐⭐ | 子模块更新需手动 git submodule update |
| CI/CD | ⭐⭐⭐ | 需处理 submodule 递归克隆 |
| 适合团队 | 中型团队 | 有独立的战斗引擎负责人 |

### 方案 B：npm 私有包

```
card-play/
├── client/          (Cocos Creator 项目)
│   └── package.json → 依赖 @cardplay/battle-engine
├── server/          (Node.js 项目)
│   └── package.json → 依赖 @cardplay/battle-engine
└── packages/
    └── battle-engine/  (独立包，发布到私有 registry)
        ├── src/
        ├── package.json → name: "@cardplay/battle-engine"
        └── ...
```

| 维度 | 评分 | 说明 |
|---|---|---|
| 版本控制 | ⭐⭐⭐⭐⭐ | 语义化版本，客户端/服务端可引用不同版本 |
| 依赖管理 | ⭐⭐⭐⭐⭐ | npm install 自动处理，CI 友好 |
| 开发体验 | ⭐⭐⭐⭐ | 标准 npm 工作流 |
| CI/CD | ⭐⭐⭐⭐⭐ | 需搭建私有 npm registry（Verdaccio/GitLab） |
| 适合团队 | 任意规模 | 最成熟的方案 |

### 方案 C：Monorepo + Workspace

```
card-play/
├── pnpm-workspace.yaml
├── package.json
├── packages/
│   ├── client/      (Cocos Creator)
│   ├── server/      (Node.js)
│   └── battle-engine/  (共享包)
│       ├── src/
│       ├── package.json → name: "@cardplay/battle-engine"
│       └── ...
├── docs/
└── ...
```

| 维度 | 评分 | 说明 |
|---|---|---|
| 版本控制 | ⭐⭐⭐⭐ | 统一仓库，版本同步 |
| 依赖管理 | ⭐⭐⭐⭐⭐ | pnpm/yarn workspace 自动链接 |
| 开发体验 | ⭐⭐⭐⭐⭐ | 改代码即时生效，无需发布 |
| CI/CD | ⭐⭐⭐⭐ | 标准 monorepo CI 流程 |
| 适合团队 | 任意规模 | 现代前端推荐方案 |

### 方案 D：条件编译 + 代码复制（❌ 不推荐）

| 维度 | 评分 | 说明 |
|---|---|---|
| 一致性 | ⭐ | 容易版本分叉，确定性无法保证 |
| 维护成本 | ⭐ | 每次改动需同步两份代码 |
| 结论 | ❌ | **绝对禁止**，确定性战斗的核心风险 |

---

## 三、推荐方案

### 首选：方案 C — Monorepo + Workspace

**理由：**

1. **开发体验最佳**：改 `battle-engine` 代码后，客户端/服务端**即时生效**（pnpm workspace 链接），无需发布
2. **确定性保障最强**：同一仓库同一份代码，不可能出现版本分叉
3. **配置表共用**：`config_schema.ts` 也可以放在 `packages/shared` 中，三端共用
4. **CI/CD 简单**：一个仓库一次构建，无需跨仓库协调
5. **适合当前团队规模**：独立开发/小团队，monorepo 是最佳实践

**工程结构：**
```
card-play/
├── pnpm-workspace.yaml
├── package.json                 (根 package，scripts 统一)
├── tsconfig.base.json           (共享 TS 配置)
├── packages/
│   ├── shared/                  (共享类型定义 + 配置表 Schema)
│   │   ├── src/
│   │   │   ├── types/           (Player, Card, Skill 等类型)
│   │   │   └── config/          (config_schema.ts, config_data.json)
│   │   └── package.json
│   ├── battle-engine/           (战斗引擎核心)
│   │   ├── src/
│   │   │   ├── BattleEngine.ts
│   │   │   ├── DamageCalc.ts
│   │   │   ├── BuffManager.ts
│   │   │   ├── ElementSystem.ts
│   │   │   ├── RageSystem.ts
│   │   │   ├── CooldownSystem.ts
│   │   │   ├── AiController.ts
│   │   │   └── index.ts
│   │   ├── tests/
│   │   └── package.json
│   ├── client/                  (Cocos Creator 3.x)
│   │   ├── assets/
│   │   ├── package.json → 依赖 @cardplay/battle-engine
│   │   └── ...
│   └── server/                  (Node.js + NestJS)
│       ├── src/
│       │   ├── battle/          (BattleModule)
│       │   │   └── battle.service.ts → 调用 battle-engine
│       │   └── ...
│       ├── package.json → 依赖 @cardplay/battle-engine
│       └── ...
├── docs/                        (设计文档)
└── tools/                       (构建工具)
    ├── config-builder/          (Excel → CSV → JSON/TS)
    └── ...
```

**pnpm-workspace.yaml：**
```yaml
packages:
  - 'packages/*'
```

**battle-engine/package.json：**
```json
{
  "name": "@cardplay/battle-engine",
  "version": "0.1.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

---

## 四、备选方案：方案 B — npm 私有包

如果团队后期需要**客户端/服务端独立部署、独立版本**（如外包客户端），可升级为 npm 私有包方案。

切换成本：低（monorepo 中的包本身就有 `package.json`，直接发布即可）。

---

## 五、决策状态

| # | 问题 | 决策 | 状态 |
|---|---|---|---|
| 1 | 共用方案 | ✅ Monorepo + pnpm workspace | 已定 |
| 2 | 包管理器 | ✅ pnpm | 已定 |
| 3 | 共享类型位置 | ✅ `packages/shared/src/types/` | 已定 |
| 4 | 战斗引擎测试框架 | Vitest（与 pnpm 生态一致） | 待确认 |
