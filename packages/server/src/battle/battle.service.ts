/**
 * 战斗服务
 * 
 * 复用 @cardplay/battle-engine 战斗引擎
 * 参见 docs/combat/battle-protocol.md
 */

import { Injectable, Logger, OnModuleDestroy, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomBytes } from 'crypto';
import { BattleEngine, CardState, BattleAction } from '@cardplay/battle-engine';
import { CardInstance } from '../database/entities/card-instance.entity';
import { TeamFormation } from '../database/entities/team-formation.entity';
import { BattleRecord } from '../database/entities/battle-record.entity';
import { PlayerResource } from '../database/entities/player-resource.entity';

interface ActiveBattle {
  engine: BattleEngine;
  playerId: string;
  createdAt: number;
  seed: number;
}

@Injectable()
export class BattleService implements OnModuleDestroy {
  private readonly logger = new Logger(BattleService.name);
  private cleanupTimer: NodeJS.Timeout;

  /** 活跃战斗实例（生产环境应存 Redis） */
  private activeBattles: Map<string, ActiveBattle> = new Map();

  /** 战斗超时时间（30 分钟） */
  private static readonly BATTLE_TIMEOUT_MS = 30 * 60 * 1000;

  /** 同一玩家最大活跃战斗数 */
  private static readonly MAX_ACTIVE_BATTLES_PER_PLAYER = 3;

  constructor(
    @InjectRepository(CardInstance)
    private readonly cardRepo: Repository<CardInstance>,
    @InjectRepository(TeamFormation)
    private readonly formationRepo: Repository<TeamFormation>,
    @InjectRepository(BattleRecord)
    private readonly recordRepo: Repository<BattleRecord>,
    @InjectRepository(PlayerResource)
    private readonly resourceRepo: Repository<PlayerResource>,
  ) {
    this.cleanupTimer = setInterval(() => this.cleanupExpiredBattles(), 60000);
  }

  onModuleDestroy() {
    clearInterval(this.cleanupTimer);
  }

  /** 开始战斗 */
  async startBattle(playerId: string, formation: any[]) {
    // 1. 幂等性检查：同一玩家不能同时有太多战斗
    const playerBattles = Array.from(this.activeBattles.values())
      .filter(b => b.playerId === playerId);
    if (playerBattles.length >= BattleService.MAX_ACTIVE_BATTLES_PER_PLAYER) {
      throw new BadRequestException({ code: 5001, msg: 'battle_already_started' });
    }

    // 2. 校验阵容
    if (formation.length !== 5) {
      throw new BadRequestException({ code: 3009, msg: 'formation_invalid' });
    }

    // 3. 查询卡牌实例
    const cardIds = formation.map(f => f.cardInstanceId);
    const cards = await this.cardRepo.findByIds(cardIds);
    const ownedCards = cards.filter(c => c.playerId === playerId);

    if (ownedCards.length !== 5) {
      throw new BadRequestException({ code: 3001, msg: 'card_not_owned' });
    }

    // 4. 构建 CardState 数组
    const playerStates = this.buildCardStates(ownedCards, formation);

    // 5. 生成敌人（简化版：从配置表读取）
    const enemyStates = this.generateEnemies();

    // 6. 生成安全随机种子
    const seed = this.generateSecureSeed();
    const rngSalt = this.generateSecureSeed();

    // 7. 创建战斗 ID
    const battleId = `battle_${Date.now()}_${playerId}`;

    // 8. 创建战斗引擎实例
    const engine = new BattleEngine(battleId, seed, rngSalt);
    engine.loadFormation(playerStates, enemyStates);

    // 9. 存储活跃战斗
    this.activeBattles.set(battleId, {
      engine,
      playerId,
      createdAt: Date.now(),
      seed,
    });

    // 10. 计算战力
    const playerPower = this.calculatePower(playerStates);
    const enemyPower = this.calculatePower(enemyStates);

    this.logger.log(`Battle started: ${battleId}, player=${playerId}, power=${playerPower} vs ${enemyPower}`);

    return {
      code: 0,
      data: {
        battle_id: battleId,
        seed,
        rng_salt: rngSalt,
        player_power: playerPower,
        enemy_power: enemyPower,
      },
    };
  }

  /** 执行战斗（自动/半自动） */
  async executeBattle(battleId: string, playerId: string, playerActions?: Map<number, BattleAction>) {
    // 1. 查询战斗
    const active = this.activeBattles.get(battleId);
    if (!active) {
      throw new NotFoundException({ code: 5002, msg: 'battle_not_found' });
    }

    // 2. 身份校验
    if (active.playerId !== playerId) {
      throw new ForbiddenException({ code: 4003, msg: 'forbidden' });
    }

    // 3. 运行战斗引擎
    const result = active.engine.runBattle(playerActions);

    // 4. 计算奖励
    const rewards = this.calculateRewards(result.winner);

    // 5. 发放奖励到 PlayerResource
    if (result.winner === 'player') {
      await this.distributeRewards(playerId, rewards);
    }

    // 6. 保存战斗记录
    const record = this.recordRepo.create({
      playerId,
      battleType: 'adventure',
      stageId: 'test',
      seed: String(active.seed),
      result: result.winner,
      frameCount: result.frames.length,
    });
    await this.recordRepo.save(record);

    // 7. 清理
    this.activeBattles.delete(battleId);

    this.logger.log(`Battle finished: ${battleId}, winner=${result.winner}, frames=${result.frames.length}`);

    return {
      code: 0,
      data: {
        battle_id: battleId,
        winner: result.winner,
        frames: result.frames,
        final_state: {
          win: result.winner === 'player',
          player_hp: result.playerHp,
          enemy_hp: result.enemyHp,
        },
        rewards,
      },
    };
  }

  /** 获取战斗状态 */
  getBattleState(battleId: string, playerId: string) {
    const active = this.activeBattles.get(battleId);
    if (!active) {
      throw new NotFoundException({ code: 5002, msg: 'battle_not_found' });
    }
    if (active.playerId !== playerId) {
      throw new ForbiddenException({ code: 4003, msg: 'forbidden' });
    }
    return active.engine.getState();
  }

  // ============ 私有方法 ============

  /** 发放战斗奖励 */
  private async distributeRewards(playerId: string, rewards: { gold: number; exp: number; fragments: number; skill_book: number }) {
    try {
      const resource = await this.resourceRepo.findOne({
        where: { playerId },
        lock: { mode: 'pessimistic_write' },
      });
      if (resource) {
        resource.gold = String(parseInt(resource.gold, 10) + rewards.gold);
        resource.fragments += rewards.fragments;
        resource.skillBook += rewards.skill_book;
        await this.resourceRepo.save(resource);
        this.logger.log(`Rewards distributed: ${playerId} gold=${rewards.gold} fragments=${rewards.fragments} skill_book=${rewards.skill_book}`);
      }
    } catch (error) {
      this.logger.error(`Failed to distribute rewards: ${playerId}`, error);
    }
  }

  /** 构建 CardState 数组 */
  private buildCardStates(cards: CardInstance[], formation: any[]): CardState[] {
    return cards.map((card, index) => {
      const pos = formation[index] || {};
      const starMultiplier = 1 + 0.175 * (card.star - 1);
      const baseHp = 1000 * starMultiplier;
      const baseAtk = 200 * starMultiplier;

      return {
        id: card.id,
        side: 'player' as const,
        row: (pos.row || 'front') as 'front' | 'back',
        index,
        hp: Math.round(baseHp),
        maxHp: Math.round(baseHp),
        atk: Math.round(baseAtk),
        matk: Math.round(baseAtk),
        def: Math.round(150 * starMultiplier),
        mdef: Math.round(150 * starMultiplier),
        spd: 50 + card.star * 5,
        critRate: 0.05,
        critDmg: 1.5,
        element: 'fire' as const,
        skill1RageCost: 40,
        skill3Cooldown: 0,
        skill3MaxCooldown: 6,
        rage: 0,
        isAlive: true,
      };
    });
  }

  /** 生成敌人（简化版，TODO: 从配置表读取） */
  private generateEnemies(): CardState[] {
    const enemies = [
      { id: 'enemy_1', name: '冰原狼', hp: 500, atk: 100, def: 50 },
      { id: 'enemy_2', name: '冰原狼', hp: 500, atk: 100, def: 50 },
      { id: 'enemy_3', name: '霜巨人', hp: 800, atk: 120, def: 70 },
    ];

    return enemies.map((enemy, index) => ({
      id: enemy.id,
      side: 'enemy' as const,
      row: (index < 2 ? 'front' : 'back') as 'front' | 'back',
      index,
      hp: enemy.hp,
      maxHp: enemy.hp,
      atk: enemy.atk,
      matk: Math.round(enemy.atk * 0.8),
      def: enemy.def,
      mdef: Math.round(enemy.def * 0.8),
      spd: 30 + index * 5,
      critRate: 0.03,
      critDmg: 1.5,
      element: 'ice' as const,
      skill1RageCost: 40,
      skill3Cooldown: 0,
      skill3MaxCooldown: 8,
      rage: 0,
      isAlive: true,
    }));
  }

  /** 计算阵容战力 */
  private calculatePower(states: CardState[]): number {
    return states.reduce((sum, s) => {
      return sum + Math.round(
        (s.hp * 0.5 + s.atk + s.matk + s.def * 0.8 + s.mdef * 0.8) * (1 + s.spd * 0.01)
      );
    }, 0);
  }

  /** 计算奖励 */
  private calculateRewards(winner: string) {
    if (winner === 'player') {
      return { gold: 5000, exp: 1200, fragments: 2, skill_book: 1 };
    }
    return { gold: 0, exp: 0, fragments: 0, skill_book: 0 };
  }

  /** 生成安全随机种子 */
  private generateSecureSeed(): number {
    const buf = randomBytes(4);
    return buf.readUInt32BE(0);
  }

  /** 清理超时战斗 */
  private cleanupExpiredBattles() {
    const now = Date.now();
    for (const [battleId, battle] of this.activeBattles) {
      if (now - battle.createdAt > BattleService.BATTLE_TIMEOUT_MS) {
        this.activeBattles.delete(battleId);
        this.logger.warn(`Battle expired: ${battleId}`);
      }
    }
  }
}
