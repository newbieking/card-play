/**
 * 伤害计算模块
 * 
 * 经典双曲线防御公式（源自 combat-system.md）：
 *   减伤率 = DEF / (DEF + K)，K = 500
 *   物理伤害 = ATK × 技能倍率 × (1 + 元素克制) × (1 - 减伤率)
 *   法术伤害 = MATK × 技能倍率 × (1 + 元素克制) × (1 - 减伤率)
 */

import { DeterministicRandom } from './Random';
import { ElementSystem, Element } from './ElementSystem';
import { calcDmgReduction, calcFinalDamage } from './Fixed';

/** 伤害类型 */
export type DamageType = 'physical' | 'magical' | 'true' | 'fixed';

/** 伤害计算输入 */
export interface DamageInput {
  attackerAtk: number;      // 物理攻击
  attackerMatk: number;     // 法术强度
  attackerElement: Element; // 攻击方元素
  attackerCritRate: number; // 暴击率 (0~1)
  attackerCritDmg: number;  // 暴击伤害倍率 (如 1.5)

  defenderDef: number;      // 物理防御
  defenderMdef: number;     // 法术抗性
  defenderElement: Element; // 防御方元素

  skillMultiplier: number;  // 技能倍率
  damageType: DamageType;   // 伤害类型

  defCurveK: number;        // 防御曲线 K 值（默认 500）
}

/** 伤害计算结果 */
export interface DamageResult {
  rawDamage: number;        // 基础伤害（未减伤）
  elemBonus: number;        // 元素克制倍率
  dmgReduction: number;     // 减伤率
  isCrit: boolean;          // 是否暴击
  finalDamage: number;      // 最终伤害（取整）
}

/** 伤害计算工具类 */
export class DamageCalc {
  private rng: DeterministicRandom;

  constructor(rng: DeterministicRandom) {
    this.rng = rng;
  }

  /** 计算伤害 */
  calculate(input: DamageInput): DamageResult {
    const K = input.defCurveK || 500;

    // 1. 确定攻击面板和防御面板
    let atkStat: number;
    let defStat: number;

    if (input.damageType === 'physical') {
      atkStat = input.attackerAtk;
      defStat = input.defenderDef;
    } else if (input.damageType === 'magical') {
      atkStat = input.attackerMatk;
      defStat = input.defenderMdef;
    } else {
      // true damage / fixed damage：无视防御
      atkStat = input.attackerAtk;
      defStat = 0;
    }

    // 2. 基础伤害 = ATK × 技能倍率
    const rawDamage = Math.round(atkStat * input.skillMultiplier);

    // 3. 元素克制
    const elemBonus = ElementSystem.getModifier(
      input.attackerElement,
      input.defenderElement
    );

    // 4. 双曲线减伤率 = DEF / (DEF + K)
    let dmgReduction: number;
    if (input.damageType === 'true' || input.damageType === 'fixed') {
      dmgReduction = 0; // 无视防御
    } else {
      dmgReduction = calcDmgReduction(defStat, K);
    }

    // 5. 暴击判定
    const critRoll = this.rng.next();
    const isCrit = critRoll < input.attackerCritRate;
    const critMultiplier = isCrit ? input.attackerCritDmg : 1.0;

    // 6. 浮动 ±5%
    const variance = this.rng.nextFloat(0.95, 1.05);

    // 7. 最终伤害计算
    const finalDamage = calcFinalDamage(
      atkStat, input.skillMultiplier, elemBonus,
      dmgReduction, critMultiplier, variance
    );

    return {
      rawDamage,
      elemBonus,
      dmgReduction,
      isCrit,
      finalDamage,
    };
  }

  /** 获取防御收益表（用于预计算/验证） */
  static getDefReductionTable(k: number, maxDef: number = 5000): number[] {
    const table: number[] = [];
    for (let def = 0; def <= maxDef; def++) {
      table.push(calcDmgReduction(def, k));
    }
    return table;
  }
}
