/**
 * 定点数运算模块
 * 
 * 用于战斗引擎的确定性数值计算，确保客户端/服务端跨端结果完全一致。
 * 
 * 实现策略：
 * - 伤害计算使用普通浮点数（JavaScript Number 是 IEEE 754 double，同一引擎下结果一致）
 * - 随机数使用种子随机（确保跨端随机序列一致）
 * - 浮点运算的确定性由"同一 JavaScript 引擎 + 同一操作顺序"保证
 * 
 * 参见 docs/data/fixed-point-spec.md
 */

// ============ 伤害计算辅助函数 ============

/** 计算减伤率：DEF / (DEF + K) */
export function calcDmgReduction(def: number, k: number = 500): number {
  return def / (def + k);
}

/** 计算最终伤害（整数） */
export function calcFinalDamage(
  atkStat: number,
  skillMultiplier: number,
  elemBonus: number,
  dmgReduction: number,
  critMultiplier: number,
  variance: number
): number {
  let damage = atkStat * skillMultiplier;
  damage *= (1 + elemBonus);
  damage *= (1 - dmgReduction);
  damage *= critMultiplier;
  damage *= variance;
  return Math.max(Math.ceil(damage), 1);
}

// ============ 常用常量 ============

export const DEF_CURVE_K = 500;
export const ELEM_ADVANTAGE = 0.25;
export const ELEM_DISADVANTAGE = -0.15;
export const DAMAGE_VARIANCE_MIN = 0.95;
export const DAMAGE_VARIANCE_MAX = 1.05;
export const MIN_DAMAGE = 1;
