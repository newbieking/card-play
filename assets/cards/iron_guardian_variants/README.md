# 铁卫守卫变体生成指南

## 变体列表

| 变体 | 名称 | 提示词修改 | 状态 | 质量评分 |
|---|---|---|---|---|
| 1 | 标准版 | 无修改 | ⏳ 待生成 | - |
| 2 | 战斗版 | 添加`battle stance, defending` | ⏳ 待生成 | - |
| 3 | 特写版 | 添加`close-up portrait, detailed armor` | ⏳ 待生成 | - |
| 4 | 场景版 | 添加`ancient forest, mossy ruins` | ⏳ 待生成 | - |
| 5 | 概念版 | 添加`concept art style, painterly` | ⏳ 待生成 | - |

## 通用前缀
```
card illustration, semi-realistic Eastern fantasy,
high detail, dramatic lighting, transparent background, PNG
```

## 基础提示词
```
a stoic female warrior in heavy green-iron plate armor, holding a massive tower shield and broadsword, vines and moss growing on armor edges, forest background with dappled sunlight, determined expression, green gemstone accents on armor, [rare-blue border glow]
```

## 变体提示词

### 变体1: 标准版
```
card illustration, semi-realistic Eastern fantasy, high detail, dramatic lighting, transparent background, PNG, a stoic female warrior in heavy green-iron plate armor, holding a massive tower shield and broadsword, vines and moss growing on armor edges, forest background with dappled sunlight, determined expression, green gemstone accents on armor, rare-blue border glow
```

### 变体2: 战斗版
```
card illustration, semi-realistic Eastern fantasy, high detail, dramatic lighting, transparent background, PNG, a stoic female warrior in heavy green-iron plate armor, holding a massive tower shield and broadsword, vines and moss growing on armor edges, forest background with dappled sunlight, determined expression, green gemstone accents on armor, rare-blue border glow, battle stance, defending
```

### 变体3: 特写版
```
card illustration, semi-realistic Eastern fantasy, high detail, dramatic lighting, transparent background, PNG, close-up portrait of stoic female warrior, detailed green-iron plate armor, determined expression, green gemstone accents, forest background, rare-blue border glow
```

### 变体4: 场景版
```
card illustration, semi-realistic Eastern fantasy, high detail, dramatic lighting, transparent background, PNG, a stoic female warrior in heavy green-iron plate armor, holding a massive tower shield and broadsword, vines and moss growing on armor edges, ancient forest, mossy ruins background, dappled sunlight, determined expression, green gemstone accents on armor, rare-blue border glow
```

### 变体5: 概念版
```
concept art style, painterly brush strokes, semi-realistic Eastern fantasy, high detail, dramatic lighting, transparent background, PNG, stoic female warrior, heavy green-iron plate armor, tower shield, broadsword, vines on armor, forest background, determined expression, green gemstone accents, rare-blue glow
```

## Midjourney 参数
```bash
--ar 3:4 --s 750 --q 2 --v 6.1 --no text, watermark, signature, blurry, deformed
```

## 质量评估表

| 变体 | 风格一致性 | 角色辨识度 | 细节丰富度 | 构图合理性 | 技术质量 | 总分 | 通过 |
|---|---|---|---|---|---|---|---|
| 1 | /4 | /4 | /3 | /3 | /4 | /18 | ⏳ |
| 2 | /4 | /4 | /3 | /3 | /4 | /18 | ⏳ |
| 3 | /4 | /4 | /3 | /3 | /4 | /18 | ⏳ |
| 4 | /4 | /4 | /3 | /3 | /4 | /18 | ⏳ |
| 5 | /4 | /4 | /3 | /3 | /4 | /18 | ⏳ |

## 输出文件

| 文件名 | 用途 | 分辨率 | 状态 |
|---|---|---|---|
| iron_guardian_standard.png | 标准版原图 | 1536×2048 | ⏳ 待生成 |
| iron_guardian_standard_game.png | 游戏内版本 | 768×1024 | ⏳ 待生成 |
| iron_guardian_battle.png | 战斗版 | 1536×2048 | ⏳ 待生成 |
| iron_guardian_closeup.png | 特写版 | 1536×2048 | ⏳ 待生成 |
| iron_guardian_scene.png | 场景版 | 1536×2048 | ⏳ 待生成 |
| iron_guardian_concept.png | 概念版 | 1536×2048 | ⏳ 待生成 |