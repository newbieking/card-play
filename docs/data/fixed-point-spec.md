# 定点数实现规范

> 配套文档：`combat-system.md`（伤害公式）、`battle-protocol.md`（确定性保障）、`battle-engine-sharing.md`（引擎共用）
> 目标：定义战斗引擎中数值计算的定点数实现方案，确保客户端/服务端跨端计算结果完全一致

---

## 一、为什么需要定点数

### 1.1 浮点数的问题

```
JavaScript 中的 Number 是 64 位浮点数（IEEE 754 double）

问题示例：
0.1 + 0.2 = 0.30000000000000004  // 不等于 0.3！

不同平台/引擎的浮点实现可能有微小差异：
- V8 (Node.js/Chrome) 的 Math.round 行为
- SpiderMonkey (Firefox) 的浮点精度
- 移动端 JavaScriptCore 的实现

对于确定性战斗，0.0000001 的差异经过多回合累积会导致完全不同的结果
```

### 1.2 定点数的优势

| 维度 | 浮点数 | 定点数 |
|---|---|---|
| 精度 | 依平台而异 | 绝对一致 |
| 确定性 | ❌ 跨平台可能不一致 | ✅ 整数运算，100% 一致 |
| 性能 | 快（硬件加速） | 中（需要自定义运算） |
| 溢出风险 | 低 | 中（需选择足够位数） |
| 实现复杂度 | 低 | 中 |

---

## 二、定点数方案选型

### 2.1 方案对比

| 方案 | 精度 | 范围 | 性能 | 实现难度 |
|---|---|---|---|---|
| **Int32 定点（Q16.16）** | 1/65536 ≈ 0.000015 | ±32767 | ⭐⭐⭐⭐⭐ | ⭐⭐ |
| **Int64 定点（Q32.32）** | 极高 | 极大 | ⭐⭐⭐ | ⭐⭐⭐ |
| **Int32 纯整数** | 无小数 | ±21 亿 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **第三方库（如 fixed-ts）** | 可配置 | 可配置 | ⭐⭐⭐⭐ | ⭐⭐ |

### 2.2 推荐方案：Int32 Q16.16 定点数

```
Q16.16 格式：
- 总共 32 位
- 高 16 位：整数部分（范围 0~32767）
- 低 16 位：小数部分（精度 1/65536 ≈ 0.000015）

存储方式：直接用 JavaScript 的 32 位整数运算（Math.imul）
数值范围：0 ~ 32767.99998
精度：0.000015（足够伤害计算使用）

示例：
  1.0  → 65536 (0x00010000)
  0.5  → 32768 (0x00008000)
  0.25 → 16384 (0x00004000)
  500  → 32768000 (0x01F40000)  // K 值
```

### 2.3 选择理由

1. **精度足够**：伤害值通常是整数或保留 1-2 位小数，Q16.16 的精度远超需求
2. **性能优秀**：纯整数运算，JavaScript 的 Math.imul 原生支持 32 位整数乘法
3. **溢出可控**：伤害值通常在 0~100000 范围内，Q16.16 可表示到 32767，实际伤害用 100 倍表示（即伤害 1000 存储为 100000），范围足够
4. **简单易懂**：不需要引入第三方库，代码量少

---

## 三、定点数运算实现

### 3.1 基础定义

```typescript
// 定点数类型（Q16.16 格式）
type Fixed = number;  // 实际存储为 32 位整数

const FIXED_BITS = 16;
const FIXED_ONE = 1 << FIXED_BITS;  // 65536，代表 1.0
const FIXED_HALF = FIXED_ONE >> 1;  // 32768，代表 0.5

// 创建定点数
function fixedFromInt(n: number): Fixed {
  return n << FIXED_BITS;
}

function fixedFromFloat(n: number): Fixed {
  return Math.round(n * FIXED_ONE);
}

// 转回普通数字（仅用于显示）
function fixedToNumber(f: Fixed): number {
  return f / FIXED_ONE;
}

// 转为整数（伤害值通常取整）
function fixedToInt(f: Fixed): number {
  return f >> FIXED_BITS;
}
```

### 3.2 四则运算

```typescript
// 加法
function fixedAdd(a: Fixed, b: Fixed): Fixed {
  return a + b;
}

// 减法
function fixedSub(a: Fixed, b: Fixed): Fixed {
  return a - b;
}

// 乘法（关键！需要 Math.imul 避免浮点）
function fixedMul(a: Fixed, b: Fixed): Fixed {
  return Math.imul(a, b) >> FIXED_BITS;
}

// 除法
function fixedDiv(a: Fixed, b: Fixed): Fixed {
  // 先左移避免精度丢失，再除法
  return Math.round((a << FIXED_BITS) / b);
}
```

### 3.3 伤害计算示例

```typescript
// 原始公式：
// 物理伤害 = ATK × 技能倍率 × (1 + 元素克制) × (1 - DEF/(DEF + K))

function calcDamage(
  atk: number,           // 原始整数
  skillMultiplier: number, // 原始浮点（如 1.5）
  elemBonus: number,     // 原始浮点（如 0.25）
  def: number,           // 原始整数
  k: number              // 常量 500
): number {
  // 转为定点数
  const fAtk = fixedFromInt(atk);
  const fMult = fixedFromFloat(skillMultiplier);
  const fElem = fixedFromFloat(elemBonus);
  const fDef = fixedFromInt(def);
  const fK = fixedFromInt(k);
  const fOne = fixedFromInt(1);
  
  // 计算减伤率：DEF / (DEF + K)
  const defPlusK = fixedAdd(fDef, fK);
  const dmgReduction = fixedDiv(fDef, defPlusK);
  
  // 计算基础伤害
  let baseDmg = fixedMul(fAtk, fMult);
  
  // 元素克制
  const elemMod = fixedAdd(fOne, fElem);
  baseDmg = fixedMul(baseDmg, elemMod);
  
  // 减伤
  const oneMinusReduction = fixedSub(fOne, dmgReduction);
  const finalDmg = fixedMul(baseDmg, oneMinusReduction);
  
  // 转回整数伤害
  return fixedToInt(finalDmg);
}
```

### 3.4 验证：calcDamage(500, 1.5, 0.25, 300, 500)

```
手动计算：
基础伤害 = 500 × 1.5 = 750
元素加成 = 750 × 1.25 = 937.5
减伤率 = 300 / (300 + 500) = 0.375
最终伤害 = 937.5 × (1 - 0.375) = 937.5 × 0.625 = 585.9375
取整 = 585

定点数计算：
fAtk = 500 << 16 = 32768000
fMult = round(1.5 × 65536) = 98304
fElem = round(0.25 × 65536) = 16384
fDef = 300 << 16 = 19660800
fK = 500 << 16 = 32768000
fOne = 65536

defPlusK = 19660800 + 32768000 = 52428800
dmgReduction = round((19660800 << 16) / 52428800) = 24576 (= 0.375)
baseDmg = Math.imul(32768000, 98304) >> 16 = 49152000 (= 750.0)
elemMod = 65536 + 16384 = 81920 (= 1.25)
baseDmg = Math.imul(49152000, 81920) >> 16 = 61440000 (= 937.5)
oneMinusReduction = 65536 - 24576 = 40960 (= 0.625)
finalDmg = Math.imul(61440000, 40960) >> 16 = 38400000 (= 585.9375)
fixedToInt(38400000) = 38400000 >> 16 = 585 ✅
```

---

## 四、浮点随机数的确定性处理

### 4.1 问题

```
战斗中需要随机数（暴击判定、伤害浮动 ±5%）
不同平台的 Math.random() 实现不同，结果不一致
```

### 4.2 解决方案：种子随机数

```typescript
// 使用 Mulberry32 算法（轻量级、确定性）
function mulberry32(seed: number): () => number {
  let state = seed | 0;
  return function() {
    state = (state + 0x6D2B79F5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// 使用示例
const rng = mulberry32(battleSeed);
const critRoll = rng();      // [0, 1) 确定性随机
const dmgVariance = 0.95 + rng() * 0.1;  // [0.95, 1.05)
```

### 4.3 随机数用途分类

| 用途 | 随机源 | 说明 |
|---|---|---|
| 暴击判定 | rng_salt（服务端专用） | 不下发客户端 |
| 伤害浮动 | seed（下发客户端） | 用于表现层抖动 |
| 元素触发 | rng_salt | 服务端专用 |
| 掉落判定 | rng_salt | 服务端专用 |

---

## 五、跨端一致性验证

### 5.1 测试用例

```typescript
// 测试框架：Vitest
describe('Fixed Point Consistency', () => {
  const testCases = [
    { atk: 500, mult: 1.5, elem: 0.25, def: 300, k: 500, expected: 585 },
    { atk: 1000, mult: 2.0, elem: 0.0, def: 500, k: 500, expected: 1000 },
    { atk: 100, mult: 1.0, elem: -0.15, def: 1000, k: 500, expected: 28 },
    { atk: 2000, mult: 3.0, elem: 0.25, def: 0, k: 500, expected: 6000 },
  ];

  testCases.forEach(({ atk, mult, elem, def, k, expected }) => {
    it(`calcDamage(${atk}, ${mult}, ${elem}, ${def}, ${k}) = ${expected}`, () => {
      expect(calcDamage(atk, mult, elem, def, k)).toBe(expected);
    });
  });
});
```

### 5.2 一致性验证流程

```
1. 在 Node.js 环境运行测试 → 记录所有结果
2. 在 Cocos Creator 环境运行相同测试 → 记录所有结果
3. 比对两个环境的结果 → 必须 100% 一致
4. 在微信小游戏环境运行 → 再次验证
5. 将测试用例纳入 CI → 每次构建自动验证
```

---

## 六、性能优化

### 6.1 常见优化

| 优化 | 说明 | 性能提升 |
|---|---|---|
| 预计算减伤率表 | 将 DEF 0~5000 的减伤率预先算好存数组 | 查表替代除法 |
| 位运算替代乘除 | 用移位替代 ×2 / ÷2 | 微小提升 |
| 批量计算 | 一次遍历结算所有单位的伤害 | 减少函数调用 |

### 6.2 减伤率预计算表

```typescript
// 预计算 DEF 0~5000 的减伤率（Q16.16 格式）
const DEF_TABLE_SIZE = 5001;
const K = 500;
const dmgReductionTable: Fixed[] = new Array(DEF_TABLE_SIZE);

for (let def = 0; def < DEF_TABLE_SIZE; def++) {
  dmgReductionTable[def] = fixedDiv(
    fixedFromInt(def),
    fixedAdd(fixedFromInt(def), fixedFromInt(K))
  );
}

// 使用时直接查表
function getDmgReduction(def: number): Fixed {
  return dmgReductionTable[Math.min(def, DEF_TABLE_SIZE - 1)];
}
```

---

## 七、决策状态

| # | 问题 | 决策 | 状态 |
|---|---|---|---|
| 1 | 定点数格式 | ✅ Q16.16（Int32，精度 1/65536） | 已定 |
| 2 | 运算库 | ✅ 原生 Math.imul + 位运算（无第三方依赖） | 已定 |
| 3 | 随机数算法 | ✅ Mulberry32 种子随机 | 已定 |
| 4 | 减伤率优化 | ✅ 预计算查表（DEF 0~5000） | 已定 |
| 5 | 一致性验证 | ✅ Vitest 跨端测试 + CI 自动验证 | 已定 |
| 6 | 精度溢出处理 | 伤害值上限 32767，足够使用 | 已定 |
