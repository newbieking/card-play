/**
 * 共享类型定义
 * 
 * 客户端/服务端/战斗引擎共用的类型
 */

// ============ 卡牌相关 ============

export type Rarity = 'common' | 'rare' | 'epic' | 'legendary';
export type CardClass = 'warrior' | 'mage' | 'warlock' | 'archer' | 'priest';
export type Element = 'fire' | 'ice' | 'thunder' | 'water' | 'light' | 'dark' | 'nature';

export interface CardDef {
  id: string;
  name: string;
  rarity: Rarity;
  class: CardClass;
  element: Element;
  maxStar: number;
  baseHp: number;
  baseAtk: number;
  baseMatk: number;
  baseDef: number;
  baseMdef: number;
  baseSpd: number;
  baseCrit: number;
  baseCritDmg: number;
  baseLifesteal?: number;
}

export interface CardInstance {
  id: string;
  playerId: string;
  cardDefId: string;
  level: number;
  star: number;
  exp: number;
  qualityVariant: number;
  skill1Lv: number;
  skill2Lv: number;
  skill3Lv: number;
}

// ============ 技能相关 ============

export type SkillType = 'active' | 'passive' | 'ultimate';
export type DamageType = 'physical' | 'magical';
export type TargetType = 'self' | 'single_enemy' | 'all_enemy' | 'single_ally' | 'all_ally' | 'front_row' | 'back_row';

export interface SkillDef {
  id: string;
  cardId: string;
  name: string;
  type: SkillType;
  damageType: DamageType;
  targetType: TargetType;
  effectType: string;
  damageMultiplier?: number;
  healMultiplier?: number;
  buffId?: string;
  buffDuration?: number;
  cooldown?: number;
  rageCost?: number;
  description: string;
}

// ============ Buff 相关 ============

export type BuffCategory = 'buff' | 'debuff' | 'control' | 'dot' | 'shield' | 'special';
export type StackBehavior = 'refresh' | 'independent' | 'intensify';

export interface BuffDef {
  id: string;
  name: string;
  category: BuffCategory;
  subType: string;
  statModifier?: Record<string, number>;
  dotMultiplier?: number;
  shieldRatio?: number;
  defaultDuration: number;
  maxStack: number;
  stackBehavior: StackBehavior;
  dispellable: boolean;
  vfxId?: string;
  priority?: number;
  description: string;
}

// ============ 资源相关 ============

export interface PlayerResource {
  gold: number;
  diamondFree: number;
  diamondPaid: number;
  stamina: number;
  staminaMax: number;
  staminaRecoveryAt: number;
  expPotion: number;
  starStone: number;
  skillBook: number;
}

// ============ 战斗相关 ============

export interface BattleFormation {
  positions: Array<{
    pos: number;
    cardInstanceId: string;
    row: 'front' | 'back';
  }>;
  totalPower: number;
}

// ============ PVP 相关 ============

export interface ArenaData {
  playerId: string;
  score: number;
  tier: string;
  defensePower: number;
  wins: number;
  losses: number;
  winStreak: number;
  seasonId: number;
  seasonScore: number;
}

// ============ 配置表常量 ============

export const GLOBAL_CONST = {
  COMBAT_DEF_CURVE_K: 500,
  COMBAT_ELEM_ADVANTAGE_DMG: 0.25,
  COMBAT_ELEM_DISADVANTAGE_DMG: -0.15,
  COMBAT_DMG_RANDOM_MIN: 0.95,
  COMBAT_DMG_RANDOM_MAX: 1.05,
  COMBAT_MIN_DMG: 1,
  COMBAT_RAGE_MAX: 100,
  COMBAT_RAGE_PER_HIT: 20,
  COMBAT_RAGE_PER_TAKEN: 10,
  COMBAT_RAGE_PER_KILL: 30,
  COMBAT_TURN_TIMEOUT_S: 30,
  COMBAT_MAX_TURNS: 50,
  PVP_DEFENDER_HP_BONUS: 0.10,
  PVP_WIN_STREAK_BONUS_SCORE: 5,
} as const;
