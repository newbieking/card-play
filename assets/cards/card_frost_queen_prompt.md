# 冰霜女王 (Frost Queen) - 卡牌插画提示词

## 基本信息
- **卡牌ID**: frost_queen
- **名称**: 冰霜女王
- **稀有度**: 传说 (Legendary)
- **职业**: 法师 (Mage)
- **元素**: 冰 (Ice)
- **定位**: AOE 输出
- **属性**: HP=800, ATK=30, MATK=320, DEF=100, MDEF=160, SPD=60

## 提示词

### 完整提示词（约60词）
```
an ethereal ice queen floating above a frozen throne, flowing translucent blue-white gown merging with ice crystals, a massive icicle staff crackling with frost energy, long silver hair billowing, piercing sapphire eyes, blizzard cyclone swirling around her, delicate ice crown, snowflakes orbiting her body, [legendary-golden radiant aura, full divine presence]
```

### 精简版提示词（约20词，用于Midjourney）
```
ethereal ice queen, frozen throne, translucent blue-white gown, icicle staff, silver hair, sapphire eyes, blizzard cyclone, ice crown, legendary golden aura
```

### 通用前缀
```
card illustration, semi-realistic Eastern fantasy,
high detail, dramatic lighting, transparent background, PNG
```

### 完整组合提示词
```
card illustration, semi-realistic Eastern fantasy, high detail, dramatic lighting, transparent background, PNG, an ethereal ice queen floating above a frozen throne, flowing translucent blue-white gown merging with ice crystals, a massive icicle staff crackling with frost energy, long silver hair billowing, piercing sapphire eyes, blizzard cyclone swirling around her, delicate ice crown, snowflakes orbiting her body, legendary-golden radiant aura, full divine presence
```

## 视觉特征

### 角色设计
- **姿态**: 浮空，优雅而威严
- **服装**: 半透明蓝白长袍，与冰晶融合
- **武器**: 巨大的冰晶法杖，闪烁冰霜能量
- **发型**: 银色长发飘逸
- **眼睛**: 深邃的蓝宝石色
- **头饰**: 精致的冰冠

### 元素特效
- **冰霜能量**: 法杖和身体周围闪烁
- **暴风雪**: 环绕角色的旋风
- **雪花**: 围绕身体飘动
- **冰晶**: 服装和背景中的冰晶元素

### 稀有度特征
- **传说级光效**: 金色光环，神圣存在感
- **边框**: 传说级金色边框，龙凤图案

## Midjourney 参数
```bash
# 原图（高清展示用）
--ar 3:4 --s 750 --q 2 --v 6.1 --no text, watermark, signature, blurry, deformed

# 游戏内版本
--ar 3:4 --s 500 --q 2 --v 6.1 --no text, watermark, signature, blurry, deformed
```

## Stable Diffusion 参数
- **模型**: DreamShaper / AnythingV5
- **Negative prompt**:
```
blurry, low quality, text, watermark, deformed, ugly, extra fingers, bad anatomy,
bad proportions, disfigured, poorly drawn face, mutation, extra limbs, amateur,
cropped, out of frame, worst quality, low resolution
```
- **CFG Scale**: 7-9
- **Steps**: 30-50
- **Sampler**: DPM++ 2M Karras

## 变体生成计划

### 变体1: 标准版
- 使用完整提示词
- 重点：冰霜女王的整体形象和氛围

### 变体2: 动态版
- 添加动态元素：战斗姿态、法术释放
- 提示词添加：`dynamic battle pose, casting ice spell, magical energy exploding`

### 变体3: 特写版
- 聚焦面部和上半身
- 提示词添加：`close-up portrait, detailed face, intricate ice crown, glowing eyes`

### 变体4: 场景版
- 包含更多环境元素
- 提示词添加：`frozen palace interior, ice pillars, aurora borealis in sky`

### 变体5: 概念版
- 更艺术化的表现
- 提示词添加：`concept art style, painterly brush strokes, ethereal atmosphere`

## 执行步骤

1. **生成变体1**（标准版）
   - 使用完整提示词
   - 生成4张变体
   - 评估质量（风格一致性≥4，角色辨识度≥4，细节丰富度≥3，构图合理性≥3，技术质量≥4）

2. **选择最佳变体**
   - 总分≥18分通过
   - 如未达标，调整提示词重新生成

3. **生成其他变体**
   - 基于最佳变体，使用img2img生成其他版本
   - 保持角色一致性（权重0.6-0.7）

4. **导出和优化**
   - 导出PNG原图（1536×2048）
   - Photoshop裁剪和优化
   - 压缩至200-500KB

## 质量评估标准

| 维度 | 权重 | 评分标准 | 目标分数 |
|---|---|---|---|
| 风格一致性 | 4 | 与《原神》/《崩坏3》风格匹配度 | ≥4 |
| 角色辨识度 | 4 | 能否一眼认出是冰霜女王 | ≥4 |
| 细节丰富度 | 3 | 服饰、武器、特效细节 | ≥3 |
| 构图合理性 | 3 | 角色姿态、背景层次 | ≥3 |
| 技术质量 | 4 | 清晰度、无瑕疵、无畸变 | ≥4 |
| **总分** | **18** | **≥18分通过** | **18** |

## 参考图片

### 风格参考
- 《原神》甘雨角色立绘
- 《崩坏3》琪亚娜角色卡牌
- 《阴阳师》雪女皮肤

### 颜色参考
- 冰系色调：#A8D8EA（冰蓝）→ #FFFFFF（白）
- 传说光效：#FFFACD（奶白金）→ #FFD700（金）

## 输出规格

| 用途 | 分辨率 | 比例 | 说明 |
|---|---|---|---|
| 原图（高清展示） | 1536×2048 | 3:4 | 用于详情页/宣传 |
| 游戏内版本 | 768×1024 | 3:4 | 运行时加载，战斗/卡牌展示 |
| Q版头像 | 256×256 | 1:1 | UI小图标，好友/排行榜 |

## 后续处理

1. **导入Cocos Creator**
   - 导入到 `assets/resources/cards/` 目录
   - 设置Sprite Frame属性
   - 打包到Asset Bundle

2. **性能优化**
   - 使用纹理压缩（ASTC/ETC2）
   - 按需加载，避免内存峰值

3. **一致性保障**
   - 使用相同seed生成变体
   - 通过ControlNet保持动作一致性
   - 批量生成后统一色调