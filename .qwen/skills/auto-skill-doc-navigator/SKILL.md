---
name: doc-navigator
description: 帮助查找和导航项目文档结构
source: auto-skill
extracted_at: '2026-07-16T01:57:55.853Z'
---

# 文档导航技能

本技能帮助您快速查找和导航项目文档结构，特别是按岗位分类的设计文档。

## 使用场景

- 新人入职需要快速了解项目文档结构
- 需要查找特定岗位的必读文档
- 需要了解跨岗位协作关系
- 需要跟踪文档决策状态

## 导航步骤

### 1. 查看文档总览

首先查看 `docs/ROLE_INDEX.md` 文件，这是项目的文档导航索引，包含：

- **目录结构**：所有文档的组织方式
- **文档 × 岗位映射总览**：每个文档的主责岗位和协作岗位
- **按岗位分类文档清单**：各岗位的必读文档和阅读重点
- **跨岗位协作关系图**：团队协作流程
- **文档阅读优先级**：新人入职必读和各岗位 Top 3 必读

### 2. 按岗位查找文档

根据您的角色，在 `ROLE_INDEX.md` 中找到对应的岗位分类：

**策划岗位**：
- 主策划：`overview/play.md`、`overview/tech-stack.md`
- 系统策划：`overview/play.md`、`progression/quest-system.md`、`combat/pvp-arena.md`
- 数值策划：`combat/combat-system.md`、`progression/progression-tables.md`、`data/config-tables.md`
- 战斗策划：`combat/combat-system.md`、`combat/battle-protocol.md`
- 执行策划：`data/config-tables.md`、`progression/progression-tables.md`

**程序岗位**：
- 客户端程序：`overview/tech-stack.md`、`combat/battle-protocol.md`、`data/config-tables.md`
- 服务端程序：`data/data-model.md`、`overview/tech-stack.md`、`combat/battle-protocol.md`
- 工具程序：`data/config-tables.md`、`data/data-model.md`
- AI 程序：`data/config-tables.md`、`combat/combat-system.md`

**美术岗位**：
- 概念原画/UI 美术：`art/design.md`、`overview/play.md`
- 特效设计师：`art/design.md`、`data/config-tables.md`

**测试岗位**：`combat/combat-system.md`、`combat/battle-protocol.md`、`data/gacha-rng.md`

**运营岗位**：`progression/quest-system.md`、`combat/pvp-arena.md`、`overview/play.md`

**管理岗位**：`overview/tech-stack.md`、`overview/play.md`、`ROLE_INDEX.md`

### 3. 跨岗位协作

查看 `ROLE_INDEX.md` 中的"跨岗位协作关系图"，了解：

- 制作人/项目经理统筹全局
- 主策划、客户端程序、美术总监三足鼎立
- 执行策划/配置策划是所有策划产出的汇聚点
- 测试、运营、合规各司其职

### 4. 跟踪文档状态

查看 `ROLE_INDEX.md` 中的"文档状态总览"，了解：

- 每个文档的决策进度（已定/待定）
- 最后更新时间
- 需要关注的待定项

## 常用文档路径

| 类别 | 文档路径 | 说明 |
|---|---|---|
| 核心玩法 | `docs/overview/play.md` | 六大核心玩法模块、经济系统、每日循环 |
| 技术架构 | `docs/overview/tech-stack.md` | 技术选型、架构设计、模块拆分 |
| 战斗系统 | `docs/combat/combat-system.md` | 战斗规则、伤害公式、元素克制 |
| 数据库设计 | `docs/data/data-model.md` | PostgreSQL 表结构、Redis Key 设计 |
| 配置表 | `docs/data/config-tables.md` | 21 张配置表 Schema、构建工具链 |
| 美术规范 | `docs/art/design.md` | 美术素材规范、卡牌/特效/UI 素材需求 |

## 注意事项

- 文档可能随时更新，请以最新版本为准
- 待定项需要与相关岗位沟通确认
- 跨岗位协作时，注意文档的上下游关系
- 新人入职首周建议按优先级阅读文档