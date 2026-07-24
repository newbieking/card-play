# 美术素材提示词设计计划

> 配套文档：`docs/art/design.md`（素材规范）、`docs/data/sample-cards.md`（10 张示例卡牌）
> 目标：为 `design.md` 中所有素材类型逐一设计 AI 图像生成提示词（适用于 Midjourney / Stable Diffusion / DALL-E）
> 执行方式：分阶段逐步推进，每阶段产出一批可用素材

---

## 一、全局风格锚定（Style Anchor）

所有素材共用同一套画风基底，确保视觉统一：

```
[Style Anchor - 全局]
核心画风：半写实东方奇幻，线条利落、色彩饱和、光影对比强
参考风格：《原神》角色立绘 / 《崩坏3》卡牌风格
视觉特征：
  - 半写实比例（头身比 7-8 头身）
  - 高饱和度 + 高对比度光影
  - 线条利落，轮廓清晰
  - 背景虚化处理，突出角色
  - 东方奇幻元素（仙侠/武侠/神话）
画面比例：卡牌插画 3:4 竖版；场景/棋盘 16:9 横版；图标/头像 1:1 方形
色调体系：
  - 冰系：#A8D8EA（冰蓝）→ #FFFFFF（白）
  - 火系：#FF4500（橙红）→ #FFD700（金）
  - 自然系：#228B22（翠绿）→ #8FBC8F（暗绿）
  - 暗系：#2C003E（深紫）→ #000000（黑）
  - 雷电系：#FFD700（金）→ #FF69B4（粉紫）
  - 光系：#FFFACD（奶白金）→ #FFD700（金）
```

---

## 二、输出规格（Output Specifications）

| 用途 | 分辨率 | 比例 | 说明 |
|---|---|---|---|
| 卡牌插画（原图） | 1536×2048 | 3:4 | 高清展示，用于详情页/宣传 |
| 卡牌插画（游戏内） | 768×1024 | 3:4 | 运行时加载，战斗/卡牌展示 |
| Q版头像 | 256×256 | 1:1 | UI 小图标，好友/排行榜 |
| 场景背景 | 1920×1080 | 16:9 | 战斗场景背景 |
| UI 图标 | 128×128 | 1:1 | 资源/状态图标，背包/商店 |
| 卡背 | 512×512 | 1:1 | 卡牌背面，对战界面 |
| VFX 关键帧 | 1024×1024 | 1:1 | 特效序列帧，导入引擎 |
| 碎片图标 | 128×128 | 1:1 | 碎片背包图标 |

---

## 三、素材分阶段排期总览

| 阶段 | 素材类 | 数量 | 优先级 | 依赖 |
|---|---|---|---|---|
| **P0** | 10 张示例卡牌插画 | 10 | 最高 | Style Anchor |
| **P1** | 10 张卡牌 Q 版头像 + 边框（4 稀有度） | 14 | 高 | P0 风格锁定 |
| **P2** | 卡背设计（34 款） | 34 | 中高 | 职业纹样体系 |
| **P3** | 职业专属场景（6 元素/职业场景）+ 对战棋盘 | 8 | 中高 | 元素色调体系 |
| **P4** | UI 图标（资源图标、数值标识、星级标识、按钮面板） | ~31 | 中 | UI 规范 |
| **P5** | 升星外观变化（每张卡 3 阶段 × 10 卡） | 30 | 中 | P0 |
| **P6** | VFX 特效序列帧（入场/攻击/受击/升级/觉醒） | ~30 组 | 中低 | 战斗表现层 |
| **P7** | 合成/进化对比 + 碎片图标 | ~15 | 低 | P0 |

---

## 四、各阶段详细提示词

### P0：10 张核心卡牌插画（最高优先）

通用前缀（每张卡前面加上）：
```
card illustration, semi-realistic Eastern fantasy,
high detail, dramatic lighting, transparent background, PNG
```

**注意**：详细风格信息（高饱和度、线条利落等）通过 Midjourney 的 `--style` 参数或 `--sref` 参考图实现，避免提示词超长。

| # | 卡牌 | 元素 | 提示词 |
|---|---|---|---|
| 1 | 铁卫守卫（稀有·战士·自然） | 自然 | `a stoic female warrior in heavy green-iron plate armor, holding a massive tower shield and broadsword, vines and moss growing on armor edges, forest background with dappled sunlight, determined expression, green gemstone accents on armor, [rare-blue border glow]` |
| 2 | 冰霜骑士（史诗·战士·冰） | 冰 | `an imposing male knight encased in crystalline ice-blue plate armor, frost radiating from his blade, blizzard swirling behind him, icicles forming on shoulder pauldrons, fierce battle stance, glowing blue eyes, snowflake motifs on shield, [epic-purple aura]` |
| 3 | 冰霜女王（传说·法师·冰） | 冰 | `an ethereal ice queen floating above a frozen throne, flowing translucent blue-white gown merging with ice crystals, a massive icicle staff crackling with frost energy, long silver hair billowing, piercing sapphire eyes, blizzard cyclone swirling around her, delicate ice crown, snowflakes orbiting her body, [legendary-golden radiant aura, full divine presence]` |
| 4 | 火焰先知（史诗·法师·火） | 火 | `a robed female mage with fiery red-orange robes, flames dancing in her palms, volcanic eruption in background, molten lava patterns on hem of robes, intense amber eyes glowing with inner fire, ember particles orbiting her, phoenix feather hair ornament, [epic-purple inner glow]` |
| 5 | 暗影编织者（史诗·术士·暗） | 暗 | `a mysterious hooded warlock weaving threads of dark purple-black energy between skeletal fingers, void tendrils emerging from shadows, a cracked obsidian amulet on chest, one glowing violet eye visible under hood, dark mist pooling at feet, purple runes floating in air, [epic-purple shadow aura]` |
| 6 | 毒雾女巫（稀有·术士·自然） | 自然 | `a sly female witch surrounded by swirling green toxic mist, wearing tattered dark green robes with poison vials on belt, bioluminescent fungi growing on staff, venomous serpent companion at feet, eerie green glow from eyes, nature reclaiming ruins in background, [rare-blue mist effect]` |
| 7 | 雷霆游侠（史诗·射手·雷电） | 雷电 | `an agile male ranger in leather armor crackling with lightning, twin electric crossbows drawn, thunderclouds gathering above, speed lines and lightning bolts in background, sharp electric-blue eyes, wind-swept blonde hair, golden electricity arcing between weapons, [epic-purple lightning particles]` |
| 8 | 风行斥候（稀有·射手·自然） | 自然 | `a lean female scout perched on a windswept cliff, lightweight green-brown leather armor with feather motifs, longbow in hand, wind spirals around her, hawk companion circling, autumn leaves caught in wind, bright alert green eyes, agile stance ready to leap, [rare-blue wind trails]` |
| 9 | 圣光先知（传说·辅助·光） | 光 | `a radiant holy oracle in flowing white-gold robes, arms outstretched with golden healing light pouring from palms, cathedral-like celestial background with light rays, serene compassionate expression, golden halo above head, doves orbiting, intricate golden embroidery on robes, divine energy pillars, [legendary-golden divine radiance, full holy aura]` |
| 10 | 自然贤者（稀有·辅助·自然） | 自然 | `a wise elderly sage in earth-toned robes covered in leaf patterns, holding a wooden staff blooming with flowers, ancient forest shrine background, moss and ferns growing around, gentle green aura, kind wise eyes, small forest spirits (sprites) floating nearby, [rare-blue nature glow]` |

**P0 执行步骤：**
1. 先用冰霜女王（#3）测试，锁定画风
2. 确认后批量生成其余 9 张
3. 每张生成 3-5 个变体，选定最优

---

### P1：Q 版头像 + 稀有度边框

#### 1A. Q 版头像（Chibi Avatar）

通用前缀：
```
chibi style avatar, circular frame, cute but recognizable, 
game UI icon, vibrant colors, simple background, 
square 1:1 aspect ratio, 2D flat shading with subtle highlights
```

| 卡牌 | 提示词 |
|---|---|
| 冰霜女王 | `chibi ice queen with silver hair, tiny ice crown, blue-white outfit, holding mini ice staff, determined cute expression, ice crystal accents` |
| 圣光先知 | `chibi holy oracle in white-gold robes, tiny golden halo, arms casting mini golden sparkles, gentle smile, warm glow` |
| 其余 8 张 | （从 P0 提示词中提取关键视觉特征，简化为 chibi 描述） |

#### 1B. 稀有度边框（Card Border）

```
game card border template, transparent background, PNG,
[Common] simple grey stone frame, subtle texture, no ornament
[Rare] blue metallic frame with subtle light reflections, small gem accents
[Epic] purple ornate frame with flowing energy lines, gem clusters, faint glow
[Legendary] golden elaborate frame with dragon/phoenix motifs, radiant inner glow, gem encrustation, pulsing golden energy
```

---

### P2：卡背设计（34 款）

**设计原则**：每个职业（5种）× 每种元素（6种）= 30 款职业卡背 + 1 款基础 + 3 款传说专属 = 34 款

通用前缀：
```
card back design, symmetrical pattern, game card back, 
ornate border, centered emblem, 
square aspect ratio, transparent background, PNG
```

| 系列 | 元素变体 | 提示词模板 |
|---|---|---|
| 基础卡背 ×1 | - | `simple elegant card back, dark navy blue base, silver geometric pattern, central diamond emblem, clean minimal` |
| 战士系 ×6 | 冰/火/自然/暗/雷电/光 | `warrior card back, iron shield emblem center, crossed swords border motif, [element] color base, metallic finish` |
| 法师系 ×6 | 冰/火/自然/暗/雷电/光 | `mage card back, arcane circle emblem center, swirling magic runes border, [element] color base, magical glow` |
| 术士系 ×6 | 冰/火/自然/暗/雷电/光 | `warlock card back, pentagram emblem center, dark tendrils border motif, [element] color base, ominous glow` |
| 射手系 ×6 | 冰/火/自然/暗/雷电/光 | `archer card back, bow and arrow emblem center, wind/feather border motif, [element] color base, swift design` |
| 辅助系 ×6 | 冰/火/自然/暗/雷电/光 | `priest card back, healing cross emblem center, light rays border motif, [element] color base, sacred glow` |
| 传说专属 ×3 | - | `legendary card back, phoenix emblem center, full golden ornate border, radiant energy flowing outward, dragon scale texture background, divine glow, premium feel` |

**元素配色参考**：
- 冰系：ice-blue (#A8D8EA)
- 火系：crimson (#FF4500)
- 自然系：forest green (#228B22)
- 暗系：deep purple (#2C003E)
- 雷电系：electric blue (#FFD700)
- 光系：golden (#FFFACD)

---

### P3：职业专属场景 + 对战棋盘

#### 3A. 职业/元素场景（6 张，16:9 横版）

```
game battle scene background, wide 16:9, 
atmospheric, no characters, 
digital painting, highly detailed environment
```

| 场景 | 提示词 |
|---|---|
| 冰原（冰系） | `frozen tundra landscape, massive ice glaciers, aurora borealis in sky, snowfall, frozen lake reflecting moonlight, ice crystals growing from ground, cold blue-white color palette, atmospheric depth` |
| 火山（火系） | `active volcanic landscape, rivers of molten lava, smoke and ash clouds, obsidian rock formations, fiery orange-red sky, ember particles floating, dramatic lighting from below, heat distortion` |
| 森林（自然系） | `enchanted ancient forest, massive trees with glowing mushrooms, sunlight filtering through canopy, mist and fireflies, moss-covered ruins, vibrant green palette, mystical atmosphere` |
| 暗影裂隙（暗系） | `void rift in reality, swirling purple-black energy, floating dark crystals, cracked ground with dark mist, ominous purple sky, floating debris, dark fantasy atmosphere` |
| 雷电峡谷（雷电系） | `stormy mountain canyon, continuous lightning strikes, electric blue energy arcing between rock pillars, dark thunderclouds, rain, metallic surfaces reflecting lightning, dramatic vertical composition` |
| 圣光神殿（光系） | `celestial temple interior, golden light streaming through stained glass, marble columns with golden runes, divine energy particles floating, warm golden-white atmosphere, sacred and serene, holy light radiating` |

#### 3B. 对战棋盘（2 张，16:9 横版）

```
game battle board, top-down angled view (3/4 perspective),
symmetrical two-player layout,
grid pattern for card placement zones,
digital painting, game UI element
```

| 棋盘 | 提示词 |
|---|---|
| 通用竞技场 | `stone arena battle board, two symmetrical sides separated by central energy line, 5 card slots per side, worn stone texture, faint magical runes on ground, ambient particle effects, neutral tone` |
| 天空竞技场 | `floating sky island battle board, clouds below, ancient stone platform with glowing blue circuits, two sides divided by a beam of light, ethereal atmosphere, starry sky background` |

---

### P4：UI 图标（~30 个）

通用前缀：
```
game UI icon, clean design, vibrant color, 
simple background, square 1:1, 
flat design with subtle gradient, PNG
```

| 类别 | 图标 | 提示词 |
|---|---|---|
| 资源图标 | 金币 | `gold coin icon, single coin with crown emblem, shiny metallic gold, slight 3D effect` |
| | 钻石 | `blue diamond gem icon, brilliant cut, sparkling facets, glowing blue-white` |
| | 经验药水 | `purple experience potion bottle, swirling energy inside, cork stopper, magical glow` |
| | 装备材料 | `smithing material icon, iron ingot with hammer mark, metallic texture, sparks` |
| | 升星石 | `star evolution crystal, five-pointed star shape, pulsing golden energy, gemstone` |
| | 卡牌碎片 | `card fragment pieces, torn card pieces forming puzzle, glowing edges` |
| | 技能书 | `skill book icon, leather-bound book with glowing runes, bookmark ribbon, magical knowledge symbol` |
| 数值标识 | 攻击力 | `attack stat icon, flaming red sword, dynamic slash mark, bold red` |
| | 生命值 | `health stat icon, red heart with cross, glowing red, bold design` |
| | 防御力 | `defense stat icon, blue shield with fortress emblem, sturdy blue metallic` |
| | 魔法攻击 | `magic attack stat icon, purple arcane orb with spell circle, swirling energy` |
| | 速度 | `speed stat icon, golden winged boot, motion blur trail, swift feeling` |
| | 暴击率 | `critical hit stat icon, cracked red target with lightning bolt, sharp angular design` |
| 等级/星级 | 星星 ×1 | `golden star shape, five-pointed, shiny metallic, slight glow, used for star rating` |
| | 皇冠 | `golden crown icon, ornate with gemstones, regal, for mastery level` |
| | 徽章 | `bronze/silver/gold badge icon, shield shape with ribbon, achievement style` |

---

### P5：升星外观变化（每卡 3 阶段）

每张卡需要"1★ / 5★ / 满星"三个视觉阶段。以下为每个职业类型各一个完整示例，其余卡牌可套用模板。

#### 示例1：冰霜女王（传说·法师·冰）
```
[Frost Queen - 1★ base]
standard ice mage appearance, modest ice crystal accessories, 
simple blue-white robes, small ice staff, subtle frost effects

[Frost Queen - 5★ evolved]
enhanced ice queen, larger ice crown, flowing translucent cape of ice, 
powerful ice staff with swirling energy, frost aura around body, 
icicle decorations more elaborate

[Frost Queen - 10★ awakened]
divine ice goddess form, massive ice wings made of crystallized energy, 
throne of ice floating behind, full body ice armor over flowing gown, 
blizzard cyclone controlled by will, ice crown now a full diadem of frozen stars, 
overwhelming divine presence, legendary golden edge glow
```

#### 示例2：铁卫守卫（稀有·战士·自然）
```
[Iron Guardian - 1★ base]
basic female warrior in green-iron plate armor, simple tower shield, 
moss patches on armor, determined expression, forest green accents

[Iron Guardian - 5★ evolved]
enhanced warrior, vines wrapping around armor, shield with glowing green runes, 
broadsword with leaf patterns, forest spirit aura, nature energy emanating

[Iron Guardian - 10★ awakened]
forest champion form, living armor of bark and vines, shield transformed into 
living treant face, sword infused with ancient forest power, 
surrounded by floating leaves and forest spirits, divine nature champion
```

#### 示例3：暗影编织者（史诗·术士·暗）
```
[Shadow Weaver - 1★ base]
hooded warlock with dark purple robes, simple shadow tendrils, 
obsidian amulet, glowing violet eye, mysterious aura

[Shadow Weaver - 5★ evolved]
enhanced warlock, more elaborate hood with shadow runes, 
dark energy threads more complex, void crystals orbiting, 
shadow cloak with flowing energy patterns

[Shadow Weaver - 10★ awakened]
shadow lord form, full body shadow armor with living darkness, 
multiple shadow arms weaving reality, void throne floating behind, 
cosmic horror presence, shadow realm merging with reality
```

#### 示例4：雷霆游侠（史诗·射手·雷电）
```
[Thunder Ranger - 1★ base]
agile ranger in leather armor with lightning motifs, 
twin crossbows with electric glow, storm clouds gathering

[Thunder Ranger - 5★ evolved]
enhanced ranger, armor crackling with more electricity, 
crossbows with lightning arcs, storm aura around body, 
speed lines and thunder effects

[Thunder Ranger - 10★ awakened]
storm lord form, full body lightning armor, 
crossbows transformed into storm weapons, 
riding thundercloud, lightning bolts orbiting, 
divine storm presence, controlling weather
```

#### 示例5：圣光先知（传说·辅助·光）
```
[Holy Oracle - 1★ base]
holy priest in white-gold robes, simple healing light, 
golden halo, compassionate expression, modest divine aura

[Holy Oracle - 5★ evolved]
enhanced oracle, more elaborate golden embroidery, 
healing light pillars, dove companions, 
sacred symbols glowing, divine energy more intense

[Holy Oracle - 10★ awakened]
divine avatar form, full body light armor with golden wings, 
massive healing light field, celestial background, 
floating sacred symbols, overwhelming divine presence, 
halo transformed into crown of light
```

**模板套用指南**：为其他 5 张卡牌生成升星外观时，参考以上职业示例，保持以下递进逻辑：
- **1★基础**：简朴素雅，元素特征初现
- **5★进阶**：装饰增多，元素力量显现，细节更丰富
- **10★觉醒**：神性化/元素主宰形态，全屏特效，史诗级视觉冲击

---

### P6：VFX 特效序列帧（~30 组）

特效类不适合单张静态图，适合用提示词生成**关键帧** + 手动调整：

| 特效类型 | 提示词模板 |
|---|---|
| 入场特效 | `game VFX, entrance effect keyframe, [element] energy burst expanding outward from center, [color] particles and light streaks, dynamic motion, transparent background, PNG sequence` |
| 攻击特效 | `game VFX, attack impact keyframe, [element] explosion on hit, debris and particles flying, energy shockwave ring, dynamic angle, transparent background` |
| 受击特效 | `game VFX, damage hit reaction, red-white flash, screen shake particles, impact sparks, directional force lines, transparent background` |
| 升级特效 | `game VFX, level up / star up effect, golden light pillar ascending, orbiting star particles, energy rings expanding upward, triumphant feeling, transparent background` |
| 边框呼吸光 | `game VFX, card border breathing glow, [rarity color] pulsing light animation frame, subtle energy ripple, transparent background` |
| 觉醒/突破特效 | `game VFX, awakening breakthrough effect, massive energy explosion, sky cracking open, divine light pouring through, screen-filling dramatic effect, transparent background` |

#### VFX 生成流程（Workflow）
AI生成器不擅长生成一致的序列帧，建议采用以下流程：
1. **使用 AI 生成单张"关键帧"**（最有视觉冲击力的一帧）
2. **使用 img2img 微调生成前后帧**（调整参数控制变化幅度）
3. **或使用 After Effects/Spine 手动补间**（确保帧间一致性）
4. **导出为 PNG 序列帧**（游戏引擎加载用）
5. **关键帧数量**（根据目标帧率计算）：

| 特效类型 | 持续时间 | 30fps 帧数 | 60fps 帧数 |
|---|---|---|---|
| 入场 | 800ms | 24 | 48 |
| 攻击 | 500ms | 15 | 30 |
| 受击 | 200ms | 6 | 12 |
| 升级 | 1000ms | 30 | 60 |
| 觉醒 | 2000ms | 60 | 120 |

**推荐**：优先使用 30fps 方案，减少资源体积；高帧率需求时使用 60fps

**帧间一致性技巧**：
- 使用相同 seed 生成所有帧
- 通过 ControlNet（OpenPose/Depth）保持动作一致性
- 批量生成后使用 Photoshop 批处理统一色调

---

### P7：合成进化对比 + 碎片图标

| 素材 | 提示词 |
|---|---|
| 碎片图标（按稀有度） | `card fragment icon, torn pieces of a card, [Common: grey fragments] / [Rare: blue glowing fragments] / [Epic: purple energy fragments] / [Legendary: golden radiant fragments], transparent background` |
| 合成光效关键帧 | `fusion synthesis VFX, two cards merging with crossing light beams, energy collision at center, explosion of light, triumphant moment, transparent background` |
| 进化形态对比 | `evolution comparison art, left side: basic form of [character], right side: awakened/evolved form of same character, dramatic visual upgrade, split composition` |

---

## 九、执行顺序与产出清单

```
Phase 0  → 10 张核心卡牌插画（先出冰霜女王定风格，再批量）
Phase 1  → 10 张 Q 版头像 + 4 种稀有度边框
Phase 2  → 34 款卡背设计
Phase 3  → 5 张元素场景 + 2 张棋盘
Phase 4  → ~31 个 UI 图标
Phase 5  → 10 卡 × 3 阶段升星外观（30 张）
Phase 6  → VFX 关键帧（~30 组，每组 4-8 帧）
Phase 7  → 碎片图标 + 合成光效 + 进化对比
```

**总素材量估算：约 200+ 张 / 组**

---

## 五、提示词使用指南

### 5.1 Midjourney 格式
- 在提示词末尾追加：`--ar 3:4 --s 750 --q 2 --v 6.1`
- 横版场景：`--ar 16:9 --s 750 --q 2 --v 6.1`
- 方形图标：`--ar 1:1 --s 500 --q 2 --v 6.1`
- **负面提示词**：`--no text, watermark, signature, blurry, deformed`
- **风格控制**：使用 `--style raw` 或 `--sref [参考图URL]` 锁定风格

### 5.2 Stable Diffusion 格式
- 推荐模型：`DreamShaper` / `AnythingV5`（半写实东方奇幻风格）
- **Negative prompt**：
```
blurry, low quality, text, watermark, deformed, ugly, extra fingers, bad anatomy,
bad proportions, disfigured, poorly drawn face, mutation, extra limbs, amateur,
cropped, out of frame, worst quality, low resolution
```
- CFG Scale: 7-9, Steps: 30-50

### 5.3 一致性保障策略（Consistency Assurance）
1. **风格锁定**：使用 seed 固定 + 风格参考图（Style Reference）
2. **角色一致性**：同一角色不同阶段使用 img2img + 权重 0.6-0.7
3. **元素色调**：建立色板参考图，每个元素生成前先确认色调
4. **批量生成**：同一阶段使用相同 negative prompt + 相近 seed

### 5.4 质量控制
- 每个提示词生成 3-5 个变体，选最优
- 同一卡牌不同稀有度的变体需保持角色一致（使用 img2img 或 ControlNet 参考）
- 批量生成时固定随机种子（seed），微调提示词保持风格统一

### 5.5 素材命名规范（Naming Convention）
命名格式：`{类型}_{卡牌ID}_{变体}_{序号}.{ext}`

**示例**：
- `card_iron_guardian_full_01.png`      # 铁卫守卫全身插画
- `avatar_frost_queen_chibi_01.png`     # 冰霜女王Q版头像
- `border_legendary_01.png`             # 传说边框
- `scene_ice_01.png`                    # 冰原场景
- `vfx_attack_fire_01_001.png`          # 火系攻击特效第1帧
- `card_back_warrior_natural_01.png`    # 战士自然系卡背
- `icon_coin_gold_01.png`              # 金币图标
- `fragment_epic_purple_01.png`         # 史诗碎片图标

**类型前缀**：
- `card_`：卡牌全身插画
- `avatar_`：Q版头像
- `border_`：稀有度边框
- `scene_`：场景背景
- `board_`：对战棋盘
- `vfx_`：特效序列帧
- `icon_`：UI图标
- `fragment_`：碎片图标

### 5.6 质量评估标准（Quality Assessment）
每个素材需通过以下评估（5分制），总分≥18分方可通过：

1. **风格一致性**（与Style Anchor匹配度）：≥4分
2. **角色辨识度**（能否一眼认出角色）：≥4分
3. **细节丰富度**（服饰/武器/特效细节）：≥3分
4. **构图合理性**（角色姿态/背景层次）：≥3分
5. **技术质量**（清晰度/无瑕疵/无畸变）：≥4分

**评估流程**：
- 生成3-5个变体后，逐个打分
- 选择总分最高的变体
- 如所有变体均未达标，调整提示词重新生成

---

## 六、成本估算（Cost Estimation）

### 工具成本对比

| 工具 | 成本 | 优势 | 劣势 |
|---|---|---|---|
| Midjourney v6.1 | $30/月（Standard Plan，约900次生成） | 高质量、易用、风格稳定 | 无法本地部署、风格控制有限 |
| Stable Diffusion (本地) | $0（需GPU，如RTX 3060 12GB） | 完全控制、无限制、可定制模型 | 需要技术能力、质量需调参 |
| DALL-E 3 | $0.04/张（API调用） | API调用方便、集成简单 | 风格偏写实、不如MJ精细 |
| ComfyUI + SD | $0（需GPU） | 工作流可视化、批量处理 | 学习曲线陡峭 |

### 本项目成本估算

**方案A：Midjourney为主**
- 每张素材平均 4 次生成 = 800 次
- 预计需要 1 个月 Standard Plan = **$30**

**方案B：本地Stable Diffusion**
- 硬件成本：RTX 3060 12GB ≈ ¥2000（一次性）
- 电费：约 ¥50/月
- 总计：**¥2050 首月 + ¥50/月**

**方案C：混合方案（推荐）**
- 本地SD生成初稿（80%素材）= $0
- Midjourney精修关键素材（20%）= $6
- 总计：**$6/月**

**成本优化建议**：
- 使用本地 Stable Diffusion 生成初稿，Midjourney 用于精修
- 批量生成时使用相同 seed，减少重试次数
- 优先生成高价值素材（传说卡牌、核心UI）
- 建立素材复用机制，减少重复生成

## 七、引擎集成说明（Engine Integration）

素材最终需导入 Cocos Creator 3.x，流程如下：

1. **AI 生成 → PNG 原图**
2. **Photoshop/Figma 裁剪 + 优化**（压缩至合适大小）
3. **导入 Cocos Creator 资源目录**（`assets/resources/` 或 `assets/bundles/`）
4. **设置 Sprite Frame 属性**（九宫格/旋转/填充模式）
5. **打包到 Asset Bundle**（按需加载，减少首包大小）

**格式优化要求**：
- 卡牌插画：PNG-24，透明背景，压缩至 200-500KB
- UI 图标：PNG-8 或 WebP，128×128，<50KB
- VFX 序列帧：PNG 序列或 WebM，单帧 <100KB
- 场景背景：JPG（无透明需求时），质量 80%，<1MB

**性能考虑**：
- 使用纹理压缩（ASTC/ETC2）适配移动端
- 大尺寸素材（场景/卡牌）按需加载，避免内存峰值
- 特效使用对象池复用，减少 GC 压力

## 八、进度跟踪表（Progress Tracking）

| Phase | 素材类型 | 总数 | 完成 | 状态 | 备注 |
|---|---|---|---|---|---|
| P0 | 核心卡牌插画 | 10 | 10/10 | ✅ 已完成 | 提示词+变体文件夹+生成图片 |
| P1 | Q版头像+边框 | 14 | 2/14 | 🔄 进行中 | 冰霜女王+圣光先知提示词已创建 |
| P2 | 卡背设计 | 34 | 0/34 | ⏳ 待开始 | 6元素×5职业+基础+传说 |
| P3 | 场景+棋盘 | 8 | 0/8 | ⏳ 待开始 | 6元素场景+2棋盘 |
| P4 | UI图标 | ~31 | 0/31 | ⏳ 待开始 | 含技能书图标 |
| P5 | 升星外观 | 30 | 0/30 | ⏳ 待开始 | 10卡×3阶段 |
| P6 | VFX特效 | ~30组 | 0/30 | ⏳ 待开始 | 每组含多帧 |
| P7 | 合成/碎片 | ~15 | 0/15 | ⏳ 待开始 | 依赖P0 |

**总计**：约 172+ 素材/组

**进度更新规则**：
- 每完成一个Phase，更新状态为"✅ 已完成"
- 记录实际完成数量与预计差异
- 标注遇到的问题和解决方案

---

## 九、下一步

确认本计划后，可按 Phase 0 → Phase 1 → ... 逐步执行，每个 Phase 产出一批可用素材。
