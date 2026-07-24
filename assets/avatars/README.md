# Phase 1: Q版头像提示词

> 本文件夹存放10张卡牌的Q版头像AI图像生成提示词
> 按照 `prompt-design-plan.md` 执行

## 文件命名规范
- `avatar_{card_id}_prompt.md` - Q版头像提示词文件
- `avatar_{card_id}_variants/` - 变体文件夹

## 执行顺序
1. **冰霜女王 (frost_queen)** - 传说·法师·冰 - 定风格用
2. **圣光先知 (light_oracle)** - 传说·辅助·光 - 定风格用
3. 铁卫守卫 (iron_guardian) - 稀有·战士·自然
4. 冰霜骑士 (frost_knight) - 史诗·战士·冰
5. 火焰先知 (fire_oracle) - 史诗·法师·火
6. 暗影编织者 (shadow_weaver) - 史诗·术士·暗
7. 毒雾女巫 (poison_witch) - 稀有·术士·自然
8. 雷霆游侠 (thunder_ranger) - 史诗·射手·雷电
9. 风行斥候 (wind_scout) - 稀有·射手·自然
10. 自然贤者 (nature_sage) - 稀有·辅助·自然

## 风格锚定
- 风格：chibi Q版，可爱但可识别
- 输出规格：256×256 (1:1)
- 背景：简单纯色背景

## 稀有度边框
- 普通 (Common): 简单灰色石框
- 稀有 (Rare): 蓝色金属框
- 史诗 (Epic): 紫色华丽框
- 传说 (Legendary): 金色精致框