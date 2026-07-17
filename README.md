# Card Play - 卡牌冒险养成游戏

> Monorepo 架构，基于 pnpm workspace 管理

## 项目结构

```
card-play/
├── packages/
│   ├── shared/              共享类型定义
│   ├── battle-engine/       战斗引擎核心（确定性回合制）
│   ├── server/              NestJS 服务端
│   └── client/              Cocos Creator 客户端骨架
├── tools/
│   └── config-builder/      配置表构建工具（CSV → JSON + TS 类型）
└── docs/                    设计文档（17 份）
```

## 快速开始

### 1. 安装依赖

```bash
# 需要 Node.js >= 18, pnpm >= 8
pnpm install
```

### 2. 运行战斗引擎测试

```bash
pnpm --filter @cardplay/battle-engine test
```

### 3. 启动服务端（需要 PostgreSQL + Redis）

```bash
# 配置环境变量
export DB_HOST=localhost
export DB_PORT=5432
export DB_USER=cardplay
export DB_PASSWORD=cardplay_dev
export DB_NAME=cardplay
export JWT_SECRET=your-secret-key

# 启动开发服务器
pnpm --filter @cardplay/server dev
```

### 4. 构建配置表

```bash
# 将 CSV 配置转换为 JSON + TypeScript 类型
cd tools/config-builder
pnpm run build
```

## 技术栈

| 模块 | 技术 |
|---|---|
| 客户端 | Cocos Creator 3.x + TypeScript |
| 服务端 | Node.js + NestJS + TypeORM + PostgreSQL + Redis |
| 战斗引擎 | TypeScript（客户端/服务端共用） |
| 通信协议 | HTTP (REST) + WebSocket (实时战斗) |
| 包管理 | pnpm workspace (Monorepo) |

## API 端点

| 端点 | 方法 | 认证 | 说明 |
|---|---|---|---|
| `/api/v1/health` | GET | ❌ | 健康检查 |
| `/api/v1/account/guest_login` | POST | ❌ | 游客登录 |
| `/api/v1/profile` | GET | ✅ | 获取玩家档案 |
| `/api/v1/card/star_up` | POST | ✅ | 卡牌升星 |
| `/api/v1/gacha/draw` | POST | ✅ | 抽卡 |
| `/api/v1/battle/start` | POST | ✅ | 开始战斗 |
| `/api/v1/battle/execute` | POST | ✅ | 执行战斗 |

完整 API 文档见 `docs/data/api-interfaces.md`

## 设计文档

| 文档 | 路径 | 说明 |
|---|---|---|
| 核心玩法 | `docs/overview/play.md` | 六大玩法模块 |
| 技术架构 | `docs/overview/tech-stack.md` | 技术选型与架构 |
| 战斗规则 | `docs/combat/combat-system.md` | 伤害公式、元素克制 |
| 数据模型 | `docs/data/data-model.md` | 14 张表 DDL |
| API 接口 | `docs/data/api-interfaces.md` | 接口清单与错误码 |
| 配置表 | `docs/data/config-tables.md` | 21 张配置表 Schema |

完整导航见 `docs/ROLE_INDEX.md`

## 开发状态

| 模块 | 状态 |
|---|---|
| 战斗引擎 | ✅ 15 测试通过 |
| 认证模块 | ✅ JWT + device_id |
| 玩家档案 | ✅ CRUD + 分页 |
| 卡牌管理 | ✅ 升星/技能/阵容（事务） |
| 抽卡系统 | ✅ RNG + 保底 + 碎片转化 |
| 战斗服务 | ✅ 引擎集成 + 奖励发放 |
| 配置同步 | ✅ 版本管理 |
| 客户端骨架 | ✅ 网络层 + 战斗场景 |

## License

Private
