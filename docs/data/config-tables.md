# 配置表总览与完整 Schema

> 配套文档：`progression-tables.md`（升星表）、`play.md`（养成系统）、`gacha-rng.md`（抽卡配置）、`tech-stack.md`（数据驱动设计）
> 目标：统一定义所有配置表的清单与 schema，作为策划 Excel 导出规范和 TS 类型自动生成的依据

---

## 一、配置表设计原则

- **格式**：策划用 Excel/Google Sheets 编辑 → 导出 CSV → 构建工具生成 TS 类型 + JSON
- **共用性**：同一份配置表双端共享（服务端读 JSON，客户端读 Asset Bundle 中的配置资源）
- **热更**：配置表走 Config Center 版本管理，增量下发，无需发版
- **校验**：构建脚本自动校验必填字段、数值范围、外键引用完整性

---

## 二、配置表清单

### 2.1 卡牌相关（3 张表）

| 表名 | 说明 | 行数预估 | 状态 |
|---|---|---|---|
| `card_def` | 卡牌定义（名称、稀有度、职业、元素、基础属性） | ~100 | ⬜ 待设计 |
| `card_skill` | 技能定义（效果类型、倍率、冷却、消耗） | ~200 | ⬜ 待设计 |
| `card_skill_tree` | 技能树（卡牌→技能→解锁星级/等级要求） | ~300 | ⬜ 待设计 |

### 2.2 养成相关（4 张表）

| 表名 | 说明 | 行数预估 | 状态 |
|---|---|---|---|
| `card_star_up` | 升星消耗（已在 progression-tables.md 定义） | ~40 | ✅ 已有 |
| `card_stat_growth` | 属性成长（已在 progression-tables.md 定义） | ~20 | ✅ 已有 |
| `skill_level_up` | 技能升级消耗 | ~50 | ⬜ 待设计 |
| `equip_enhance` | 装备强化消耗与概率 | ~60 | ⬜ 待设计 |

### 2.3 战斗相关（3 张表）

| 表名 | 说明 | 行数预估 | 状态 |
|---|---|---|---|
| `stage_config` | 关卡配置（怪物阵容、增益效果、掉落） | ~200 | ⬜ 待设计 |
| `enemy_def` | 敌方单位定义（属性、技能、AI 策略） | ~100 | ⬜ 待设计 |
| `tower_config` | 爬塔配置（每层敌人、命运选择池） | ~100 | ⬜ 待设计 |

### 2.4 抽卡相关（2 张表）

| 表名 | 说明 | 行数预估 | 状态 |
|---|---|---|---|
| `gacha_pool` | 卡池配置（已在 gacha-rng.md 提及） | ~20 | ⬜ 待设计 |
| `gacha_pool_card` | 卡池内含卡牌权重 | ~200 | ⬜ 待设计 |

### 2.5 经济相关（4 张表）

| 表名 | 说明 | 行数预估 | 状态 |
|---|---|---|---|
| `shop_product` | 商店商品（钻石/金币/礼包） | ~50 | ⬜ 待设计 |
| `monthly_card` | 月卡权益 | ~5 | ⬜ 待设计 |
| `battle_pass` | 战令等级奖励 | ~100 | ⬜ 待设计 |
| `drop_pool` | 掉落池配置（关卡/活动共用） | ~30 | ⬜ 待设计 |

### 2.6 任务相关（2 张表）

| 表名 | 说明 | 行数预估 | 状态 |
|---|---|---|---|
| `quest_def` | 任务定义（条件、目标、奖励） | ~80 | ⬜ 待设计 |
| `achievement_def` | 成就定义 | ~50 | ⬜ 待设计 |

### 2.7 战斗相关扩展（1 张表）

| 表名 | 说明 | 行数预估 | 状态 |
|---|---|---|---|
| `buff_def` | 状态效果定义（6 大类：增益/减益/控制/DoT/护盾/特殊） | ~60 | ⬜ 待设计 |

### 2.8 系统相关（2 张表）

| 表名 | 说明 | 行数预估 | 状态 |
|---|---|---|---|
| `player_level` | 玩家等级经验表 | ~100 | ⬜ 待设计 |
| `global_const` | 全局常量（体力上限、恢复速度等） | ~20 | ⬜ 待设计 |

**合计：约 21 张配置表，预估 ~1800+ 行配置数据**

---

## 三、各表详细 Schema

### 3.1 `card_def.csv` — 卡牌定义

> 采用面板分离设计（ATK/MATK/DEF/MDEF 全部独立），物理/法系职业各有侧重。

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| id | string | ✅ | 唯一标识，如 `frost_queen` |
| name | string | ✅ | 前端显示名 |
| rarity | enum | ✅ | `common` / `rare` / `epic` / `legendary` |
| class | enum | ✅ | `warrior` / `mage` / `warlock` / `archer` / `priest` |
| element | enum | ✅ | `fire` / `ice` / `thunder` / `water` / `light` / `dark` / `nature` |
| max_star | int | ✅ | 最大星级（普通=5, 传说=10） |
| base_hp | int | ✅ | 1★1级基础 HP |
| base_atk | int | ✅ | 1★1级基础物理攻击 |
| base_matk | int | ✅ | 1★1级基础法术强度（法系职业高，物理职业低或为 0） |
| base_def | int | ✅ | 1★1级基础物理防御 |
| base_mdef | int | ✅ | 1★1级基础法术抗性 |
| base_spd | int | ✅ | 基础速度 |
| base_crit | float | ✅ | 基础暴击率（如 0.05） |
| base_crit_dmg | float | ✅ | 基础暴击伤害倍率（如 1.5） |
| base_lifesteal | float | | 基础吸血率（默认 0） |
| illustration | string | | 插画资源路径 |
| avatar | string | | 头像资源路径 |
| description | string | | 图鉴描述文本 |

**面板设计原则：** 战士侧重 ATK+DEF、法师侧重 MATK+MDEF、射手侧重 ATK+SPD、辅助均衡。

### 3.2 `card_skill.csv` — 技能定义

> 混合资源机制：主动技能（slot 1）走怒气制，终极技能（slot 3）走冷却制。

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| id | string | ✅ | 如 `frost_queen_ice_spike` |
| card_id | string | ✅ | 所属卡牌 ID |
| name | string | ✅ | 技能名称 |
| type | enum | ✅ | `active` / `passive` / `ultimate` |
| damage_type | enum | ✅ | `physical` / `magical` — 决定走 DEF 还是 MDEF 减伤线 |
| target_type | enum | ✅ | `self` / `single_enemy` / `all_enemy` / `single_ally` / `all_ally` / `front_row` / `back_row` |
| effect_type | enum | ✅ | `damage` / `heal` / `buff` / `debuff` / `control` / `shield` / `revive` / `dot` |
| damage_multiplier | float | | 伤害倍率（如 1.5，物理技能吃 ATK，法术技能吃 MATK） |
| heal_multiplier | float | | 治疗倍率（吃 MATK） |
| buff_id | string | | 关联的 Buff/Debuff ID（见 §3.15 `buff_def`） |
| buff_duration | int | | 持续回合数 |
| cooldown | int | | 冷却回合数（**仅 ultimate 类型生效**） |
| rage_cost | int | | 怒气消耗（**仅 active 类型生效**，默认值如 40-100） |
| rage_gain | int | | 释放后是否额外产怒（普攻默认 +20，默认仅普攻生效） |
| description | string | ✅ | 技能描述文本 |

**怒气获取规则（全局）：** 普攻 +20、受击 +10、击杀 +30，上限 100。此规则全局统一，不在本表逐条配置。

### 3.3 `card_skill_tree.csv` — 技能树

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| card_id | string | ✅ | 卡牌 ID |
| skill_id | string | ✅ | 技能 ID |
| slot | int | ✅ | 技能槽位 (1/2/3) |
| unlock_star | int | ✅ | 升星要求 |
| unlock_level | int | | 等级要求 |
| max_level | int | ✅ | 最大技能等级 |

### 3.4 `skill_level_up.csv` — 技能升级消耗

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| skill_id | string | ✅ | 技能 ID |
| from_lv | int | ✅ | 当前等级 |
| to_lv | int | ✅ | 目标等级 |
| gold_cost | int | ✅ | 金币消耗 |
| book_cost | int | ✅ | 技能书消耗 |
| card_level_req | int | | 卡牌等级要求 |

### 3.5 `stage_config.csv` — 关卡配置

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| id | string | ✅ | 关卡 ID，如 `ch1_stage4` |
| chapter_id | string | ✅ | 所属章节 |
| stage_index | int | ✅ | 关卡序号 |
| name | string | ✅ | 关卡名称 |
| type | enum | ✅ | `normal` / `elite` / `boss` |
| stamina_cost | int | ✅ | 体力消耗 |
| enemy_formation | json | ✅ | 敌方阵容，如 `[{enemy_id, level, star}, ...]` |
| stage_buff | string | | 关卡增益/减益 buff ID |
| drop_group_id | string | ✅ | 关联 drop_pool |
| first_clear_reward | json | | 首通奖励 |
| recommended_power | int | | 推荐战力 |
| unlock_req | string | | 解锁条件（通关前一关或玩家等级） |

### 3.6 `enemy_def.csv` — 敌方单位定义

> 面部分离与卡牌一致。

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| id | string | ✅ | 如 `ice_wolf` |
| name | string | ✅ | — |
| type | enum | ✅ | `normal` / `elite` / `boss` |
| element | enum | ✅ | `fire` / `ice` / `thunder` / `water` / `light` / `dark` / `nature` |
| class | enum | ✅ | `warrior` / `mage` / `warlock` / `archer` / `priest` |
| ai_strategy | enum | | `aggressive` / `balanced` / `defensive` / `boss_pattern` |
| skill_id_list | json | | 拥有的技能 ID 列表 |
| base_hp | int | ✅ | — |
| base_atk | int | ✅ | 物理攻击 |
| base_matk | int | ✅ | 法术强度 |
| base_def | int | ✅ | 物理防御 |
| base_mdef | int | ✅ | 法术抗性 |
| base_spd | int | ✅ | — |
| illustration | string | | 资源路径 |

### 3.7 `tower_config.csv` — 爬塔配置

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| floor | int | ✅ | 楼层数 |
| floor_type | enum | ✅ | `normal` / `elite` / `boss` / `fate` |
| enemy_formation | json | 普通/精英/Boss 层 | 敌方阵容 |
| fate_choices | json | 命运层 | 三选一 buff 列表 `[buff_id1, buff_id2, buff_id3]` |
| power_scale | float | ✅ | 相对上一层的战力倍率 |
| drop_group_id | string | | 掉落池 |
| special_rule | string | | 特殊规则（如"治疗减半"） |

### 3.8 `gacha_pool.csv` — 卡池配置

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| id | string | ✅ | 卡池 ID |
| name | string | ✅ | — |
| type | enum | ✅ | `standard` / `class_limited` / `time_limited` / `newbie` |
| draw_cost_type | enum | ✅ | `diamond` / `event_token` |
| draw_cost_1 | int | ✅ | 单抽价格 |
| draw_cost_10 | int | | 十连价格 |
| ten_guarantee_rarity | enum | | 十连保底稀有度 `rare` |
| pity_start | int | | 软保底起始抽数 |
| pity_hard | int | | 硬保底抽数 |
| pity_boost_rate | float | | 软保底每抽概率提升 |
| inherit_pool_id | string | | 保底继承卡池 ID（限时池结束后） |
| is_active | bool | ✅ | 是否启用 |
| start_time | datetime | | 限时池开始 |
| end_time | datetime | | 限时池结束 |
| description | string | | 前端展示 |

### 3.9 `gacha_pool_card.csv` — 卡池含卡权重

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| pool_id | string | ✅ | 卡池 ID |
| card_id | string | ✅ | 卡牌 ID |
| rarity | enum | ✅ | 稀有度（判定分层用） |
| weight | int | ✅ | 该稀有度内的权重 |
| is_up | bool | | 是否概率 UP（限时池） |

### 3.10 `equip_enhance.csv` — 装备强化

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| equip_type | enum | ✅ | `weapon` / `armor` / `accessory` |
| from_level | int | ✅ | 当前强化等级 |
| to_level | int | ✅ | 目标强化等级 |
| gold_cost | int | ✅ | 金币消耗 |
| mat_cost | int | ✅ | 材料消耗 |
| success_rate | float | ✅ | 成功率（如 1.0 / 0.8 / 0.5） |
| fail_penalty | enum | | `none` / `drop_level` / `destroy` |
| protect_item_id | string | | 保护符道具 ID |

### 3.11 `drop_pool.csv` — 掉落池

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| id | string | ✅ | 掉落池 ID |
| item_type | enum | ✅ | `gold` / `diamond` / `card_frag` / `equip` / `exp_potion` / `skill_book` / `star_stone` |
| item_id | string | ✅ | 具体道具/卡牌 ID |
| min_count | int | ✅ | 最小数量 |
| max_count | int | ✅ | 最大数量 |
| weight | int | ✅ | 权重 |
| guarantee | bool | | 是否必掉（Boss 关卡） |

### 3.12 `quest_def.csv` — 任务定义

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| id | string | ✅ | 任务 ID |
| name | string | ✅ | — |
| type | enum | ✅ | `daily` / `weekly` / `achievement` |
| condition_type | enum | ✅ | `clear_stage` / `draw_card` / `enhance_equip` / `star_up` / `pvp_win` / `login` / `spend_gold` |
| condition_param | string | | 条件参数（如关卡 ID） |
| target | int | ✅ | 目标值 |
| reward | json | ✅ | 奖励 `[{item_type, item_id, count}]` |
| reset_cycle | enum | | `daily` / `weekly` / `never` |
| sort_order | int | | 排序 |

### 3.13 `player_level.csv` — 等级经验

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| level | int | ✅ | 等级 |
| exp_required | int | ✅ | 升到下一级所需经验 |
| total_exp | int | ✅ | 累计经验 |
| stamina_max | int | | 该等级体力上限（如随等级提升） |
| unlock_feature | string | | 解锁功能（如"10级解锁爬塔"） |

### 3.14 `buff_def.csv` — 状态效果定义

> 战斗系统 6 大类状态效果的配置中心，技能通过 `buff_id` 引用。
> 结算顺序：沉默(屏蔽技能) → 眩晕(跳过行动) → 冰冻(跳过行动+破冰) → 其他
> DOT 统一在回合结束阶段结算，按施加顺序依次触发。

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| id | string | ✅ | 如 `freeze`、`poison_strong` |
| name | string | ✅ | 显示名 |
| category | enum | ✅ | `buff` / `debuff` / `control` / `dot` / `shield` / `special` |
| sub_type | enum | ✅ | 具体效果：`atk_up` / `atk_down` / `def_up` / `def_down` / `spd_up` / `spd_down` / `crit_up` / `stun` / `freeze` / `silence` / `taunt` / `poison` / `burn` / `bleed` / `shield_absorb` / `heal_over_time` / `revive` / `immune_damage` / `reflect` 等 |
| stat_modifier | string | | 属性修正（仅 buff/debuff 类），如 `{"atk":0.20}` 表示 ATK+20%，`{"spd":-0.15}` 表示 SPD-15% |
| dot_multiplier | float | | DoT 每回合伤害倍率（如 0.15 = 施法者 ATK/MATK 的 15%） |
| shield_ratio | float | | 护盾吸收比率（如 0.3 = 施法者最大 HP 的 30%） |
| default_duration | int | ✅ | 默认持续回合数（0 = 无回合限制，永久持续至被击破或特殊条件触发，适用于护盾类效果） |
| max_stack | int | ✅ | 最大叠加层数（1=不可叠加，刷新持续时间） |
| stack_behavior | enum | ✅ | `refresh`（刷新时间）/ `independent`（独立计时）/ `intensify`（层数加深效果） |
| dispellable | bool | ✅ | 是否可被净化/驱散 |
| vfx_id | string | | 对应特效 ID |
| priority | int | | 显示优先级（多个 buff 时的排序） |
| description | string | ✅ | 描述文本 |

#### 示例数据（6 条，覆盖 6 大类）

```csv
id,name,category,sub_type,stat_modifier,dot_multiplier,shield_ratio,default_duration,max_stack,stack_behavior,dispellable,vfx_id,priority,description
atk_war_cry,战吼鼓舞,buff,atk_up,"{""atk"":0.20}",,,,1,refresh,true,vfx_buff_atk,10,攻击力提升20%，持续3回合
freeze,冰冻禁锢,control,freeze,,,,,2,1,refresh,false,vfx_ctrl_freeze,20,冰冻目标1-2回合，跳过行动，受击+50%伤害后解冻
poison,剧毒侵蚀,dot,poison,,0.20,,3,3,intensify,true,vfx_dot_poison,5,每回合末损失施法者ATK×20%的HP，最多叠加3层
ice_shield,冰霜护盾,shield,shield_absorb,,,"{""shield_ratio"":0.30}",0,1,refresh,true,vfx_shield_ice,15,吸收施法者最大HP×30%的伤害，被击破或持续至战斗结束
atk_break,破甲诅咒,debuff,atk_down,"{""atk"":-0.15,""def"":-0.10}",,,2,1,refresh,true,vfx_debuff_break,8,攻击力降低15%、防御降低10%，持续2回合
revive,涅槃重生,special,revive,,,,,1,1,refresh,false,vfx_revive,30,阵亡时自动复活，恢复30%HP，每场战斗仅触发一次
```

#### 示例数据解读

**1. 战吼鼓舞（buff 类·增益）**

| 字段 | 值 | 解读 |
|---|---|---|
| category | `buff` | 正面增益 |
| sub_type | `atk_up` | 攻击力提升 |
| stat_modifier | `{"atk":0.20}` | ATK +20%（加算到面板） |
| max_stack=1, stack_behavior=`refresh` | 反复施加时刷新持续时间，不叠加 |
| dispellable=true | 可被净化/驱散 |

**2. 冰冻禁锢（control 类·硬控）**

| 字段 | 值 | 解读 |
|---|---|---|
| category | `control` | 控制效果 |
| sub_type | `freeze` | 冰冻 |
| default_duration=2 | 1-2 回合（实际由技能配置决定，此处为默认值） |
| max_stack=1, stack_behavior=`refresh` | 不叠加，刷新持续时间（combat-system.md 已决策） |
| dispellable=false | 硬控不可被净化 |
| **特殊规则**：受击时承受 +50% 伤害后解冻（由战斗引擎硬编码，非配置字段） |

**3. 剧毒侵蚀（dot 类·持续伤害）**

| 字段 | 值 | 解读 |
|---|---|---|
| category | `dot` | 持续伤害 |
| sub_type | `poison` | 中毒 |
| dot_multiplier=0.20 | 每回合末造成施法者 ATK × 20% 的伤害 |
| max_stack=3, stack_behavior=`intensify` | 可叠加 3 层，每层独立计算伤害（3 层 = 60% ATK） |
| dispellable=true | 可被净化清除全部层数 |

**4. 冰霜护盾（shield 类·护盾）**

| 字段 | 值 | 解读 |
|---|---|---|
| category | `shield` | 护盾 |
| sub_type | `shield_absorb` | 吸收伤害 |
| shield_ratio=0.30 | 吸收施法者最大 HP × 30% 的伤害 |
| default_duration=0 | 无持续回合限制，被击破前永久存在 |
| stack_behavior=`refresh` | 新护盾刷新旧护盾（不叠加吸收量） |
| **特殊规则**：护盾吸收不受防御减免，独立计算（combat-system.md 已决策） |

**5. 破甲诅咒（debuff 类·减益）**

| 字段 | 值 | 解读 |
|---|---|---|
| category | `debuff` | 负面减益 |
| sub_type | `atk_down` | 攻击力降低 |
| stat_modifier | `{"atk":-0.15,""def"":-0.10}` | ATK -15%、DEF -10%（双属性修正） |
| default_duration=2 | 持续 2 回合 |
| max_stack=1, stack_behavior=`refresh` | 不叠加，刷新覆盖 |

**6. 涅槃重生（special 类·特殊效果）**

| 字段 | 值 | 解读 |
|---|---|---|
| category | `special` | 特殊机制 |
| sub_type | `revive` | 复活 |
| default_duration=1 | 仅触发 1 次（实际由战斗引擎判定触发时机） |
| max_stack=1 | 不可叠加 |
| stack_behavior=`refresh` | 不适用（一次性触发） |
| dispellable=false | 不可驱散（防止通过净化消除复活效果） |
| **特殊规则**：恢复 30% HP（由战斗引擎硬编码，复活比例可在技能配置中覆盖） |

### 3.15 `global_const.csv` — 全局常量

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| key | string | ✅ | 如 `stamina_max_default` |
| value | string | ✅ | 如 `120` |
| type | enum | ✅ | `int` / `float` / `string` |
| description | string | | 中文说明 |

**战斗系统预设常量：**

| key | value | 说明 |
|---|---|---|
| `combat_def_curve_k` | `500` | 双曲线防御公式 K 值（500 DEF = 50% 减伤） |
| `combat_elem_advantage_dmg` | `0.25` | 元素克制增伤倍率 |
| `combat_elem_disadvantage_dmg` | `-0.15` | 元素被克制减伤倍率 |
| `combat_dmg_random_min` | `0.95` | 伤害随机浮动下限 |
| `combat_dmg_random_max` | `1.05` | 伤害随机浮动上限 |
| `combat_min_dmg` | `1` | 保底伤害 |
| `combat_rage_max` | `100` | 怒气上限 |
| `combat_rage_per_hit` | `20` | 每次普攻获得怒气 |
| `combat_rage_per_taken` | `10` | 每次受击获得怒气 |
| `combat_rage_per_kill` | `30` | 每次击杀获得怒气 |
| `combat_turn_timeout_s` | `30` | 半自动操作时限（秒） |
| `combat_max_turns` | `50` | 战斗回合上限 |
| `pvp_defender_hp_bonus` | `0.10` | PVP 防守方 HP 加成 |
| `pvp_win_streak_bonus_score` | `5` | PVP 连胜 5+ 额外积分 |

---

## 四、构建工具链建议

```
策划 Excel (.xlsx)
    │
    ▼ 导出脚本 (python/node)
CSV 文件
    │
    ▼ 生成工具 (node script)
├── config_schema.ts         （TypeScript 类型定义，客户端/服务端共用）
├── config_data.json         （运行时数据，服务端加载）
└── config_asset_bundle/     （Cocos Asset Bundle，客户端加载）
```

---

## 五、决策状态汇总

| # | 问题 | 决策 | 状态 |
|---|---|---|---|
| 1 | 面板分离 | ✅ card_def / enemy_def 均增加 base_matk / base_mdef 字段 | 已定 |
| 2 | 技能资源机制 | ✅ card_skill 中 `cooldown` 仅 ultimate 生效，`rage_cost` 仅 active 生效 | 已定 |
| 3 | 战斗常量 | ✅ K=500、克制+25%/-15%、怒气获取得分等统一定义于 global_const | 已定 |
| 4 | 状态效果 | ✅ 新增 buff_def 表，6 大类（buff/debuff/control/dot/shield/special） | 已定 |
| 5 | 配置表版本管理 | Git + 语义化版本号，Config Center 比对下发 | 待定 |
| 6 | Excel 导出工具 | Python pandas 脚本 或 SheetJS (Node) | 待定 |
| 7 | JSON 压缩 | 初期明文 JSON，后期按需 FlatBuffers | 待定 |
| 8 | 客户端配置加载策略 | 基础配置全量进 bundle，活动配置远程加载 | 待定 |
| 9 | 多语言支持 | name/description 支持 key 映射，多语言文件独立 | 待定 |

---
