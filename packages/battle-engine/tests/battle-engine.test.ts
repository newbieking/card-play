/**
 * 战斗引擎测试
 */

import { describe, it, expect } from 'vitest';
import { calcDmgReduction, calcFinalDamage } from '../src/Fixed';
import { DeterministicRandom } from '../src/Random';
import { ElementSystem } from '../src/ElementSystem';
import { DamageCalc } from '../src/DamageCalc';
import { BattleEngine, CardState } from '../src/BattleEngine';

describe('Fixed Point Math', () => {
  it('should calculate damage reduction correctly', () => {
    expect(calcDmgReduction(0, 500)).toBe(0);
    expect(calcDmgReduction(500, 500)).toBeCloseTo(0.5, 4);
    expect(calcDmgReduction(1000, 500)).toBeCloseTo(0.6667, 3);
    expect(calcDmgReduction(300, 500)).toBeCloseTo(0.375, 4);
  });

  it('should calculate final damage correctly', () => {
    // 500 ATK × 1.5 倍率 × 1.25 元素 × 0.625 减伤 × 1.0 暴击 × 1.0 浮动
    const result = calcFinalDamage(500, 1.5, 0.25, 0.375, 1.0, 1.0);
    // 500 × 1.5 = 750
    // 750 × 1.25 = 937.5
    // 937.5 × 0.625 = 585.9375
    expect(result).toBe(586);
  });

  it('should enforce minimum damage of 1', () => {
    const result = calcFinalDamage(1, 0.1, -0.15, 0.99, 1.0, 1.0);
    expect(result).toBeGreaterThanOrEqual(1);
  });
});

describe('Deterministic Random', () => {
  it('should produce same sequence with same seed', () => {
    const rng1 = new DeterministicRandom(12345);
    const rng2 = new DeterministicRandom(12345);

    for (let i = 0; i < 100; i++) {
      expect(rng1.next()).toBe(rng2.next());
    }
  });

  it('should produce different sequences with different seeds', () => {
    const rng1 = new DeterministicRandom(11111);
    const rng2 = new DeterministicRandom(22222);

    const seq1 = Array.from({ length: 10 }, () => rng1.next());
    const seq2 = Array.from({ length: 10 }, () => rng2.next());

    expect(seq1).not.toEqual(seq2);
  });
});

describe('Element System', () => {
  it('fire should beat ice', () => {
    expect(ElementSystem.getModifier('fire', 'ice')).toBe(0.25);
  });

  it('ice should beat thunder', () => {
    expect(ElementSystem.getModifier('ice', 'thunder')).toBe(0.25);
  });

  it('water should beat fire', () => {
    expect(ElementSystem.getModifier('water', 'fire')).toBe(0.25);
  });

  it('fire should be weak to water', () => {
    expect(ElementSystem.getModifier('fire', 'water')).toBe(-0.15);
  });

  it('nature should be neutral', () => {
    expect(ElementSystem.getModifier('nature', 'fire')).toBe(0);
    expect(ElementSystem.getModifier('fire', 'nature')).toBe(0);
  });
});

describe('Damage Calculation', () => {
  it('should calculate physical damage correctly', () => {
    const rng = new DeterministicRandom(42);
    const calc = new DamageCalc(rng);

    const result = calc.calculate({
      attackerAtk: 500,
      attackerMatk: 100,
      attackerElement: 'fire',
      attackerCritRate: 0,
      attackerCritDmg: 1.5,
      defenderDef: 300,
      defenderMdef: 200,
      defenderElement: 'ice',
      skillMultiplier: 1.5,
      damageType: 'physical',
      defCurveK: 500,
    });

    // 预期：500 × 1.5 = 750 基础
    // 火克冰 +25% → 937.5
    // 减伤 300/800 = 37.5% → 585.9375
    expect(result.rawDamage).toBe(750);
    expect(result.elemBonus).toBe(0.25);
    expect(result.dmgReduction).toBeCloseTo(0.375, 2);
    expect(result.finalDamage).toBeGreaterThan(500);
    expect(result.finalDamage).toBeLessThan(700);
  });

  it('should calculate magical damage correctly', () => {
    const rng = new DeterministicRandom(42);
    const calc = new DamageCalc(rng);

    const result = calc.calculate({
      attackerAtk: 100,
      attackerMatk: 650,
      attackerElement: 'ice',
      attackerCritRate: 0,
      attackerCritDmg: 1.5,
      defenderDef: 200,
      defenderMdef: 267,
      defenderElement: 'nature',
      skillMultiplier: 2.0,
      damageType: 'magical',
      defCurveK: 500,
    });

    // 预期：650 × 2.0 = 1300 基础
    // 冰 vs 自然：无克制 0%
    // 减伤 267/767 = 34.8%
    expect(result.rawDamage).toBe(1300);
    expect(result.elemBonus).toBe(0);
    expect(result.dmgReduction).toBeCloseTo(0.348, 2);
    expect(result.finalDamage).toBeGreaterThan(800);
    expect(result.finalDamage).toBeLessThan(1000);
  });

  it('true damage should ignore defense', () => {
    const rng = new DeterministicRandom(42);
    const calc = new DamageCalc(rng);

    const result = calc.calculate({
      attackerAtk: 500,
      attackerMatk: 100,
      attackerElement: 'fire',
      attackerCritRate: 0,
      attackerCritDmg: 1.5,
      defenderDef: 5000,
      defenderMdef: 5000,
      defenderElement: 'ice',
      skillMultiplier: 1.0,
      damageType: 'true',
      defCurveK: 500,
    });

    expect(result.dmgReduction).toBe(0);
    expect(result.finalDamage).toBeGreaterThan(400);
  });
});

describe('Battle Engine', () => {
  function createTestCard(id: string, side: 'player' | 'enemy', overrides?: Partial<CardState>): CardState {
    return {
      id,
      side,
      row: 'front',
      index: 0,
      hp: 1000,
      maxHp: 1000,
      atk: 200,
      matk: 100,
      def: 150,
      mdef: 100,
      spd: 50,
      critRate: 0.05,
      critDmg: 1.5,
      element: 'fire',
      skill1RageCost: 40,
      skill3Cooldown: 0,
      skill3MaxCooldown: 6,
      rage: 0,
      isAlive: true,
      ...overrides,
    };
  }

  it('should run a simple battle', () => {
    const engine = new BattleEngine('test-001', 12345, 67890);

    const playerCards = [
      createTestCard('p1', 'player', { atk: 200, def: 150, spd: 60 }),
      createTestCard('p2', 'player', { atk: 180, def: 180, spd: 50 }),
    ];

    const enemyCards = [
      createTestCard('e1', 'enemy', { atk: 100, def: 80, spd: 40, hp: 500, maxHp: 500 }),
      createTestCard('e2', 'enemy', { atk: 100, def: 80, spd: 35, hp: 500, maxHp: 500 }),
    ];

    engine.loadFormation(playerCards, enemyCards);
    const result = engine.runBattle();

    expect(result.winner).toBeDefined();
    expect(result.frames.length).toBeGreaterThan(0);
    expect(result.frames.length).toBeLessThanOrEqual(50);
  });

  it('should respect turn limit', () => {
    const engine = new BattleEngine('test-002', 12345, 67890);

    // 两个高防低攻的单位，很难打死对方
    const playerCards = [
      createTestCard('p1', 'player', { atk: 1, def: 9999, hp: 99999, maxHp: 99999 }),
    ];

    const enemyCards = [
      createTestCard('e1', 'enemy', { atk: 1, def: 9999, hp: 99999, maxHp: 99999 }),
    ];

    engine.loadFormation(playerCards, enemyCards);
    const result = engine.runBattle();

    // 应该在 50 回合内结束（平局）
    expect(result.winner).toBe('draw');
    expect(result.frames.length).toBe(50);
  });
});
