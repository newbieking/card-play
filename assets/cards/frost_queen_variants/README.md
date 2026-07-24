# 冰霜女王变体生成指南

## 变体列表

| 变体 | 名称 | 提示词修改 | 状态 | 质量评分 |
|---|---|---|---|---|
| 1 | 标准版 | 无修改 | ⏳ 待生成 | - |
| 2 | 动态版 | 添加战斗姿态 | ⏳ 待生成 | - |
| 3 | 特写版 | 聚焦面部 | ⏳ 待生成 | - |
| 4 | 场景版 | 添加环境 | ⏳ 待生成 | - |
| 5 | 概念版 | 艺术化表现 | ⏳ 待生成 | - |

## 生成流程

### 步骤1: 生成标准版（变体1）
1. 使用完整提示词
2. 生成4张变体
3. 评估质量（总分≥18分）
4. 选择最佳变体

### 步骤2: 基于最佳变体生成其他版本
1. 使用img2img（权重0.6-0.7）
2. 调整提示词添加变体特征
3. 保持角色一致性

### 步骤3: 质量评估
1. 使用5维度评分标准
2. 总分≥18分通过
3. 记录每个变体的评分

### 步骤4: 导出和优化
1. 导出PNG原图（1536×2048）
2. Photoshop裁剪和优化
3. 压缩至200-500KB

## 变体提示词

### 变体1: 标准版
```
card illustration, semi-realistic Eastern fantasy, high detail, dramatic lighting, transparent background, PNG, an ethereal ice queen floating above a frozen throne, flowing translucent blue-white gown merging with ice crystals, a massive icicle staff crackling with frost energy, long silver hair billowing, piercing sapphire eyes, blizzard cyclone swirling around her, delicate ice crown, snowflakes orbiting her body, legendary-golden radiant aura, full divine presence
```

### 变体2: 动态版
```
card illustration, semi-realistic Eastern fantasy, high detail, dramatic lighting, transparent background, PNG, an ethereal ice queen floating above a frozen throne, flowing translucent blue-white gown merging with ice crystals, a massive icicle staff crackling with frost energy, long silver hair billowing, piercing sapphire eyes, blizzard cyclone swirling around her, delicate ice crown, snowflakes orbiting her body, legendary-golden radiant aura, full divine presence, dynamic battle pose, casting ice spell, magical energy exploding
```

### 变体3: 特写版
```
card illustration, semi-realistic Eastern fantasy, high detail, dramatic lighting, transparent background, PNG, close-up portrait of ethereal ice queen, detailed face, intricate ice crown, glowing sapphire eyes, silver hair billowing, translucent blue-white gown, ice crystals, legendary-golden radiant aura, full divine presence
```

### 变体4: 场景版
```
card illustration, semi-realistic Eastern fantasy, high detail, dramatic lighting, transparent background, PNG, an ethereal ice queen floating above a frozen throne, flowing translucent blue-white gown merging with ice crystals, a massive icicle staff crackling with frost energy, long silver hair billowing, piercing sapphire eyes, blizzard cyclone swirling around her, delicate ice crown, snowflakes orbiting her body, legendary-golden radiant aura, full divine presence, frozen palace interior, ice pillars, aurora borealis in sky
```

### 变体5: 概念版
```
concept art style, painterly brush strokes, ethereal atmosphere, semi-realistic Eastern fantasy, high detail, dramatic lighting, transparent background, PNG, ethereal ice queen, frozen throne, translucent blue-white gown, icicle staff, silver hair, sapphire eyes, blizzard cyclone, ice crown, legendary golden aura
```

## 质量评估表

| 变体 | 风格一致性 | 角色辨识度 | 细节丰富度 | 构图合理性 | 技术质量 | 总分 | 通过 |
|---|---|---|---|---|---|---|---|
| 1 | /4 | /4 | /3 | /3 | /4 | /18 | ⏳ |
| 2 | /4 | /4 | /3 | /3 | /4 | /18 | ⏳ |
| 3 | /4 | /4 | /3 | /3 | /4 | /18 | ⏳ |
| 4 | /4 | /4 | /3 | /3 | /4 | /18 | ⏳ |
| 5 | /4 | /4 | /3 | /3 | /4 | /18 | ⏳ |

## 执行记录

### 生成时间
- 开始时间: 
- 完成时间: 

### 工具参数
- 工具: Midjourney v6.1 / Stable Diffusion
- 模型: 
- 参数: 

### 变体选择
- 最佳变体: 
- 总分: 
- 选择理由: 

## 输出文件

| 文件名 | 用途 | 分辨率 | 状态 |
|---|---|---|---|
| frost_queen_standard.png | 标准版原图 | 1536×2048 | ⏳ 待生成 |
| frost_queen_standard_game.png | 游戏内版本 | 768×1024 | ⏳ 待生成 |
| frost_queen_dynamic.png | 动态版 | 1536×2048 | ⏳ 待生成 |
| frost_queen_closeup.png | 特写版 | 1536×2048 | ⏳ 待生成 |
| frost_queen_scene.png | 场景版 | 1536×2048 | ⏳ 待生成 |
| frost_queen_concept.png | 概念版 | 1536×2048 | ⏳ 待生成 |

## 注意事项

1. **一致性保障**
   - 使用相同seed生成所有变体
   - 通过ControlNet保持动作一致性
   - 批量生成后统一色调

2. **质量控制**
   - 每个变体生成4张，选择最佳
   - 总分≥18分方可通过
   - 如未达标，调整提示词重新生成

3. **性能优化**
   - 导出PNG-24，透明背景
   - 压缩至200-500KB
   - 使用纹理压缩（ASTC/ETC2）

4. **后续处理**
   - 导入Cocos Creator
   - 设置Sprite Frame属性
   - 打包到Asset Bundle