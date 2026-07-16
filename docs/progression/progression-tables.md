# 养成系统数值表细化 — 升星系统

> 配套文档：`play.md`（6.3 卡牌升星章节，已给出冰霜女王升星阶梯）、`tech-stack.md`（养成数值数据驱动）
> 目标：将"卡牌升星"从文字描述落地为可配置的数值表 schema，作为其他养成系统（技能/装备）的模板
> 说明：本表以"升星系统"为例细化（play.md 数据最完整）；技能升级、装备强化可沿用同一套配置表范式

---

## 一、升星核心规则（源自 play.md）

- 星级范围：1★ → 5★（传说卡可达 10★）
- 每星提升基础属性 **15%-20%**
- 升星消耗：同名卡碎片 + 升星材料 + 金币
- 每 3 星需通关特定副本/世界 Boss 解锁突破资格
- 视觉变化：升星后外观改变（光效/边框/传说觉醒）

冰霜女王（传说）阶梯示例：
```
1★→2★：10 碎片 + 5000 金币          ✅ 解锁技能 Lv2
2★→3★：20 碎片 + 15000 金币         ✅ 解锁被动技能
3★→4★：30 碎片 + 50000 金币 + 突破副本 ✅ 外观变化
4★→5★：50 碎片 + 150000 金币        ✅ 解锁终极技能
5★→6★：80 碎片 + 500000 金币 + 世界Boss ✅ 边框变色
...
10★  ：500 碎片 + 10000000 金币      ✅ 传说形态觉醒
```

---

## 二、配置表 Schema（CSV/JSON，数据驱动）

### 2.1 升星消耗表 `card_star_up.csv`
| 字段 | 类型 | 说明 |
|---|---|---|
| card_rarity | enum | common/rare/epic/legendary |
| from_star | int | 起始星 (1-9) |
| to_star | int | 目标星 (2-10) |
| frag_cost | int | 同名卡碎片消耗 |
| gold_cost | int | 金币消耗 |
| star_stone_cost | int | 升星石消耗（高层养成） |
| breakthrough_req | string? | 突破条件：`stage:xxx` / `world_boss:yyy` / 空 |
| unlock_skill | string? | 升星解锁的技能槽：`skill_lv2` / `passive` / `ultimate` |
| visual_change | enum | none/border/appearance/awaken |

示例行（传说冰霜女王）：
```
legendary,1,2,10,5000,0,,skill_lv2,none
legendary,2,3,20,15000,0,,passive,none
legendary,3,4,30,50000,0,stage:frost_abyss,,"appearance"
legendary,4,5,50,150000,0,,ultimate,none
legendary,5,6,80,500000,5,world_boss:frost_queen,border,none
...
legendary,9,10,500,10000000,50,,awaken,none
```

### 2.2 属性成长表 `card_stat_growth.csv`

> 采用面板分离设计（ATK/MATK/DEF/MDEF），五维属性各有独立基础值。

| 字段 | 说明 |
|---|---|
| card_rarity | 稀有度 |
| per_star_pct_min | 每星属性提升下限（0.15） |
| per_star_pct_max | 每星属性提升上限（0.20） |
| base_hp | 1★ 基础 HP（按卡牌实例） |
| base_atk | 1★ 基础物理攻击 |
| base_matk | 1★ 基础法术强度（法系职业高，物理职业低或 0） |
| base_def | 1★ 基础物理防御 |
| base_mdef | 1★ 基础法术抗性 |

**属性计算公式：**
```
HP    = base_hp   × (1 + per_star_pct × (star-1)) × level_growth × (1 + quality_variant)
ATK   = base_atk  × (1 + per_star_pct × (star-1)) × level_growth × (1 + quality_variant)
MATK  = base_matk × (1 + per_star_pct × (star-1)) × level_growth × (1 + quality_variant)
DEF   = base_def  × (1 + per_star_pct × (star-1)) × level_growth × (1 + quality_variant)
MDEF  = base_mdef × (1 + per_star_pct × (star-1)) × level_growth × (1 + quality_variant)
```

`per_star_pct` 在 min~max 间按卡牌个体微调（`quality_variant` 存卡牌实例）。
`level_growth` 来自 `player_level` 配置表的等级经验系数。

**面板分配原则：** 战士侧重 ATK+DEF、法师侧重 MATK+MDEF、射手侧重 ATK+SPD、辅助均衡。

### 2.3 突破资格表 `breakthrough_req.csv`
| 字段 | 说明 |
|---|---|
| req_id | stage:frost_abyss / world_boss:frost_queen |
| type | stage / world_boss / pvp_rank |
| target_id | 对应关卡/Boss/排名阈值 |
| desc | 前端展示文案 |

---

## 三、与服务端接口映射（tech-stack.md Card 模块）

```
C→S: CardStarUp { card_instance_id, target_star }
S→C: StarUpResult {
  success,
  consumed: { frag, gold, star_stone },
  new_stat: { hp, atk, matk, def, mdef },  // 面板分离
  unlocked: [ skill slots ],
  visual_change
}
```
- 服务端校验：碎片/金币/突破资格是否齐全 → 扣减（经济服务原子接口）→ 更新卡牌实例星级与属性 → 写解锁技能 → 返回。
- 战力同步：升星后重新计算阵容战力，更新 PVP 防守快照 `defense_power`。

---

## 四、数值平衡建议（方案层）

- **曲线校验**：用 `card_stat_growth` 模拟 1★→10★ 总属性倍率 ≈ `(1.15~1.20)^9 ≈ 3.5~5.2×`，需与装备/技能加成叠加后对齐战斗数值（见 battle-protocol.md 引擎）。
- **资源门槛**：升星金币从 5k 到 1000万，呈指数级，配合 play.md 经济系统（冒险/爬塔产出）校验可获得性，避免卡死或通胀。
- **突破瓶颈**：每 3 星强制副本/Boss，制造长线目标与付费点（加速材料）。

---

## 五、范式复用

本配置表范式可直接套用到：
- **技能升级**：`skill_level_up.csv`（skill_id, lv, book_cost, gold_cost, unlock_at_star）
- **装备强化**：`equip_enhance.csv`（equip_type, +level, gold_cost, mat_cost, fail_rate, protect_req）

---

## 六、待深化项
- 具体 base_hp/atk/matk/def/mdef 五维基础值（需数值策划按职业平衡）
- 升星石在 5★ 后的引入节奏（爬塔/活动产出匹配）
- 重复卡转化的碎片数量规则（普通/稀有/史诗/传说差异化）
- 升星失败机制：高星（8★→10★）是否引入失败概率或降星风险
