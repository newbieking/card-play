/**
 * 元素克制系统
 * 
 * 元素克制关系（源自 combat-system.md）：
 *   火 → 冰 → 雷电 → 水 → 火（循环克制）
 *   光 ⇄ 暗（互克）
 *   自然 → 中立（不被克制，也不克制任何元素）
 * 
 * 克制伤害加成：+25%
 * 被克制减伤：+15%
 */

export type Element = 'fire' | 'ice' | 'thunder' | 'water' | 'light' | 'dark' | 'nature';

/** 元素克制关系表：key 克制 value 数组中的元素 */
const ADVANTAGE_MAP: Record<Element, Element[]> = {
  fire:     ['ice'],
  ice:      ['thunder'],
  thunder:  ['water'],
  water:    ['fire'],
  light:    ['dark'],
  dark:     ['light'],
  nature:   [],
};

/** 获取元素克制倍率 */
export function getElementModifier(attackerElement: Element, defenderElement: Element): number {
  if (ADVANTAGE_MAP[attackerElement]?.includes(defenderElement)) {
    return 0.25; // 克制 +25%
  }
  if (ADVANTAGE_MAP[defenderElement]?.includes(attackerElement)) {
    return -0.15; // 被克制 -15%
  }
  return 0; // 无克制关系
}

/** 检查元素 A 是否克制元素 B */
export function isElementAdvantage(a: Element, b: Element): boolean {
  return ADVANTAGE_MAP[a]?.includes(b) ?? false;
}

// 兼容旧接口
export const ElementSystem = {
  getModifier: getElementModifier,
  isAdvantage: isElementAdvantage,
};
