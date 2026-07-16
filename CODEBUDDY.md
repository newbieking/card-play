# CODEBUDDY.md This file provides guidance to CodeBuddy when working with code in this repository.

## 项目概述

这是一个卡牌冒险养成游戏的设计文档仓库，包含游戏核心玩法、技术架构、战斗协议、抽卡系统、养成数值等设计文档。未来将基于这些设计实现跨平台游戏（移动/PC/H5/微信小游戏）。

## 常用开发命令

### 客户端开发 (Cocos Creator 3.x + TypeScript)
```bash
# 启动Cocos Creator编辑器
cocos creator

# 构建客户端（指定平台）
cocos build --platform android|ios|web-mobile|wechatgame

# 运行本地开发服务器（H5/小游戏）
cocos run --platform web-mobile
```

### 服务端开发 (Node.js + TypeScript)
```bash
# 安装依赖
npm install

# 启动开发服务器（NestJS/Fastify）
npm run start:dev

# 运行构建
npm run build

# 运行数据库迁移
npm run migration:run

# 运行单元测试
npm run test

# 运行单个测试文件
npm run test -- --testFile=path/to/test.spec.ts
```

### 配置表管理
```bash
# 从CSV生成TypeScript类型定义
npm run config:generate

# 验证配置表格式
npm run config:validate
```

## 架构概述

### 技术栈
- **客户端**: Cocos Creator 3.x (TypeScript) - 一套代码覆盖移动/PC/H5/小游戏
- **服务端**: Node.js (TypeScript) + NestJS/Fastify + PostgreSQL + Redis
- **数据驱动**: CSV/JSON配置表 + 自动生成TS类型，策划热更无需改码
- **通信协议**: WebSocket（长连）+ Protobuf/JSON

### 客户端分层架构
```
表现层 (View) → UI界面/卡牌动画/特效播放
战斗表现层 (BattleView) → 回合制演出、特效驱动
业务逻辑层 (Logic) → 玩法流程、状态机、本地校验
数据层 (Data) → 配置表(CSV/JSON)、本地存档缓存
网络层 (Net) → WS封装、断线重连、协议编解码
```

### 服务端分层架构
```
网关 Gateway → 连接管理、鉴权、限流、协议编解码
逻辑服 Logic → 按模块微服务化（Account/Card/Gacha/Battle等）
数据层 → PostgreSQL（永久数据）+ Redis（缓存/排行）+ MQ（异步任务）
```

### 核心设计模式
1. **数据驱动**: 所有数值（卡牌属性、技能倍率、升星消耗、抽卡概率）以CSV/JSON配置表管理，客户端与服务端共用同一份schema
2. **服务端权威**: 战斗校验、抽卡保底、关键数值结算全部在服务端完成，防篡改
3. **确定性战斗**: 客户端提交阵容+指令序列，服务端以相同种子+逻辑重演，输出权威结果
4. **配置热更**: 通过Config Center管理配置版本，支持增量更新无需发版

### 关键模块
- **战斗校验模块**: 自动/半自动回合制，确定性帧指令协议
- **抽卡保底模块**: 服务端安全随机源+保底计数器，满足合规审计
- **养成数值系统**: 升星/技能/装备强化全部数据驱动，配置表范式可复用
- **经济服务接口**: 资源变更统一走原子接口，保证并发安全

### 设计文档索引

`docs/` 目录下共 12 份设计文档，按岗位分工的完整导航见 [`docs/ROLE_INDEX.md`](docs/ROLE_INDEX.md)。

```
docs/
├── ROLE_INDEX.md              ← 岗位×文档导航索引
├── overview/                  ← 全局概览
│   ├── play.md                ← 核心玩法框架（主策划/系统策划）
│   └── tech-stack.md          ← 技术架构（客户端/服务端程序）
├── combat/                    ← 战斗系统
│   ├── combat-system.md       ← 战斗规则与伤害公式（战斗策划/数值策划）
│   ├── battle-protocol.md     ← 战斗帧指令协议（战斗策划/服务端程序）
│   └── pvp-arena.md           ← PVP 竞技场（系统策划/数值策划）
├── progression/               ← 养成系统
│   ├── progression-tables.md  ← 升星数值表（数值策划）
│   └── quest-system.md        ← 任务与体力（系统策划）
├── data/                      ← 数据与配置
│   ├── data-model.md          ← 数据库设计（服务端程序）
│   ├── config-tables.md       ← 配置表 Schema（执行策划/配置策划）
│   └── gacha-rng.md           ← 抽卡 RNG 算法（数值策划/服务端程序）
└── art/                       ← 美术规范
    └── design.md              ← 美术素材规范（美术总监/概念原画）
```

### 开发注意事项
- 战斗引擎代码客户端/服务端共用一份TS实现，确保确定性
- 配置表schema变更需同步更新客户端和服务端的类型定义
- 服务端随机数使用加密级安全随机源（crypto.randomBytes），不使用Math.random()
- 资源热更通过Cocos Asset Bundle分包实现，支持增量更新