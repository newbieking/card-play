# 数据模型 / 数据库设计

> 配套文档：`tech-stack.md`（PostgreSQL + Redis）、`battle-protocol.md`、`gacha-rng.md`、`progression-tables.md`
> 目标：定义核心数据表结构（ER 图 + 字段定义），作为服务端模块开发的数据库实现依据

---

## 一、数据库选型

| 存储 | 用途 | 选型 |
|---|---|---|
| 关系库 | 玩家档案、卡牌实例、订单、抽卡审计等需事务保证的永久数据 | PostgreSQL |
| 缓存 | 在线态、会话、排行榜、限时活动数据 | Redis |
| 对象存储 | 战斗录像、头像/自定义图片 | S3 / MinIO / COS |
| 消息队列 | 邮件发放、异步奖励、订单到账 | Redis Stream / BullMQ |

---

## 二、实体关系总览（ER 简图）

```
player_account (1) ──────< (N) card_instance      (玩家拥有的卡牌)
player_account (1) ──────< (N) equip_instance      (装备实例)
player_account (1) ──────< (N) team_formation      (阵容配置)
player_account (1) ──────< (N) adventure_progress   (冒险进度)
player_account (1) ──────< (N) tower_progress       (爬塔进度)
player_account (1) ──────< (N) gacha_pity_counter   (保底计数)
player_account (1) ──────< (N) quest_progress       (任务进度)
player_account (1) ──────< (N) order_record         (支付订单)

player_account (1) ─────── (1) player_resource      (玩家资源/钱包)
player_account (M) <─────> (N) guild               (公会成员)

gacha_audit (独立审计表)
battle_record (独立战斗记录表)
```

---

## 三、核心表设计

### 3.1 玩家账号 `player_account`

```sql
CREATE TABLE player_account (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    open_id         VARCHAR(128),                  -- 第三方平台 OpenID（微信/Apple/Google）
    platform        VARCHAR(32),                   -- 'wechat' / 'apple' / 'google' / 'guest'
    nick_name       VARCHAR(64) NOT NULL,
    avatar_url      VARCHAR(512),
    level           INT DEFAULT 1,
    exp             BIGINT DEFAULT 0,
    vip_level       INT DEFAULT 0,
    status          SMALLINT DEFAULT 0,            -- 0=正常 1=封禁 2=注销
    last_login_at   TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT now(),
    updated_at      TIMESTAMPTZ DEFAULT now()
);
```

### 3.2 玩家资源 `player_resource`

```sql
CREATE TABLE player_resource (
    player_id       UUID PRIMARY KEY REFERENCES player_account(id),
    gold            BIGINT DEFAULT 0,               -- 金币
    diamond_free    BIGINT DEFAULT 0,               -- 免费钻石
    diamond_paid    BIGINT DEFAULT 0,               -- 付费钻石（合规区分）
    stamina         INT DEFAULT 120,                -- 体力
    stamina_updated_at TIMESTAMPTZ,
    exp_potion      INT DEFAULT 0,                  -- 经验药水
    star_stone      INT DEFAULT 0,                  -- 升星石
    skill_book      INT DEFAULT 0,                  -- 技能书
    version         INT DEFAULT 1,                  -- 乐观锁版本号
    updated_at      TIMESTAMPTZ DEFAULT now()
);
```

**待澄清：** 区分 free/paid 钻石是否是合规必须？还是只需一个 diamond 字段？

---

### 3.3 卡牌实例 `card_instance`

> 卡牌实例存储「养成数据」；面板属性（HP/ATK/MATK/DEF/MDEF/SPD 等）由实例数据 + 配置表公式实时计算，不落库冗余。

```sql
CREATE TABLE card_instance (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id       UUID NOT NULL REFERENCES player_account(id),
    card_def_id     VARCHAR(64) NOT NULL,           -- 对应配置表 card_def 的 ID
    level           INT DEFAULT 1,                  -- 等级 1-100
    star            INT DEFAULT 1,                  -- 星级 1-10
    exp             BIGINT DEFAULT 0,               -- 当前等级经验
    quality_variant REAL DEFAULT 0,                 -- 个体值浮动 (-0.02 ~ +0.02)
    
    -- 技能等级（混合制：主动技能消耗怒气，终极技能走冷却制）
    skill_1_lv      INT DEFAULT 1,                  -- 主动技能等级（怒气驱动）
    skill_2_lv      INT DEFAULT 0,                  -- 被动技能等级（0=未解锁）
    skill_3_lv      INT DEFAULT 0,                  -- 终极技能等级（冷却驱动，0=未解锁）
    
    obtained_at     TIMESTAMPTZ DEFAULT now(),
    updated_at      TIMESTAMPTZ DEFAULT now(),
    
    INDEX idx_player_card (player_id, card_def_id)
);
```

**面板属性计算公式（运行时计算，不落库）：**

```
HP    = card_def.base_hp  × stat_growth(level) × star_multiplier(star) × (1 + quality_variant)
ATK   = card_def.base_atk × stat_growth(level) × star_multiplier(star) × (1 + quality_variant)
MATK  = card_def.base_matk × stat_growth(level) × star_multiplier(star) × (1 + quality_variant)
DEF   = card_def.base_def × stat_growth(level) × star_multiplier(star) × (1 + quality_variant)
MDEF  = card_def.base_mdef × stat_growth(level) × star_multiplier(star) × (1 + quality_variant)
SPD   = card_def.base_spd × star_multiplier(star)
战力   = (HP×0.5 + ATK + MATK + DEF×0.8 + MDEF×0.8) × (1 + SPD×0.01)
```

其中 `stat_growth` 来自 `card_stat_growth` 配置表，`star_multiplier` 来自 `card_star_up` 配置表。

### 3.4 装备实例 `equip_instance`

```sql
CREATE TABLE equip_instance (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id       UUID NOT NULL REFERENCES player_account(id),
    card_instance_id UUID REFERENCES card_instance(id), -- NULL=未装备
    equip_def_id    VARCHAR(64) NOT NULL,            -- 配置表 equip_def ID
    slot            VARCHAR(16),                     -- weapon/armor/accessory
    enhance_level   INT DEFAULT 0,                   -- 强化 +0 ~ +15
    refine_attr1    VARCHAR(32),                     -- 精炼随机属性1
    refine_attr2    VARCHAR(32),                     -- 精炼随机属性2
    
    obtained_at     TIMESTAMPTZ DEFAULT now(),
    updated_at      TIMESTAMPTZ DEFAULT now(),
    
    INDEX idx_player_equip (player_id)
);
```

### 3.5 阵容配置 `team_formation`

> 统一 5 张卡牌，2 前 3 后阵型。全模式（冒险/爬塔/PVP）一致。

```sql
CREATE TABLE team_formation (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id       UUID NOT NULL REFERENCES player_account(id),
    name            VARCHAR(64),                     -- 阵容名称
    positions       JSONB NOT NULL,                  -- [{pos:0..4, card_instance_id, row:"front"/"back"}, ...]
                                                     -- pos 0,1=前排, pos 2,3,4=后排
    total_power     INT DEFAULT 0,                   -- 阵容总战力（保存时计算快照）
    is_default      BOOLEAN DEFAULT false,
    type            VARCHAR(16),                     -- 'adventure' / 'tower' / 'pvp_defense'
    
    created_at      TIMESTAMPTZ DEFAULT now(),
    updated_at      TIMESTAMPTZ DEFAULT now(),
    
    INDEX idx_player_formation (player_id, type)
);
```

---

### 3.6 冒险进度 `adventure_progress`

```sql
CREATE TABLE adventure_progress (
    player_id       UUID NOT NULL REFERENCES player_account(id),
    chapter_id      VARCHAR(32) NOT NULL,
    stage_id        VARCHAR(32) NOT NULL,
    stars           INT DEFAULT 0,                  -- 最高星级
    cleared         BOOLEAN DEFAULT false,
    first_clear_at  TIMESTAMPTZ,
    last_clear_at   TIMESTAMPTZ,
    
    PRIMARY KEY (player_id, stage_id)
);
```

### 3.7 爬塔进度 `tower_progress`

```sql
CREATE TABLE tower_progress (
    player_id       UUID PRIMARY KEY REFERENCES player_account(id),
    max_floor       INT DEFAULT 0,                  -- 历史最高层
    current_floor   INT DEFAULT 1,                  -- 当前所在层
    daily_refreshes INT DEFAULT 3,                  -- 今日剩余刷新次数
    refresh_date    DATE,                            -- 刷新记录日期（重置用）
    buff_selections JSONB,                          -- [{floor:5, buff_id}, ...]
    
    updated_at      TIMESTAMPTZ DEFAULT now()
);
```

---

### 3.8 抽卡保底计数器 `gacha_pity_counter`

```sql
CREATE TABLE gacha_pity_counter (
    player_id       UUID NOT NULL REFERENCES player_account(id),
    pool_id         VARCHAR(32) NOT NULL,            -- 卡池 ID
    total_draws     INT DEFAULT 0,                  -- 该池总抽数
    since_last_legendary INT DEFAULT 0,             -- 距上次传说抽数（软保底用）
    since_last_rare INT DEFAULT 0,                  -- 距上次稀有及以上
    ten_pull_index  INT DEFAULT 0,                  -- 当前十连内位置（0-9）
    guaranteed_legendary BOOLEAN DEFAULT false,     -- 是否已触发硬保底
    
    PRIMARY KEY (player_id, pool_id)
);
```

### 3.9 抽卡审计日志 `gacha_audit`

```sql
CREATE TABLE gacha_audit (
    id              BIGSERIAL PRIMARY KEY,
    player_id       UUID NOT NULL,
    pool_id         VARCHAR(32) NOT NULL,
    draw_index      INT,                            -- 该池第几次
    seed_hash       VARCHAR(128),                   -- 随机种子哈希
    roll_value      DOUBLE PRECISION,               -- 随机值
    rarity          VARCHAR(16),                    -- 判定稀有度
    card_def_id     VARCHAR(64),                    -- 产出卡牌定义ID
    is_new          BOOLEAN,
    pity_before     JSONB,                          -- 抽前保底状态（审计用）
    created_at      TIMESTAMPTZ DEFAULT now(),
    
    INDEX idx_audit_player_time (player_id, created_at DESC)
);
```

---

### 3.10 战斗记录 `battle_record`

```sql
CREATE TABLE battle_record (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id       UUID NOT NULL,
    battle_type     VARCHAR(16),                    -- 'adventure'/'tower'/'pvp'
    stage_id        VARCHAR(64),                    -- 关卡/对手
    seed            BIGINT,
    result          VARCHAR(16),                    -- 'win'/'lose'/'draw'
    player_formation JSONB,                         -- 己方阵容快照（含每卡面板属性）
    enemy_formation  JSONB,                         -- 敌方阵容快照
    player_power    INT,                            -- 己方阵容战力（快照）
    enemy_power     INT,                            -- 敌方阵容战力（快照，PVP 时有效）
    frame_count     INT,                            -- 总帧数
    replay_url      VARCHAR(512),                   -- 录像存储地址（对象存储）
    created_at      TIMESTAMPTZ DEFAULT now(),
    
    INDEX idx_battle_player_time (player_id, created_at DESC)
);
```

---

### 3.11 PVP 竞技场数据 `arena_data`

> 匹配按**阵容战力**（±5%~20%），升段按**段位积分**（Score），两者独立运作。
> 战力决定"和谁打"，积分决定"排第几"。

```sql
CREATE TABLE arena_data (
    player_id       UUID PRIMARY KEY REFERENCES player_account(id),
    score           INT DEFAULT 1000,               -- 段位积分（升段/降段依据）
    tier            VARCHAR(16) DEFAULT 'bronze',    -- 段位（青铜/白银/黄金/铂金/钻石/大师/传说）
    defense_power   INT DEFAULT 0,                  -- 防守阵容战力（快照，用于匹配）
    wins            INT DEFAULT 0,
    losses          INT DEFAULT 0,
    win_streak      INT DEFAULT 0,                  -- 连胜计数（5+ 额外 +5 积分/场）
    season_id       INT,
    season_score    INT DEFAULT 1000,               -- 赛季初始积分
    defense_snapshot JSONB,                         -- 防守阵容快照 [{card_instance_id, card_def_id, level, star, ...}]
    
    updated_at      TIMESTAMPTZ DEFAULT now()
);
```

**匹配流程：** 攻击方阵容战力 → 搜索 `defense_power` ±5%~20% 的玩家 → 加载 `defense_snapshot` 战斗。

### 3.12 任务进度 `quest_progress`

```sql
CREATE TABLE quest_progress (
    player_id       UUID NOT NULL,
    quest_id        VARCHAR(32) NOT NULL,
    quest_type      VARCHAR(16),                    -- 'daily' / 'weekly' / 'achievement'
    progress        INT DEFAULT 0,                  -- 当前进度
    target          INT,                            -- 目标值
    completed       BOOLEAN DEFAULT false,
    claimed         BOOLEAN DEFAULT false,          -- 是否已领取奖励
    reset_date      DATE,                           -- 重置日期
    completed_at    TIMESTAMPTZ,
    
    PRIMARY KEY (player_id, quest_id, reset_date)
);
```

### 3.13 支付订单 `order_record`

```sql
CREATE TABLE order_record (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id       UUID NOT NULL,
    product_id      VARCHAR(64),                    -- 商品 ID
    amount          INT,                            -- 金额（分）
    currency        VARCHAR(8) DEFAULT 'CNY',
    platform        VARCHAR(16),                    -- 'apple'/'google'/'wechat'
    platform_order_id VARCHAR(128),                 -- 平台订单号
    status          VARCHAR(16) DEFAULT 'pending',  -- pending/paid/delivered/refunded
    receipt         TEXT,                           -- 平台回执（验签用）
    created_at      TIMESTAMPTZ DEFAULT now(),
    paid_at         TIMESTAMPTZ,
    
    UNIQUE (platform_order_id),
    INDEX idx_order_player (player_id, created_at DESC)
);
```

### 3.14 公会 `guild` + `guild_member`

```sql
CREATE TABLE guild (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(64) NOT NULL UNIQUE,
    leader_id       UUID NOT NULL,
    level           INT DEFAULT 1,
    contribution    BIGINT DEFAULT 0,
    member_count    INT DEFAULT 1,
    max_members     INT DEFAULT 30,
    created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE guild_member (
    guild_id        UUID NOT NULL REFERENCES guild(id),
    player_id       UUID NOT NULL REFERENCES player_account(id),
    role            VARCHAR(16) DEFAULT 'member',   -- 'leader'/'officer'/'member'
    contribution    BIGINT DEFAULT 0,
    joined_at       TIMESTAMPTZ DEFAULT now(),
    
    PRIMARY KEY (guild_id, player_id)
);
```

---

## 四、Redis 数据结构

| Key Pattern | 类型 | 用途 |
|---|---|---|
| `session:{token}` | String | 玩家在线会话 |
| `player:{id}:online` | String | 在线状态 |
| `arena:rank:season:{id}` | Sorted Set | 竞技场段位积分排行榜（按 score） |
| `arena:match:pool` | Sorted Set | PVP 匹配池（按 defense_power），快速范围查询 |
| `tower:rank:global` | Sorted Set | 爬塔全球排行榜 |
| `tower:rank:friends:{playerId}` | Sorted Set | 好友爬塔榜 |
| `guild:{id}:boss:hp` | String | 公会 Boss 血量 |
| `activity:{id}:counter` | String | 活动计数 |
| `rate_limit:{playerId}:{action}` | String | 限流计数器 |
| `config:version` | String | 配置版本号 |

---

## 五、决策状态汇总

| # | 问题 | 决策 | 状态 |
|---|---|---|---|
| 1 | free/paid 钻石拆分 | ✅ 拆分（国内合规要求，免费钻石先消耗） | 已定 |
| 2 | 卡牌属性存储策略 | ✅ 仅存养成数据（等级/星级/技能等级），面板属性运行时计算 | 已定 |
| 3 | PVP 匹配机制 | ✅ 按防守阵容战力匹配（见 arena_data），积分独立运作 | 已定 |
| 4 | 阵型规范 | ✅ 统一 5 卡 2 前 3 后，positions JSONB 固定 5 槽位 | 已定 |
| 5 | 战斗录像存储 | 对象存储 + DB 记录 URL | 待定 |
| 6 | 好友关系表 | 需要，待补充 `friend_relation` 表 | 待定 |
| 7 | 分表/分库预留 | 初期单库，按 player_id hash 预留分表 | 待定 |
| 8 | 软删除 vs 硬删除 | 关键数据（账号/订单）用软删除 `deleted_at` | 待定 |

---
