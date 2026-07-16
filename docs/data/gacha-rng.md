# 抽卡保底算法与 RNG 实现方案

> 配套文档：`play.md`（抽卡养成章节）、`tech-stack.md`（服务端 Gacha 模块）
> 目标：定义卡牌抽卡的服务端权威随机数与保底机制，满足商业化合规（概率公示 + 可审计）

---

## 一、设计原则

1. **服务端权威**：所有稀有度判定在服务端完成，客户端只上报"抽卡动作"并接收结果，绝不下发随机数种子或概率权重。
2. **保底可追溯**：每个卡池为每位玩家维护独立保底计数器，落库可查，支持合规审计与客诉核查。
3. **概率透明**：前端公示概率来自配置中心，与服务端实际判定逻辑一致；保底触发后仍走同一判定函数，仅调整权重。
4. **可复现审计**：每次抽卡记录（时间、卡池、输入随机源、判定路径、产出）写入审计日志，可回放。

---

## 二、卡池与保底规则（源自 play.md）

| 卡池 | 消耗 | 保底规则 |
|---|---|---|
| 单抽 | 100 钻石 | 无保底 |
| 十连抽 | 900 钻石 | 10 连内必出稀有(R)以上 |
| 英雄召唤 | 5000 钻石 | 必出传说(Legendary) |
| 限时卡池 | 活动代币 | 概率 UP + 独立保底计数 |

补充设计（方案层建议）：
- **软保底（pity）**：每个卡池设 `pity_start`（如第 70 抽起）逐步提升传说概率，到 `pity_hard`（如第 90 抽）必出传说，避免长歪投诉。具体数值由配置表 `gacha_pool.csv` 控制。
- **新手破冰**：前 10 抽必出传说（play.md 已定），作为独立新手池，不与常驻池保底共享。
- **十连保底**：十连整体判定，若 10 次独立判定均未达 R，则第 10 抽强制提升为 R 以上（可配置为"十连第 10 抽必 R+"）。
- **保底继承**：限时池结束后保底计数是否继承到常驻池，由 `gacha_pool.csv` 中 `inherit_pool_id` 字段控制（不继承则该池结束时清零）。
- **碎片转化**：重复卡牌转化为碎片，不同稀有度转化数量不同（普通 ×5 / 稀有 ×15 / 史诗 ×30 / 传说 ×80），存入玩家资源。

---

## 三、RNG 实现

### 3.1 随机源
- 使用**加密级安全随机源**生成每次抽卡的随机种子片段，避免可预测：
  - Node.js：`crypto.randomBytes` / `crypto.randomInt(0, N)` 作为底层熵
  - 不直接用 `Math.random()`（非加密、可预测）
- 每次抽卡的种子 = `HMAC(seedMaster, playerId + poolId + drawCount + timestamp)`，保证不可预测且可审计但不回放。

### 3.2 判定流程（伪代码）
```
function drawOne(player, pool):
    counter = loadPity(player, pool)          // 从 PostgreSQL 读取该玩家该池保底计数
    roll = cryptoRandomInt(0, 10000) / 10000  // [0,1) 安全随机

    // 1) 硬保底优先
    if counter.hardPityReached():
        rarity = LEGENDARY
    // 2) 十连保底（由调用方在第十抽触发）
    else if pool.tenPullGuarantee && counter.inTenPull && counter.tenPullIndex == 9:
        rarity = max(rollRarity(roll, pool), RARE)
    // 3) 软保底概率提升
    else:
        boosted = applyPityBoost(roll, counter)   // 第70抽起概率线性提升
        rarity = rollRarity(boosted, pool)

    card = pickCardByRarity(rarity, pool)       // 同稀有度内按权重随机选具体卡
    counter.increment(rarity)
    savePity(player, pool, counter)             // 落库
    auditLog(player, pool, roll, rarity, card)  // 审计
    return card
```

### 3.3 权重与概率配置（数据驱动）
- 概率与保底参数全部来自配置表（如 `gacha_pool.csv` 和 `gacha_pool_card.csv`），字段：
  `pool_id, rarity, base_weight, ten_pull_min_rarity, pity_start, pity_hard, pity_boost_rate`
- 配置经 Config Center 下发前端用于**展示**，服务端判定读同一份服务端配置（双端同源防不一致）。
- 卡池内含卡牌权重按稀有度分层：先判定稀有度 → 再按 `weight` 从同稀有度卡牌中随机选取具体卡牌。
- 抽到的卡牌属性由 `card_def` 配置表定义（面板分离：HP/ATK/MATK/DEF/MDEF/SPD），详见 `config-tables.md §3.1`。

---

## 四、合规与审计

- **概率公示**：前端"概率说明"页读取配置中心公示字段，与实际判定一致。
- **审计日志表** `gacha_audit`：`id, player_id, pool_id, draw_index, seed_hash, roll_value, rarity, card_id, created_at`
- **客诉核查**：凭玩家 ID + 时间窗可还原每次抽卡判定路径。
- **保底重置**：限时池结束/赛季切换时按配置清空对应计数器。

---

## 五、接口协议（草案）

```
C→S: GachaDraw { pool_id, count(1|10), use_currency }
S→C: GachaResult {
  draws: [ { card_id, rarity, is_new, fragments_if_dup } ],
  pity_counter: { current, hard_pity_at },
  remaining_free: int
}
```

---

## 六、决策状态汇总

| # | 问题 | 决策 | 状态 |
|---|---|---|---|
| 1 | 随机源 | ✅ `crypto.randomBytes`，服务端权威，不下发种子 | 已定 |
| 2 | 新手池 | ✅ 前 10 抽必出传说，独立新手池，不与常驻共享保底 | 已定 |
| 3 | 十连保底 | ✅ 第 10 抽兜底稀有(R)以上 | 已定 |
| 4 | 碎片转化 | ✅ 按稀有度差异化（普通×5/稀有×15/史诗×30/传说×80） | 已定 |
| 5 | 保底继承 | 由 `gacha_pool.csv` 中 `inherit_pool_id` 配置控制 | 待定 |
| 6 | 软保底具体数值 | 需数值策划定（建议 pity_start=70, pity_hard=90） | 待定 |
| 7 | 抽卡动画时序 | 客户端先播保底提示再揭晓具体卡牌 | 待定 |

> 保底计数器落库表：`gacha_pity_counter`（data-model.md §3.8）
> 审计日志表：`gacha_audit`（data-model.md §3.9）
> 卡池配置：`gacha_pool.csv` + `gacha_pool_card.csv`（config-tables.md §3.8/3.9）
