/**
 * 战斗引擎核心
 * 
 * 确定性回合制战斗引擎，客户端/服务端共用同一份实现。
 * 参见 docs/combat/battle-protocol.md
 */

import { DeterministicRandom } from './Random';
import { DamageCalc, DamageInput, DamageResult } from './DamageCalc';
import { BuffManager, BuffDef } from './BuffManager';
import { Element } from './ElementSystem';

// ============ 类型定义 ============

export type Side = 'player' | 'enemy';
export type ActionType = 'attack' | 'skill' | 'ultimate' | 'passive_trigger' | 'buff_tick' | 'dot_tick';
export type SkillType = 'active' | 'passive' | 'ultimate';
export type DamageType = 'physical' | 'magical';
export type BattleStatus = 'preparing' | 'in_progress' | 'finished';

export interface CardState {
  id: string;
  side: Side;
  row: 'front' | 'back';
  index: number;

  // 基础属性（运行时计算）
  hp: number;
  maxHp: number;
  atk: number;
  matk: number;
  def: number;
  mdef: number;
  spd: number;
  critRate: number;
  critDmg: number;

  // 元素
  element: Element;

  // 技能
  skill1Id?: string;      // 主动技能 ID
  skill1RageCost: number; // 主动技能怒气消耗
  skill3Id?: string;      // 终极技能 ID
  skill3Cooldown: number; // 终极技能冷却回合数
  skill3MaxCooldown: number;

  // 状态
  rage: number;           // 怒气值（0-100）
  isAlive: boolean;
}

export interface BattleFrame {
  turn: number;
  side: Side;
  actions: BattleAction[];
}

export interface BattleAction {
  type: ActionType;
  sourceId: string;
  targetIds: string[];
  skillId?: string;
  damageType?: DamageType;
  damageResult?: DamageResult;
}

export interface BattleStartRequest {
  battleId: string;
  seed: number;
  rngSalt: number;
  playerFormation: CardState[];
  enemyFormation: CardState[];
}

export interface BattleEndResult {
  winner: Side | 'draw';
  frames: BattleFrame[];
  playerHp: number[];
  enemyHp: number[];
}

// ============ 战斗引擎 ============

export class BattleEngine {
  private rng: DeterministicRandom;
  private rngSalt: DeterministicRandom;
  private damageCalc: DamageCalc;
  private buffManager: BuffManager;

  private battleId: string;
  private turn: number = 0;
  private maxTurns: number = 50;
  private status: BattleStatus = 'preparing';

  private playerUnits: CardState[] = [];
  private enemyUnits: CardState[] = [];
  private allUnits: CardState[] = [];

  private frames: BattleFrame[] = [];

  // 全局常量（来自 global_const）
  private static readonly RAGE_MAX = 100;
  private static readonly RAGE_PER_HIT = 20;
  private static readonly RAGE_PER_TAKEN = 10;
  private static readonly RAGE_PER_KILL = 30;
  private static readonly DEF_CURVE_K = 500;

  constructor(battleId: string, seed: number, rngSalt: number) {
    this.battleId = battleId;
    this.rng = new DeterministicRandom(seed);
    this.rngSalt = new DeterministicRandom(rngSalt);
    this.damageCalc = new DamageCalc(this.rngSalt);
    this.buffManager = new BuffManager();
  }

  /** 加载战斗阵容 */
  loadFormation(playerCards: CardState[], enemyCards: CardState[]): void {
    this.playerUnits = playerCards;
    this.enemyUnits = enemyCards;
    this.allUnits = [...playerCards, ...enemyCards];
    this.status = 'in_progress';
  }

  /** 执行战斗（自动/半自动） */
  runBattle(playerActions?: Map<number, BattleAction>): BattleEndResult {
    while (this.status === 'in_progress' && this.turn < this.maxTurns) {
      this.turn++;
      this.processTurn(playerActions?.get(this.turn));
    }

    // 判定胜负
    const playerAlive = this.playerUnits.filter(u => u.isAlive).length;
    const enemyAlive = this.enemyUnits.filter(u => u.isAlive).length;

    let winner: Side | 'draw';
    if (enemyAlive === 0) {
      winner = 'player';
    } else if (playerAlive === 0) {
      winner = 'enemy';
    } else {
      winner = 'draw'; // 超过回合上限
    }

    this.status = 'finished';

    return {
      winner,
      frames: this.frames,
      playerHp: this.playerUnits.map(u => u.hp),
      enemyHp: this.enemyUnits.map(u => u.hp),
    };
  }

  /** 处理单回合 */
  private processTurn(playerAction?: BattleAction): void {
    const frame: BattleFrame = {
      turn: this.turn,
      side: 'player',
      actions: [],
    };

    // 1. 回合开始：Buff tick
    for (const unit of this.allUnits) {
      if (!unit.isAlive) continue;
      const expired = this.buffManager.tickTurnStart(unit.id);
      // 处理过期 Buff（移除）
    }

    // 2. 按 SPD 排序行动顺序
    const sortedUnits = this.getSortedUnits();

    // 3. 依次执行各卡牌行动
    for (const unit of sortedUnits) {
      if (!unit.isAlive) continue;

      // 检查控制状态
      const controlled = this.buffManager.isControlled(unit.id);
      if (controlled.controlled) {
        // 被控制，跳过行动
        continue;
      }

      // 确定行动
      let action: BattleAction;
      if (unit.side === 'player' && playerAction && playerAction.sourceId === unit.id) {
        action = playerAction;
      } else {
        // AI 自动行动
        action = this.aiAutoAction(unit);
      }

      // 执行行动
      const result = this.executeAction(unit, action);
      frame.actions.push(result);
    }

    // 4. 回合结束：结算 DOT
    for (const unit of this.allUnits) {
      if (!unit.isAlive) continue;
      const dotResult = this.buffManager.tickTurnEnd(unit.id);
      // DOT 伤害结算
    }

    // 5. 检查胜负
    const playerAlive = this.playerUnits.filter(u => u.isAlive).length;
    const enemyAlive = this.enemyUnits.filter(u => u.isAlive).length;
    if (playerAlive === 0 || enemyAlive === 0) {
      this.status = 'finished';
    }

    this.frames.push(frame);
  }

  /** 获取按 SPD 排序的行动单位 */
  private getSortedUnits(): CardState[] {
    return this.allUnits
      .filter(u => u.isAlive)
      .sort((a, b) => {
        const spdDiff = b.spd - a.spd;
        if (spdDiff !== 0) return spdDiff;
        // 同 SPD 时，玩家优先
        if (a.side === 'player' && b.side === 'enemy') return -1;
        if (a.side === 'enemy' && b.side === 'player') return 1;
        return 0;
      });
  }

  /** AI 自动行动（简化版） */
  private aiAutoAction(unit: CardState): BattleAction {
    // 简化 AI：优先释放终极技能（冷却完毕时），否则普攻
    if (unit.skill3Id && unit.skill3Cooldown <= 0) {
      const targets = this.getAliveEnemies(unit.side);
      const target = targets[0];
      return {
        type: 'ultimate',
        sourceId: unit.id,
        targetIds: [target?.id].filter(Boolean) as string[],
        skillId: unit.skill3Id,
        damageType: unit.atk > unit.matk ? 'physical' : 'magical',
      };
    }

    // 检查怒气是否足够释放主动技能
    if (unit.skill1Id && unit.rage >= unit.skill1RageCost) {
      const targets = this.getAliveEnemies(unit.side);
      const target = targets[0];
      return {
        type: 'skill',
        sourceId: unit.id,
        targetIds: [target?.id].filter(Boolean) as string[],
        skillId: unit.skill1Id,
        damageType: unit.atk > unit.matk ? 'physical' : 'magical',
      };
    }

    // 普攻
    const targets = this.getAliveEnemies(unit.side);
    const target = targets[0];
    return {
      type: 'attack',
      sourceId: unit.id,
      targetIds: [target?.id].filter(Boolean) as string[],
      damageType: 'physical',
    };
  }

  /** 执行行动 */
  private executeAction(unit: CardState, action: BattleAction): BattleAction {
    const result = { ...action };

    switch (action.type) {
      case 'attack':
        result.damageResult = this.executeAttack(unit, action);
        break;
      case 'skill':
        result.damageResult = this.executeSkill(unit, action);
        // 扣减怒气
        unit.rage -= unit.skill1RageCost;
        break;
      case 'ultimate':
        result.damageResult = this.executeSkill(unit, action);
        // 进入冷却
        unit.skill3Cooldown = unit.skill3MaxCooldown;
        break;
    }

    return result;
  }

  /** 执行普攻 */
  private executeAttack(unit: CardState, action: BattleAction): DamageResult {
    const target = this.findUnit(action.targetIds[0]);
    if (!target) {
      return { rawDamage: 0, elemBonus: 0, dmgReduction: 0, isCrit: false, finalDamage: 0 };
    }

    const input: DamageInput = {
      attackerAtk: unit.atk,
      attackerMatk: unit.matk,
      attackerElement: unit.element,
      attackerCritRate: unit.critRate,
      attackerCritDmg: unit.critDmg,
      defenderDef: target.def,
      defenderMdef: target.mdef,
      defenderElement: target.element,
      skillMultiplier: 1.0, // 普攻倍率
      damageType: 'physical',
      defCurveK: BattleEngine.DEF_CURVE_K,
    };

    const result = this.damageCalc.calculate(input);
    this.applyDamage(target, result.finalDamage);
    unit.rage = Math.min(unit.rage + BattleEngine.RAGE_PER_HIT, BattleEngine.RAGE_MAX);

    return result;
  }

  /** 执行技能 */
  private executeSkill(unit: CardState, action: BattleAction): DamageResult {
    const target = this.findUnit(action.targetIds[0]);
    if (!target) {
      return { rawDamage: 0, elemBonus: 0, dmgReduction: 0, isCrit: false, finalDamage: 0 };
    }

    const input: DamageInput = {
      attackerAtk: unit.atk,
      attackerMatk: unit.matk,
      attackerElement: unit.element,
      attackerCritRate: unit.critRate,
      attackerCritDmg: unit.critDmg,
      defenderDef: target.def,
      defenderMdef: target.mdef,
      defenderElement: target.element,
      skillMultiplier: action.type === 'ultimate' ? 2.5 : 1.5, // 简化：终极 2.5 倍，主动 1.5 倍
      damageType: action.damageType || 'physical',
      defCurveK: BattleEngine.DEF_CURVE_K,
    };

    const result = this.damageCalc.calculate(input);
    this.applyDamage(target, result.finalDamage);

    return result;
  }

  /** 应用伤害 */
  private applyDamage(unit: CardState, damage: number): void {
    unit.hp = Math.max(0, unit.hp - damage);
    if (unit.hp <= 0) {
      unit.isAlive = false;
    }
  }

  /** 获取敌方存活单位 */
  private getAliveEnemies(side: Side): CardState[] {
    return side === 'player' ? this.enemyUnits.filter(u => u.isAlive) : this.playerUnits.filter(u => u.isAlive);
  }

  /** 查找单位 */
  private findUnit(id: string): CardState | undefined {
    return this.allUnits.find(u => u.id === id);
  }

  /** 获取当前战斗状态（用于同步） */
  getState(): { turn: number; status: BattleStatus; playerHp: number[]; enemyHp: number[] } {
    return {
      turn: this.turn,
      status: this.status,
      playerHp: this.playerUnits.map(u => u.hp),
      enemyHp: this.enemyUnits.map(u => u.hp),
    };
  }
}
