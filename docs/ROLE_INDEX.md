# 设计文档导航索引 — 按岗位分工分类

> 本文档将 `docs/` 目录下的 12 份设计文档（含本文档），按游戏团队六大岗位（策划/程序/美术/测试/运营/管理）进行分类组织，方便各角色快速定位职责范围内的文档，并了解跨角色协作的上下游关系。

## 目录结构

```
docs/
├── ROLE_INDEX.md              ← 本文档（导航索引）
├── overview/                  ← 全局概览
│   ├── play.md                ← 核心玩法框架
│   ├── tech-stack.md          ← 技术架构
│   ├── battle-engine-sharing.md ← 战斗引擎共用方案
│   ├── industry-comparison.md ← 业界对比分析
│   └── ui-flow.md             ← UI 界面流程设计
├── combat/                    ← 战斗系统
│   ├── combat-system.md       ← 战斗规则与伤害公式
│   ├── battle-protocol.md     ← 战斗帧指令协议
│   └── pvp-arena.md           ← PVP 竞技场
├── progression/               ← 养成系统
│   ├── progression-tables.md  ← 升星数值表
│   ├── quest-system.md        ← 任务与体力
│   └── tutorial-design.md     ← 新手引导教学
├── data/                      ← 数据与配置
│   ├── data-model.md          ← 数据库设计
│   ├── config-tables.md       ← 配置表 Schema
│   ├── api-interfaces.md      ← API 接口清单与错误码
│   ├── gacha-rng.md           ← 抽卡 RNG 算法
│   ├── sample-cards.md        ← 示例卡牌数值
│   └── fixed-point-spec.md    ← 定点数实现规范
└── art/                       ← 美术规范
    └── design.md              ← 美术素材规范
```

---

## 一、文档 × 岗位映射总览

| 文档 | 路径 | 主责岗位 | 协作岗位 | 说明 |
|---|---|---|---|---|
| `play.md` | `overview/` | 主策划 / 系统策划 | 程序、美术 | 核心玩法框架、六大模块、经济系统、每日循环 |
| `tech-stack.md` | `overview/` | 客户端程序 / 服务端程序 | 全员 | 技术选型、架构设计、模块拆分、里程碑 |
| `combat-system.md` | `combat/` | 战斗策划 / 数值策划 | 程序 | 伤害公式、混合资源、元素克制、5 卡阵型、Buff 机制 |
| `battle-protocol.md` | `combat/` | 战斗策划 / 服务端程序 | 客户端程序 | 确定性帧指令协议、服务端校验逻辑 |
| `pvp-arena.md` | `combat/` | 系统策划 / 数值策划 | 服务端程序 | 异步战报、战力匹配、积分制段位 |
| `progression-tables.md` | `progression/` | 数值策划 | 系统策划、程序 | 升星消耗、属性成长、技能树 |
| `quest-system.md` | `progression/` | 系统策划 | 数值策划、运营 | 体力系统、日常/周常任务、成就、签到 |
| `data-model.md` | `data/` | 服务端程序 | 数值策划、系统策划 | PostgreSQL 14 张表 DDL、Redis Key 设计 |
| `config-tables.md` | `data/` | 执行策划 / 配置策划 | 程序（工具链） | 21 张配置表 Schema、构建工具链 |
| `gacha-rng.md` | `data/` | 数值策划 / 系统策划 | 服务端程序 | 抽卡 RNG 实现、保底算法、合规审计 |
| `design.md` | `art/` | 美术总监 / 概念原画 | 主策划 | 美术素材规范、卡牌/特效/UI 素材需求 |

---

## 二、按岗位分类文档清单

### 策划岗位（Game Designer）

#### 主策划 / 制作人助理（PD/Lead Designer）
> 统筹所有策划，把控玩法方向、排期、文档规范

| 必读文档 | 阅读重点 |
|---|---|
| `overview/play.md` | §一~§五：六大核心玩法模块、经济系统、每日循环，全局方向 |
| `overview/tech-stack.md` | §六：模块优先级与里程碑（M1~M5），了解技术可行性 |
| `ROLE_INDEX.md` | 本文档：全局文档索引与岗位协作关系 |

#### 系统策划（System Designer）
> 搭建底层玩法框架：背包、任务、好友、公会、商城、签到、战斗流程、UI 交互逻辑

| 必读文档 | 阅读重点 |
|---|---|
| `overview/play.md` | 全文：六大模块框架、资源类型、付费设计、每日循环 |
| `combat/pvp-arena.md` | §一~§六：PVP 匹配、段位、赛季、奖励，竞技场系统设计 |
| `progression/quest-system.md` | 全文：体力系统、日常/周常任务、成就、签到、新手引导 |
| `data/config-tables.md` | §2.6~§2.8：quest_def / achievement_def / global_const Schema |
| `data/data-model.md` | §3.5（team_formation）、§3.11（arena_data）、§3.12（quest_progress） |

#### 数值策划（Numerical Designer）⭐
> 游戏平衡性核心！战斗数值、成长数值、经济数值

| 必读文档 | 阅读重点 |
|---|---|
| `combat/combat-system.md` | §一~§三：属性体系、伤害公式（双曲线 K=500）、元素克制 |
| `progression/progression-tables.md` | §二~§四：升星消耗、属性成长（五维分离）、数值平衡建议 |
| `data/gacha-rng.md` | §二：保底规则（pity_start/pity_hard），概率配置 |
| `data/config-tables.md` | §3.1（card_def）、§3.2（card_skill）、§3.15（global_const 战斗常量） |
| `combat/pvp-arena.md` | §2（战力公式）、§5（积分变动规则） |

**产出文档 → 填入配置表：**
- 伤害公式参数 → `global_const.csv`
- 卡牌基础属性 → `card_def.csv`（base_atk/matk/def/mdef）
- 技能倍率/怒气消耗/冷却 → `card_skill.csv`
- 升星消耗/属性成长 → `card_star_up.csv` / `card_stat_growth.csv`
- 保底概率/软保底数值 → `gacha_pool.csv`
- Buff 效果参数 → `buff_def.csv`

#### 战斗策划（Combat Designer）
> 专精战斗机制：技能设计、AI 行为、Buff 机制、招式手感

| 必读文档 | 阅读重点 |
|---|---|
| `combat/combat-system.md` | §四~§六：技能分类、状态效果（6 大类 Buff）、结算顺序 |
| `combat/battle-protocol.md` | §二~§四：战斗帧模型、Action 类型、服务端校验伪代码 |
| `data/config-tables.md` | §3.2（card_skill）、§3.14（buff_def + 6 条示例数据） |

**与数值策划协作点：**
- 战斗策划定**技能机制**（怎么打）→ 数值策划定**伤害数值**（打多少血）
- Buff 规则由战斗策划定义 → 数值策划调整倍率/持续时间

#### 关卡策划（Level Designer）
> 地图地形、怪物摆放、副本流程、难度曲线

| 必读文档 | 阅读重点 |
|---|---|
| `overview/play.md` | §1（冒险模式）、§2（爬塔升级）：章节结构、关卡示例、爬塔特色机制 |
| `data/config-tables.md` | §3.5（stage_config）、§3.6（enemy_def）、§3.7（tower_config） |
| `data/data-model.md` | §3.6（adventure_progress）、§3.7（tower_progress） |

#### 执行策划 / 配置策划
> 把策划文档内容填进配置表，校验数据，版本配置打包

| 必读文档 | 阅读重点 |
|---|---|
| `data/config-tables.md` | **全文**：21 张配置表 Schema、字段定义、示例数据 |
| `progression/progression-tables.md` | §2.1~§2.2：升星表/属性成长表的 CSV 示例 |
| `data/gacha-rng.md` | §3.3：权重与概率配置格式 |
| 所有其他文档 | 按需查阅，确保配置表数据与策划设计一致 |

---

### 程序岗位（Engineer）

#### 客户端程序（Client Programmer）
> Cocos Creator 3.x + TypeScript，UI/动画/特效/演出

| 必读文档 | 阅读重点 |
|---|---|
| `overview/tech-stack.md` | §1.1（Cocos 选型）、§2.1（客户端分层）、§4.1/4.5（战斗/热更） |
| `combat/battle-protocol.md` | §三（C→S/S→C 协议）：客户端需要实现的所有接口 |
| `data/config-tables.md` | §四（构建工具链）：配置表 → TS 类型 → Asset Bundle 流程 |
| `combat/combat-system.md` | §五（技能分类）、§七（阵型）：演出层需要展示的内容 |

#### 服务端程序（Server Programmer）
> Node.js (TS) + NestJS/Fastify + PostgreSQL + Redis

| 必读文档 | 阅读重点 |
|---|---|
| `overview/tech-stack.md` | §1.2（服务端选型）、§2.2（服务端分层）、§3.2（模块详细设计） |
| `data/data-model.md` | **全文**：14 张 PostgreSQL 表 DDL、Redis Key 设计 |
| `combat/battle-protocol.md` | §四（服务端校验逻辑）：确定性引擎、validateAction、calcDamage 伪代码 |
| `data/gacha-rng.md` | §三（RNG 实现）：crypto.randomBytes、保底判定流程 |
| `data/config-tables.md` | §3.15（global_const）：服务端运行时常量来源 |

#### 工具程序（Tools Programmer）
> 给策划做编辑器、表格导表工具、资源批量处理

| 必读文档 | 阅读重点 |
|---|---|
| `data/config-tables.md` | §四（构建工具链建议）：Excel → CSV → TS 类型 + JSON 的完整管线 |
| `data/data-model.md` | DDL 语句：数据库迁移脚本参考 |

#### AI 程序（中小团队常由客户端兼任）
> 怪物 AI、NPC 行为、寻路、行为树

| 必读文档 | 阅读重点 |
|---|---|
| `data/config-tables.md` | §3.6（enemy_def）：`ai_strategy` 字段（aggressive/balanced/defensive/boss_pattern） |
| `combat/combat-system.md` | §五（技能分类）、§八（回合流程）：AI 决策窗口与行动规则 |
| `combat/pvp-arena.md` | §4.3（防守阵容）：AI 操作策略配置 |

---

### 美术岗位（Art）

#### 概念原画 / UI 美术（Concept Artist / GUI Artist）
> 角色原画、场景原画、界面视觉设计

| 必读文档 | 阅读重点 |
|---|---|
| `art/design.md` | **全文**：美术素材规范（尺寸/格式/目录）、素材需求汇总（A/B/C 三类） |
| `overview/play.md` | §6（素材需求汇总）：卡牌/特效/UI 素材清单 |
| `data/config-tables.md` | §3.1（card_def）：illustration / avatar 资源路径规范 |

#### 特效设计师（VFX Artist）
> 技能光效、粒子特效、UI 闪光

| 必读文档 | 阅读重点 |
|---|---|
| `art/design.md` | §B（特效相关）：传说入场/法术/合成/升星特效需求 |
| `data/config-tables.md` | §3.14（buff_def）：`vfx_id` 字段，每条 Buff 对应的特效 ID |
| `combat/combat-system.md` | §六（状态效果列表）：需要制作哪些 Buff 视觉特效 |

---

### 测试岗位（QA）

#### 功能测试 / 性能测试
> 找 BUG、验证策划需求、帧率/内存/兼容性

| 必读文档 | 阅读重点 |
|---|---|
| `combat/combat-system.md` | §八（回合流程）：战斗结算顺序、异常场景 |
| `combat/battle-protocol.md` | §四（服务端校验）：防篡改要点、异常日志记录 |
| `data/gacha-rng.md` | §四（合规与审计）：审计日志字段、客诉核查流程 |
| `data/config-tables.md` | §3.14（buff_def 示例）：Buff 叠加/刷新/净化的预期行为 |

**测试用例参考：**
- 冰冻 + 受击 +50% 伤害解冻 → 验证 `freeze` buff 结算
- 中毒叠加 3 层 → 验证 `intensify` 模式
- 护盾吸收不受防御减免 → 验证 `shield_absorb` 独立计算
- 怒气不足时尝试释放主动技能 → 验证 `validateAction` 拒绝
- PVP 连胜 5+ → 验证额外 +5 积分

---

### 运营岗位（Operations）

#### 活动策划 / 商业化运营
> 活动策划、礼包定价、留存分析、LTV

| 必读文档 | 阅读重点 |
|---|---|
| `progression/quest-system.md` | §六~§八：签到奖励、新手破冰、战令联动 |
| `combat/pvp-arena.md` | §六（奖励体系）：每日/赛季/排行榜奖励表 |
| `overview/play.md` | §四（经济系统）：资源类型、付费点设计、月卡/战令 |
| `data/gacha-rng.md` | §一（设计原则）：概率公示、合规审计 |

#### 合规专员
> 概率公示、审计日志、客诉处理

| 必读文档 | 阅读重点 |
|---|---|
| `data/gacha-rng.md` | §四（合规与审计）：概率公示、审计日志表、客诉核查 |
| `data/data-model.md` | §3.9（gacha_audit）：审计日志 DDL |

---

### 管理岗位（Management）

#### 制作人（Producer）
> 项目最高负责人，成本/工期/营收/项目生死

| 必读文档 | 阅读重点 |
|---|---|
| `overview/tech-stack.md` | §五（模块优先级与里程碑 M1~M5）：项目分阶段交付计划 |
| `overview/play.md` | §四（经济系统）：付费设计、商业化路径 |
| `ROLE_INDEX.md` | 本文档：全局文档索引，了解项目全貌 |

#### 项目经理（PM）
> 排期、风险管理、跨组沟通

| 必读文档 | 阅读重点 |
|---|---|
| `overview/tech-stack.md` | §五（里程碑）：各阶段关键交付物 |
| `ROLE_INDEX.md` | 本文档：各岗位职责边界与协作关系 |
| 所有文档 | 跟踪各文档的"决策状态汇总"，掌握待定项进度 |

---

## 三、跨岗位协作关系图

```
                    ┌─────────────────────────────────────────┐
                    │            制作人 / 项目经理              │
                    │     统筹全局、排期、成本、里程碑          │
                    └────────────────┬────────────────────────┘
                                     │
            ┌────────────────────────┼────────────────────────┐
            ▼                        ▼                        ▼
   ┌────────────────┐     ┌────────────────┐     ┌────────────────┐
   │    主策划       │     │   客户端程序    │     │   美术总监      │
   │  play.md       │     │ tech-stack.md  │     │   design.md    │
   │  ROLE_INDEX.md │     │ battle-protocol│     │                │
   └───────┬────────┘     └───────┬────────┘     └───────┬────────┘
           │                      │                      │
    ┌──────┼──────┐         ┌─────┼─────┐          ┌─────┼─────┐
    ▼      ▼      ▼         ▼     ▼     ▼          ▼     ▼     ▼
 系统策划 数值策划 战斗策划  服务端 工具程 AI程序   原画  UI   特效
    │      │      │         │     │     │          │     │     │
    │      │      │    ┌────┘     │     │          │     │     │
    │      │      │    ▼          │     │          │     │     │
    │      │      │ data-model    │     │          │     │     │
    │      │      │ gacha-rng     │     │          │     │     │
    │      │      │               │     │          │     │     │
    ▼      ▼      ▼               ▼     ▼          ▼     ▼     ▼
  ┌──────────────────────────────────────────────────────────────┐
  │                    执行策划 / 配置策划                         │
  │              config-tables.md（21 张配置表 Schema）           │
  │         所有策划产出 → 填入配置表 → 程序读取运行               │
  └──────────────────────────────────────────────────────────────┘
                                     │
                          ┌──────────┼──────────┐
                          ▼          ▼          ▼
                      ┌──────┐  ┌──────┐  ┌──────┐
                      │ 测试 │  │ 运营 │  │ 合规 │
                      │  QA  │  │      │  │      │
                      └──────┘  └──────┘  └──────┘
```

---

## 四、文档阅读优先级（按角色）

### 新人入职首周必读

| 优先级 | 文档 | 角色 | 原因 |
|---|---|---|---|
| P0 | `overview/play.md` | 全员 | 了解游戏是什么、做什么 |
| P0 | `ROLE_INDEX.md` | 全员 | 知道自己该看哪些文档 |
| P1 | 按岗位表格选读 | 各岗位 | 深入职责范围 |
| P2 | `overview/tech-stack.md` | 全员 | 了解技术实现方案 |

### 各岗位 Top 3 必读

| 岗位 | Top 1 | Top 2 | Top 3 |
|---|---|---|---|
| 主策划 | `overview/play.md` | `overview/tech-stack.md` | `ROLE_INDEX.md` |
| 系统策划 | `overview/play.md` | `progression/quest-system.md` | `combat/pvp-arena.md` |
| 数值策划 | `combat/combat-system.md` | `progression/progression-tables.md` | `data/config-tables.md` |
| 战斗策划 | `combat/combat-system.md` | `combat/battle-protocol.md` | `data/config-tables.md` |
| 执行策划 | `data/config-tables.md` | `progression/progression-tables.md` | `data/gacha-rng.md` |
| 客户端程序 | `overview/tech-stack.md` | `combat/battle-protocol.md` | `data/config-tables.md` |
| 服务端程序 | `data/data-model.md` | `overview/tech-stack.md` | `combat/battle-protocol.md` |
| 美术 | `art/design.md` | `overview/play.md` | `data/config-tables.md` |
| 测试 | `combat/combat-system.md` | `combat/battle-protocol.md` | `data/gacha-rng.md` |
| 运营 | `progression/quest-system.md` | `combat/pvp-arena.md` | `overview/play.md` |
| 制作人 | `overview/tech-stack.md` | `overview/play.md` | `ROLE_INDEX.md` |

---

## 五、文档状态总览

| 文档 | 决策进度 | 最后更新 |
|---|---|---|
| `overview/play.md` | ✅ 已回填新决策 | 本轮回填 |
| `overview/tech-stack.md` | ✅ 已回填新决策 | 模块+PVP+战斗引擎 |
| `combat/combat-system.md` | 6 已定 / 5 待定 | 伤害公式+混合资源+阵型 |
| `combat/battle-protocol.md` | 6 已定 / 2 待定 | 协议+校验伪代码 |
| `combat/pvp-arena.md` | 7 已定 / 1 待定 | 战力匹配+积分制 |
| `progression/progression-tables.md` | 1 已定 / 3 待定 | MATK/MDEF 面板分离 |
| `progression/quest-system.md` | 3 已定 / 5 待定 | 体力+任务+global_const 引用 |
| `data/data-model.md` | 5 已定 / 3 待定 | 面板分离+战力匹配 |
| `data/config-tables.md` | 4 已定 / 5 待定 + 6 条 buff 示例 | Schema+示例数据 |
| `data/gacha-rng.md` | 4 已定 / 3 待定 | 保底算法+碎片转化 |
| `art/design.md` | — | 美术规范，无需同步 |
