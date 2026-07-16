# 战斗确定性帧指令协议方案

> 配套文档：`combat-system.md`（伤害公式、混合技能资源、6 元素克制）、`play.md`（自动/半自动回合制战斗）、`tech-stack.md`（服务端 Battle 校验模块）
> 目标：定义客户端与服务端之间"确定性战斗"的指令帧协议，使服务端能独立重演并校验战斗结果，防篡改

---

## 一、核心思想

自动/半自动回合制战斗采用**指令驱动 + 服务端权威重演**：

1. 玩家在客户端部署阵容、触发主动/终极技能（半自动）。
2. 客户端将"**阵容快照 + 玩家操作指令序列**"提交服务端。
3. 服务端以**确定性战斗引擎**（同种子、同逻辑）重演每一帧，输出权威伤害/胜负。
4. 客户端仅负责演出，上报结果与服务端比对，不一致以服务端为准。

关键：战斗逻辑必须**确定性**——相同输入（阵容 + 指令 + 种子）在任何端得到相同输出，因此战斗引擎代码客户端/服务端共用一份 TS 实现。

---

## 二、战斗帧模型

> 混合技能资源：主动技能（slot 1）消耗怒气，终极技能（slot 3）走冷却制。
> 战力公式：`(HP×0.5 + ATK + MATK + DEF×0.8 + MDEF×0.8) × (1 + SPD×0.01)`

```
Battle = {
  battle_id,
  seed,                 // 服务端下发的战斗随机种子（仅用于表现层随机，如暴击浮动区间）
  rng_salt,             // 服务端权威判定用盐，不下发客户端
  turn_frame[]          // 按回合排列的帧序列
}

TurnState = {
  rage: int,            // 怒气值（0-100），仅玩家侧需要关注
  cooldowns: { skill_id: turns_left }  // 终极技能冷却倒计时，仅玩家侧需要关注
}

Frame(turn N) = {
  actor_side,           // 0=玩家 1=敌方
  actions[]: Action,    // 该回合内的动作序列
  turn_state?: TurnState // 该回合开始时的资源状态（客户端演出用，不含 rng_salt）
}

Action = {
  type,                 // 'attack' | 'skill' | 'ultimate' | 'passive_trigger' | 'buff_tick' | 'dot_tick'
  source_id,
  target_ids[],
  skill_id?,            // 技能树技能 ID（从 card_skill 表读取）
  damage_type?,         // 'physical' | 'magical' — 由技能定义决定走 DEF 还是 MDEF 减伤线
  // 数值不在此写，由服务端引擎根据技能配置 + 双曲线伤害公式重算
}
```

**关键参数（来自 `global_const` 配置表）：**

| 参数 | 值 | 说明 |
|---|---|---|
| `combat_def_curve_k` | 500 | 减伤率 = DEF / (DEF + 500) |
| `combat_elem_advantage_dmg` | +25% | 元素克制增伤 |
| `combat_elem_disadvantage_dmg` | -15% | 被克制减伤 |
| `combat_rage_max` | 100 | 怒气上限 |
| `combat_rage_per_hit` | +20 | 普攻产怒 |
| `combat_rage_per_taken` | +10 | 受击产怒 |
| `combat_rage_per_kill` | +30 | 击杀产怒 |
| `combat_turn_timeout_s` | 30 | 半自动操作时限 |

---

## 三、指令协议（草案）

### 3.1 开局：提交阵容

```
C→S: BattleStart {
  stage_id,                 // 冒险关卡 / 爬塔层 / 竞技对手
  formation: [             // 玩家部署的 5 张卡牌（2 前排 + 3 后排）
    { card_instance_id, row: 'front'|'back' }
  ],
  assist_ids?: [],          // 好友助战（可选）
  team_buffs?: []           // 爬塔命运选择获得的 buff
}
S→C: BattleInit {
  battle_id,
  enemy_formation,          // 服务端按关卡配置生成
  seed,                     // 表现层随机种子
  first_turn,               // 先手方（SPD 高的一方优先，相同时玩家先手）
  player_power,             // 己方阵容战力（计算值，用于 PVP 显示）
  enemy_power               // 敌方阵容战力（计算值，用于 PVP 显示）
}
```

### 3.2 进行中：玩家操作指令（半自动）

```
C→S: BattleAction {
  battle_id,
  turn,
  action: Action            // 玩家本回合触发的技能/终极技
}
```

**混合资源机制下的 Action 规则：**

| 操作类型 | 资源机制 | 客户端可发 Action | 服务端校验 |
|---|---|---|---|
| 普攻 | 无消耗 | 不发 Action（自动） | 自动执行，产怒 +20 |
| 主动技能（slot 1） | 怒气制 | ✅ 可发 Action | 检查 `rage >= rage_cost`，扣减怒气 |
| 终极技能（slot 3） | 冷却制 | ✅ 可发 Action | 检查 `cooldown == 0`，进入冷却 |
| 被动技能（slot 2） | 自动触发 | 不发 Action | 引擎按条件自动触发 |

- 自动战斗：玩家不发送 Action，服务端 AI 用同一份引擎逻辑自动生成。
- 半自动：玩家在操作时限内发送主动/终极技能 Action，超时则由服务端代填默认行动（普攻）。
- **怒气不下发客户端**：客户端仅展示 UI，怒气值由服务端权威维护，最终在 BattleResult 中返回。

### 3.3 结算：服务端权威结果
```
S→C: BattleResult {
  battle_id,
  frames: Frame[],          // 完整帧序列（供客户端逐帧演出/回放）
  final_state: { win: bool, player_hp[], enemy_hp[] },
  rewards: {...}            // 掉落（服务端算，客户端仅展示）
}
```

---

## 四、服务端校验逻辑

```
function resolveBattle(startReq):
    engine = new BattleEngine(seed, rng_salt)   // 服务端构造
    engine.loadFormation(startReq.formation, enemyOf(startReq.stage_id))
    for each turn:
        for each unit (按 SPD 排序):
            if unit.is_player_controlled AND player_sends_action:
                validateAction(action, unit)    // 校验资源消耗
                engine.apply(action)
            else:
                engine.apply(aiAutoAction(unit))
        engine.tickBuffs()                      // 结算 DoT/HoT/Buff tick
        engine.tickCooldowns()                  // 冷却回合 -1
    result = engine.finalState()
    if client submitted result AND differs: reject & use server result
    persist(result, rewards)
    return BattleResult(frames, result, rewards)
```

**Action 校验细节：**

```
function validateAction(action, unit):
    skill = configTable.getSkill(action.skill_id)
    if skill.type == 'active':
        require unit.rage >= skill.rage_cost, 'rage_insufficient'
        unit.rage -= skill.rage_cost
    else if skill.type == 'ultimate':
        require unit.cooldowns[action.skill_id] == 0, 'cooldown_not_ready'
        unit.cooldowns[action.skill_id] = skill.cooldown
    // passive/buff_tick/dot_tick 不需要客户端 Action
```

**伤害计算细节（双曲线公式）：**

```
function calcDamage(attacker, defender, skill):
    if skill.damage_type == 'physical':
        atk_stat = attacker.atk      // 面板分离：物理攻击
        def_stat = defender.def      // 面板分离：物理防御
    else: // magical
        atk_stat = attacker.matk     // 面板分离：法术强度
        def_stat = defender.mdef     // 面板分离：法术抗性

    base_dmg = atk_stat × skill.damage_multiplier

    // 元素克制（6 元素循环：火→冰→雷→水→火，光⇄暗互克，自然中立）
    elem_mod = getElemModifier(attacker.element, defender.element)

    // 双曲线防御减伤（K=500）
    dmg_reduction = def_stat / (def_stat + 500)

    final_dmg = base_dmg × (1 + elem_mod) × (1 - dmg_reduction)

    // 暴击判定
    if roll < attacker.crit_rate:
        final_dmg *= attacker.crit_dmg

    // 浮动 ±5%
    final_dmg *= random(0.95, 1.05)
    final_dmg = max(ceil(final_dmg), 1)   // 保底 1 点
    return final_dmg
```

防篡改要点：
- 伤害/暴击/掉落**全部服务端算**，客户端帧仅用于演出。
- `rng_salt` 不下发，玩家无法预知/操控判定。
- 怒气值由服务端维护，不信任客户端上报的怒气状态。
- 若客户端上报 `win=true` 但服务端算 `win=false`，以服务端为准并记日志（疑似作弊）。

---

## 五、确定性保障

| 风险点 | 措施 |
|---|---|
| 浮点不一致 | 战斗数值用定点数/整数运算，避免跨端浮点误差 |
| 随机不一致 | 表现随机（暴击抖动）用 `seed`，判定随机用 `rng_salt`，二者分离 |
| 配置不一致 | 技能/卡牌数值读同一份服务端配置表，热更同源 |
| 时序不一致 | 帧按 turn 严格排序，Action 不能为空（超时服务端代填） |

---

## 六、决策状态汇总

| # | 问题 | 决策 | 状态 |
|---|---|---|---|
| 1 | 战斗模式 | ✅ 异步战报 + 服务端权威重演（见 `pvp-arena.md`） | 已定 |
| 2 | 技能资源机制 | ✅ 混合制：主动技能（slot 1）= 怒气制，终极技能（slot 3）= 冷却制 | 已定 |
| 3 | 伤害公式 | ✅ 双曲线 K=500，面板分离（物理走 ATK+DEF，法术走 MATK+MDEF） | 已定 |
| 4 | 元素克制 | ✅ 6 元素（火→冰→雷→水→火，光⇄暗互克，自然中立），克制 +25%/-15% | 已定 |
| 5 | 出场人数 | ✅ 统一 5 张，2 前排 + 3 后排 | 已定 |
| 6 | 战力快照 | ✅ BattleInit 包含 player_power / enemy_power | 已定 |
| 7 | 战斗引擎共用打包 | 待定（Git submodule / npm 私有包 / monorepo） | 待定 |
| 8 | 战斗录像存储 | 对象存储 + 压缩帧 | 待定 |
