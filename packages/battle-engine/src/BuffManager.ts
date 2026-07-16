/**
 * Buff/Debuff 管理模块
 * 
 * 状态效果 6 大类（源自 combat-system.md）：
 *   buff / debuff / control / dot / shield / special
 * 
 * 结算优先级：沉默 → 眩晕 → 冰冻 → 其他
 * DOT 在回合结束阶段统一结算
 */

export type BuffCategory = 'buff' | 'debuff' | 'control' | 'dot' | 'shield' | 'special';

export type StackBehavior = 'refresh' | 'independent' | 'intensify';

export interface BuffDef {
  id: string;
  name: string;
  category: BuffCategory;
  subType: string;
  defaultDuration: number;    // 持续回合数（0 = 永久/护盾）
  maxStack: number;           // 最大叠加层数
  stackBehavior: StackBehavior;
  dispellable: boolean;
}

export interface ActiveBuff {
  def: BuffDef;
  stacks: number;             // 当前层数
  remainingTurns: number;     // 剩余回合数
  sourceId: string;           // 施加者 ID
}

/** Buff 管理器 */
export class BuffManager {
  private buffs: Map<string, ActiveBuff[]> = new Map();

  /** 给单位添加 Buff */
  addBuff(unitId: string, buffDef: BuffDef, sourceId: string): void {
    const existing = this.buffs.get(unitId) || [];
    const existingBuff = existing.find(b => b.def.id === buffDef.id);

    if (existingBuff) {
      // 已存在同名 Buff
      if (buffDef.stackBehavior === 'refresh') {
        // 刷新持续时间
        existingBuff.remainingTurns = buffDef.defaultDuration;
      } else if (buffDef.stackBehavior === 'intensify') {
        // 叠加层数
        if (existingBuff.stacks < buffDef.maxStack) {
          existingBuff.stacks++;
        }
        existingBuff.remainingTurns = buffDef.defaultDuration;
      }
      // independent：不做任何处理（各自独立计时）
    } else {
      // 新 Buff
      existing.push({
        def: buffDef,
        stacks: 1,
        remainingTurns: buffDef.defaultDuration,
        sourceId,
      });
    }

    this.buffs.set(unitId, existing);
  }

  /** 移除指定 Buff */
  removeBuff(unitId: string, buffId: string): boolean {
    const existing = this.buffs.get(unitId) || [];
    const index = existing.findIndex(b => b.def.id === buffId);
    if (index >= 0) {
      existing.splice(index, 1);
      this.buffs.set(unitId, existing);
      return true;
    }
    return false;
  }

  /** 净化（移除所有可净化的 debuff） */
  dispel(unitId: string, onlyDebuffs: boolean = true): number {
    const existing = this.buffs.get(unitId) || [];
    const removed: number = [];
    const remaining: ActiveBuff[] = [];

    for (const buff of existing) {
      if (buff.def.dispellable && (!onlyDebuffs || buff.def.category === 'debuff' || buff.def.category === 'dot')) {
        removed.push(buff);
      } else {
        remaining.push(buff);
      }
    }

    this.buffs.set(unitId, remaining);
    return removed.length;
  }

  /** 回合结束时结算（DOT/HoT tick） */
  tickTurnEnd(unitId: string): { dotDamage: number; hotHeal: number } {
    const existing = this.buffs.get(unitId) || [];
    let dotDamage = 0;
    let hotHeal = 0;

    for (const buff of existing) {
      if (buff.def.category === 'dot') {
        // DOT 伤害（这里只返回标记，实际伤害由引擎计算）
        dotDamage += buff.stacks; // 返回层数，引擎用施法者 ATK × 倍率 × 层数
      }
      if (buff.def.subType === 'heal_over_time') {
        hotHeal += buff.stacks;
      }
    }

    return { dotDamage, hotHeal };
  }

  /** 回合开始时：减少所有 Buff 剩余回合数，移除过期 Buff */
  tickTurnStart(unitId: string): ActiveBuff[] {
    const existing = this.buffs.get(unitId) || [];
    const expired: ActiveBuff[] = [];
    const remaining: ActiveBuff[] = [];

    for (const buff of existing) {
      if (buff.def.defaultDuration === 0) {
        // 永久 Buff（如护盾），不减少回合
        remaining.push(buff);
        continue;
      }

      buff.remainingTurns--;
      if (buff.remainingTurns <= 0) {
        expired.push(buff);
      } else {
        remaining.push(buff);
      }
    }

    this.buffs.set(unitId, remaining);
    return expired;
  }

  /** 检查单位是否有指定 Buff */
  hasBuff(unitId: string, buffId: string): boolean {
    const existing = this.buffs.get(unitId) || [];
    return existing.some(b => b.def.id === buffId);
  }

  /** 检查单位是否被控制（跳过行动） */
  isControlled(unitId: string): { controlled: boolean; reason?: string } {
    const existing = this.buffs.get(unitId) || [];

    // 结算优先级：眩晕 > 冰冻 > 沉默
    if (existing.some(b => b.def.subType === 'stun')) {
      return { controlled: true, reason: 'stun' };
    }
    if (existing.some(b => b.def.subType === 'freeze')) {
      return { controlled: true, reason: 'freeze' };
    }
    if (existing.some(b => b.def.subType === 'silence')) {
      return { controlled: true, reason: 'silence' };
    }

    return { controlled: false };
  }

  /** 检查单位是否被沉默（无法使用技能） */
  isSilenced(unitId: string): boolean {
    const existing = this.buffs.get(unitId) || [];
    return existing.some(b => b.def.subType === 'silence');
  }

  /** 获取单位所有 Buff */
  getBuffs(unitId: string): ActiveBuff[] {
    return this.buffs.get(unitId) || [];
  }

  /** 获取单位的属性修正总和 */
  getStatModifiers(unitId: string): { atk: number; def: number; matk: number; mdef: number; spd: number } {
    const existing = this.buffs.get(unitId) || [];
    const mods = { atk: 0, def: 0, matk: 0, mdef: 0, spd: 0 };

    for (const buff of existing) {
      if (buff.def.category === 'buff' || buff.def.category === 'debuff') {
        // stat_modifier 需要从配置中解析
        // 这里简化处理，实际应从 BuffDef 的 statModifier 字段解析
      }
    }

    return mods;
  }
}
