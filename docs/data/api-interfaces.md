# API 接口清单与消息格式

> 配套文档：`tech-stack.md`（通信协议选型）、`battle-protocol.md`（战斗帧协议）、`data-model.md`（数据库表）
> 目标：定义客户端与服务端所有 API 接口的请求/响应格式，作为前后端联调的契约

---

## 一、通信架构

```
客户端
  │
  ├─ HTTP/HTTPS ──→ 网关 Gateway ──→ 逻辑服 Logic（Account/Profile/Config/Economy/Gacha/Quest）
  │                 (RESTful API)       ↓
  │                                  PostgreSQL + Redis
  │
  └─ WebSocket ───→ 网关 Gateway ──→ 逻辑服 Logic（Battle/Arena）
                    (长连接/帧同步)     ↓
                                     BattleEngine（确定性引擎）
```

| 协议 | 用途 | 特点 |
|---|---|---|
| HTTP | 登录、档案、配置、商城、抽卡、任务、好友、公会、邮件 | 无状态，RESTful，请求-响应模式 |
| WebSocket | 战斗（帧指令）、PVP 匹配、实时通知（被攻击/邮件到达） | 有状态长连接，双向通信 |

---

## 二、通用消息格式

### 2.1 HTTP 请求/响应格式

**请求：**
```
POST /api/v1/{module}/{action}
Headers:
  Authorization: Bearer {token}
  X-Player-Id: {player_id}
  X-Config-Version: {config_version}
Body: JSON
```

**成功响应：**
```json
{
  "code": 0,
  "msg": "ok",
  "data": { ... }
}
```

**错误响应：**
```json
{
  "code": 1001,
  "msg": "stamina_not_enough",
  "data": null
}
```

### 2.2 WebSocket 消息格式

**客户端 → 服务端：**
```json
{
  "type": "BattleAction",
  "req_id": "uuid-v4",
  "payload": { ... }
}
```

**服务端 → 客户端：**
```json
{
  "type": "BattleResult",
  "req_id": "uuid-v4",
  "payload": { ... }
}
```

### 2.3 服务端推送（WebSocket）

```json
{
  "type": "Notification",
  "payload": {
    "category": "pvp_attacked" | "mail_received" | "guild_invite" | "config_updated",
    "data": { ... }
  }
}
```

---

## 三、M1 阶段接口清单（地基）

### 3.1 账号模块 Account（HTTP）

| 接口 | 方法 | 路径 | 说明 |
|---|---|---|---|
| 游客登录 | POST | `/api/v1/account/guest_login` | 返回临时 token + player_id |
| 第三方绑定 | POST | `/api/v1/account/bind_platform` | 绑定微信/Apple/Google |
| 刷新 Token | POST | `/api/v1/account/refresh_token` | Token 过期前刷新 |

**guest_login 请求：**
```json
{
  "device_id": "设备唯一标识",
  "platform": "guest",
  "client_version": "1.0.0"
}
```

**guest_login 响应：**
```json
{
  "code": 0,
  "data": {
    "token": "jwt-token-string",
    "player_id": "uuid",
    "is_new_player": true,
    "server_time": 1721000000000
  }
}
```

### 3.2 玩家档案模块 Profile（HTTP）

| 接口 | 方法 | 路径 | 说明 |
|---|---|---|---|
| 获取档案 | GET | `/api/v1/profile` | 玩家基本信息 + 资源 |
| 更新昵称 | POST | `/api/v1/profile/update_nickname` | 修改昵称 |
| 获取背包 | GET | `/api/v1/profile/inventory` | 卡牌列表 + 装备列表 |

**获取档案响应：**
```json
{
  "code": 0,
  "data": {
    "player_id": "uuid",
    "nick_name": "玩家昵称",
    "avatar_url": "https://...",
    "level": 15,
    "exp": 12500,
    "vip_level": 3,
    "resource": {
      "gold": 50000,
      "diamond_free": 200,
      "diamond_paid": 100,
      "stamina": 80,
      "stamina_max": 120,
      "stamina_recovery_at": 1721000600000,
      "exp_potion": 10,
      "star_stone": 5,
      "skill_book": 8
    }
  }
}
```

**获取卡牌列表响应：**
```json
{
  "code": 0,
  "data": {
    "cards": [
      {
        "id": "card-instance-uuid",
        "card_def_id": "frost_queen",
        "level": 25,
        "star": 3,
        "exp": 1200,
        "quality_variant": 0.015,
        "skill_1_lv": 2,
        "skill_2_lv": 1,
        "skill_3_lv": 0,
        "computed_power": 3520
      }
    ],
    "total_count": 42
  }
}
```

### 3.3 配置同步模块 Config（HTTP）

| 接口 | 方法 | 路径 | 说明 |
|---|---|---|---|
| 获取版本 | GET | `/api/v1/config/version` | 返回最新配置版本号 |
| 下载配置 | GET | `/api/v1/config/download?version={v}` | 下载指定版本的配置 JSON |

**获取版本响应：**
```json
{
  "code": 0,
  "data": {
    "latest_version": "2024.07.15.001",
    "min_required_version": "2024.07.01.000",
    "force_update": false,
    "download_url": "https://cdn.example.com/config/2024.07.15.001.json"
  }
}
```

### 3.4 卡牌管理模块 Card（HTTP）

| 接口 | 方法 | 路径 | 说明 |
|---|---|---|---|
| 升星 | POST | `/api/v1/card/star_up` | 卡牌升星 |
| 技能升级 | POST | `/api/v1/card/skill_level_up` | 升级技能 |
| 装备强化 | POST | `/api/v1/card/equip_enhance` | 强化装备 |
| 装备精炼 | POST | `/api/v1/card/equip_refine` | 精炼装备 |
| 设置阵容 | POST | `/api/v1/card/set_formation` | 保存阵容配置 |
| 获取阵容 | GET | `/api/v1/card/formation` | 获取当前阵容 |

**升星请求：**
```json
{
  "card_instance_id": "card-instance-uuid",
  "target_star": 4
}
```

**升星响应：**
```json
{
  "code": 0,
  "data": {
    "success": true,
    "new_star": 4,
    "consumed": {
      "fragments": 30,
      "gold": 50000,
      "star_stone": 0
    },
    "new_stat": {
      "hp": 2800,
      "atk": 420,
      "matk": 380,
      "def": 210,
      "mdef": 190,
      "spd": 85
    },
    "unlocked_skills": ["passive"],
    "visual_change": "appearance",
    "new_power": 4200
  }
}
```

### 3.5 战斗模块 Battle（WebSocket）

> 详见 `battle-protocol.md`（帧指令协议），此处仅列出 M1 需要的接口

| 消息类型 | 方向 | 说明 |
|---|---|---|
| `BattleStart` | C→S | 提交阵容，开始战斗 |
| `BattleInit` | S→C | 返回敌方阵容、种子、先手方 |
| `BattleAction` | C→S | 玩家操作指令（主动/终极技能） |
| `BattleResult` | S→C | 战斗结算结果 |

### 3.6 经济模块 Economy（HTTP）

| 接口 | 方法 | 路径 | 说明 |
|---|---|---|---|
| 商店列表 | GET | `/api/v1/economy/shop` | 获取商店商品列表 |
| 购买商品 | POST | `/api/v1/economy/buy` | 购买商店商品 |
| 兑换货币 | POST | `/api/v1/economy/exchange` | 货币互换（如钻石换金币） |

### 3.7 抽卡模块 Gacha（HTTP）

| 接口 | 方法 | 路径 | 说明 |
|---|---|---|---|
| 获取卡池 | GET | `/api/v1/gacha/pools` | 获取所有可用卡池 |
| 单抽 | POST | `/api/v1/gacha/draw` | 单抽一次 |
| 十连抽 | POST | `/api/v1/gacha/draw_ten` | 十连抽 |

**单抽请求：**
```json
{
  "pool_id": "standard_pool",
  "count": 1
}
```

**单抽响应：**
```json
{
  "code": 0,
  "data": {
    "draws": [
      {
        "card_id": "frost_queen",
        "rarity": "legendary",
        "is_new": false,
        "fragments_if_dup": 80
      }
    ],
    "pity_counter": {
      "total_draws": 72,
      "since_last_legendary": 72,
      "hard_pity_at": 90
    }
  }
}
```

### 3.8 任务模块 Quest（HTTP）

| 接口 | 方法 | 路径 | 说明 |
|---|---|---|---|
| 获取任务列表 | GET | `/api/v1/quest/list` | 日常/周常/成就任务进度 |
| 领取任务奖励 | POST | `/api/v1/quest/claim` | 领取已完成任务奖励 |
| 领取活跃度宝箱 | POST | `/api/v1/quest/claim_activity` | 领取活跃度档位奖励 |
| 签到 | POST | `/api/v1/quest/check_in` | 每日签到 |

### 3.9 PVP 竞技场模块 Arena（HTTP + WebSocket）

| 接口 | 方法 | 路径 | 协议 | 说明 |
|---|---|---|---|---|
| 获取段位信息 | GET | `/api/v1/arena/info` | HTTP | 当前段位/积分/战绩 |
| 设置防守阵容 | POST | `/api/v1/arena/set_defense` | HTTP | 保存防守阵容快照 |
| 开始匹配 | POST | `/api/v1/arena/match` | HTTP | 发起 PVP 匹配 |
| 战报列表 | GET | `/api/v1/arena/reports` | HTTP | 查看历史战报 |
| PVP 战斗 | BattleStart/BattleAction/BattleResult | WebSocket | WS | 复用战斗协议 |

### 3.10 邮件模块 Mail（HTTP）

| 接口 | 方法 | 路径 | 说明 |
|---|---|---|---|
| 邮件列表 | GET | `/api/v1/mail/list` | 获取邮件列表 |
| 领取附件 | POST | `/api/v1/mail/claim` | 领取邮件附件 |
| 删除邮件 | POST | `/api/v1/mail/delete` | 删除已读邮件 |

---

## 四、M2+ 阶段接口（后续扩展）

| 模块 | 接口 | 说明 | 预计阶段 |
|---|---|---|---|
| 好友 | friend/list, add, accept, remove, gift | 好友管理 + 体力赠送 | M3 |
| 公会 | guild/create, join, info, contribute, shop | 公会系统 | M4 |
| 活动 | activity/list, join, reward | 限时活动 | M4 |
| 排行榜 | ranking/list, my_rank | 全球/好友排行 | M4 |
| 商城 | shop/products, buy, monthly_card, battle_pass | 完整商城 | M5 |
| 支付 | payment/create, verify, receipt | 充值验签 | M5 |
| GM | gm/command, gm/query | 后台管理 | M5 |

---

## 五、错误码体系

### 5.1 错误码格式

```
错误码 = 模块编号(2位) + 错误序号(3位)
例：1001 = 账号模块(10) + 第001号错误
```

### 5.2 通用错误码

| 错误码 | 标识 | 说明 |
|---|---|---|
| 0 | success | 成功 |
| 1 | unknown_error | 未知错误 |
| 2 | invalid_request | 请求格式错误 |
| 3 | unauthorized | 未登录/token 过期 |
| 4 | forbidden | 无权限 |
| 5 | not_found | 资源不存在 |
| 6 | rate_limit | 请求频率过高 |
| 7 | server_busy | 服务器繁忙 |
| 8 | config_outdated | 配置版本过旧，需更新 |

### 5.3 账号模块错误码（10xx）

| 错误码 | 标识 | 说明 |
|---|---|---|
| 1001 | account_banned | 账号已被封禁 |
| 1002 | account_deleted | 账号已注销 |
| 1003 | bind_failed | 第三方绑定失败 |
| 1004 | token_expired | Token 已过期 |

### 5.4 经济模块错误码（20xx）

| 错误码 | 标识 | 说明 |
|---|---|---|
| 2001 | gold_not_enough | 金币不足 |
| 2002 | diamond_not_enough | 钻石不足 |
| 2003 | stamina_not_enough | 体力不足 |
| 2004 | fragment_not_enough | 碎片不足 |
| 2005 | star_stone_not_enough | 升星石不足 |
| 2006 | skill_book_not_enough | 技能书不足 |
| 2007 | protect_item_not_enough | 保护符不足 |
| 2008 | resource_overflow | 资源超出上限 |

### 5.5 卡牌模块错误码（30xx）

| 错误码 | 标识 | 说明 |
|---|---|---|
| 3001 | card_not_owned | 未拥有该卡牌 |
| 3002 | card_max_star | 已达最大星级 |
| 3003 | card_max_level | 已达最大等级 |
| 3004 | star_up_breakthrough_required | 需要突破资格 |
| 3005 | skill_not_unlocked | 技能未解锁 |
| 3006 | skill_max_level | 技能已达最大等级 |
| 3007 | equip_not_owned | 未拥有该装备 |
| 3008 | equip_enhance_failed | 装备强化失败 |
| 3009 | formation_invalid | 阵容配置无效（如卡牌重复） |

### 5.6 抽卡模块错误码（40xx）

| 错误码 | 标识 | 说明 |
|---|---|---|
| 4001 | pool_not_found | 卡池不存在 |
| 4002 | pool_inactive | 卡池未开放 |
| 4003 | pool_empty | 卡池已抽完 |
| 4004 | draw_cost_not_enough | 抽卡消耗不足 |

### 5.7 战斗模块错误码（50xx）

| 错误码 | 标识 | 说明 |
|---|---|---|
| 5001 | battle_already_started | 战斗已开始 |
| 5002 | battle_not_found | 战斗不存在 |
| 5003 | battle_timeout | 操作超时 |
| 5004 | rage_insufficient | 怒气不足 |
| 5005 | cooldown_not_ready | 终极技能冷却中 |
| 5006 | invalid_action | 无效操作 |
| 5007 | battle_result_mismatch | 客户端上报结果与服务端不一致（疑似作弊） |

### 5.8 PVP 模块错误码（60xx）

| 错误码 | 标识 | 说明 |
|---|---|---|
| 6001 | arena_match_timeout | 匹配超时 |
| 6002 | arena_daily_limit | 每日对战次数已满 |
| 6003 | arena_cooldown | 匹配冷却中 |
| 6004 | arena_defense_not_set | 未设置防守阵容 |

### 5.9 任务模块错误码（70xx）

| 错误码 | 标识 | 说明 |
|---|---|---|
| 7001 | quest_not_found | 任务不存在 |
| 7002 | quest_not_completed | 任务未完成 |
| 7003 | quest_already_claimed | 奖励已领取 |
| 7004 | quest_expired | 任务已过期 |
| 7005 | check_in_already | 今日已签到 |

---

## 六、认证机制

### 6.1 Token 格式

```
Header: Authorization: Bearer {jwt_token}

JWT Payload:
{
  "sub": "player_id",
  "iat": 1721000000,
  "exp": 1721086400,    // 24 小时过期
  "platform": "guest",
  "vip_level": 3
}
```

### 6.2 Token 刷新

- Token 有效期 24 小时
- 客户端在过期前 1 小时自动刷新
- 刷新接口：`POST /api/v1/account/refresh_token`
- 旧 Token 在刷新后 5 分钟内仍可用（防并发）

### 6.3 WebSocket 认证

```
连接时在 URL 中携带 token：
ws://game.example.com/ws?token={jwt_token}

服务端验证后返回：
{ "type": "Connected", "payload": { "player_id": "uuid" } }
```

---

## 七、限流规则

| 接口类型 | 限制 | 说明 |
|---|---|---|
| 登录 | 10 次/分钟/IP | 防暴力破解 |
| 抽卡 | 30 次/分钟/玩家 | 防刷抽卡 |
| 战斗提交 | 5 次/秒/玩家 | 防脚本 |
| PVP 匹配 | 1 次/3 秒/玩家 | 防频繁匹配 |
| 配置下载 | 10 次/小时/设备 | 减少 CDN 压力 |
| 其他 HTTP | 60 次/分钟/玩家 | 通用限流 |

---

## 八、决策状态汇总

| # | 问题 | 决策 | 状态 |
|---|---|---|---|
| 1 | 通信协议 | ✅ HTTP + WebSocket 混合 | 已定 |
| 2 | HTTP 基础路径 | ✅ `/api/v1/{module}/{action}` | 已定 |
| 3 | 认证方式 | ✅ JWT Token（24h 有效期） | 已定 |
| 4 | 错误码格式 | ✅ 2 位模块 + 3 位序号 | 已定 |
| 5 | 配置同步方式 | ✅ 版本号对比 + CDN 下载 | 已定 |
| 6 | 限流策略 | ✅ 按接口类型分级限流 | 已定 |
| 7 | Protobuf vs JSON | JSON（初期），后期按需引入 Protobuf | 待定 |
