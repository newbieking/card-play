/**
 * 抽卡服务
 * 
 * 参见 docs/data/gacha-rng.md（保底算法）
 * 参见 docs/data/api-interfaces.md §3.7
 */

import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { randomBytes } from 'crypto';
import { GachaPityCounter } from '../database/entities/gacha-pity-counter.entity';
import { PlayerResource } from '../database/entities/player-resource.entity';
import { CardInstance } from '../database/entities/card-instance.entity';

/** 稀有度 */
type Rarity = 'common' | 'rare' | 'epic' | 'legendary';

/** 抽卡结果 */
interface DrawResult {
  cardId: string;
  rarity: Rarity;
  isNew: boolean;
  fragmentsIfDup: number;
}

/** 卡池配置（简化版） */
interface PoolConfig {
  id: string;
  name: string;
  type: string;
  costType: string;
  cost1: number;
  cost10: number;
  hardPity: number;
  softPityStart: number;
  baseRates: Record<Rarity, number>;
  cards: Array<{ id: string; rarity: Rarity; weight: number }>;
}

@Injectable()
export class GachaService {
  private readonly logger = new Logger(GachaService.name);

  // 简化的卡池配置（实际应从配置表读取）
  private readonly pools: Map<string, PoolConfig> = new Map([
    ['standard_pool', {
      id: 'standard_pool',
      name: '常驻召唤池',
      type: 'standard',
      costType: 'diamond',
      cost1: 100,
      cost10: 900,
      hardPity: 90,
      softPityStart: 70,
      baseRates: { common: 0.50, rare: 0.35, epic: 0.13, legendary: 0.02 },
      cards: [
        { id: 'frost_queen', rarity: 'legendary', weight: 1 },
        { id: 'fire_oracle', rarity: 'legendary', weight: 1 },
        { id: 'shadow_weaver', rarity: 'epic', weight: 2 },
        { id: 'thunder_ranger', rarity: 'epic', weight: 2 },
        { id: 'iron_guardian', rarity: 'rare', weight: 3 },
        { id: 'poison_witch', rarity: 'rare', weight: 3 },
        { id: 'wind_scout', rarity: 'rare', weight: 3 },
      ],
    }],
    ['newbie_pool', {
      id: 'newbie_pool',
      name: '新手召唤池',
      type: 'newbie',
      costType: 'free',
      cost1: 0,
      cost10: 0,
      hardPity: 10,
      softPityStart: 0,
      baseRates: { common: 0.50, rare: 0.35, epic: 0.13, legendary: 0.02 },
      cards: [
        { id: 'frost_queen', rarity: 'legendary', weight: 1 },
        { id: 'fire_oracle', rarity: 'legendary', weight: 1 },
        { id: 'thunder_ranger', rarity: 'legendary', weight: 1 },
        { id: 'light_oracle', rarity: 'legendary', weight: 1 },
        { id: 'shadow_weaver', rarity: 'epic', weight: 2 },
        { id: 'iron_guardian', rarity: 'rare', weight: 3 },
        { id: 'poison_witch', rarity: 'rare', weight: 3 },
      ],
    }],
  ]);

  constructor(
    @InjectRepository(GachaPityCounter)
    private readonly pityRepo: Repository<GachaPityCounter>,
    @InjectRepository(PlayerResource)
    private readonly resourceRepo: Repository<PlayerResource>,
    @InjectRepository(CardInstance)
    private readonly cardRepo: Repository<CardInstance>,
    private readonly dataSource: DataSource,
  ) {}

  /** 获取卡池列表 */
  async getPools() {
    const pools = Array.from(this.pools.values()).map(p => ({
      id: p.id,
      name: p.name,
      type: p.type,
      cost_type: p.costType,
      cost_1: p.cost1,
      cost_10: p.cost10,
    }));

    return {
      code: 0,
      data: { pools },
    };
  }

  /** 抽卡（带事务） */
  async draw(playerId: string, poolId: string, count: number) {
    return await this.dataSource.transaction(async (manager) => {
      // 1. 校验卡池
      const pool = this.pools.get(poolId);
      if (!pool) {
        throw new NotFoundException({ code: 4001, msg: 'pool_not_found' });
      }

      // 2. 校验次数
      if (count !== 1 && count !== 10) {
        throw new BadRequestException({ code: 5006, msg: 'invalid_action' });
      }

      // 3. 查询资源（悲观锁）
      const resource = await manager.findOne(PlayerResource, {
        where: { playerId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!resource) {
        throw new NotFoundException({ code: 5, msg: 'player_not_found' });
      }

      // 4. 校验消耗
      const totalCost = count === 1 ? pool.cost1 : pool.cost10;
      if (pool.costType === 'diamond') {
        const diamonds = parseInt(resource.diamondFree, 10) + parseInt(resource.diamondPaid, 10);
        if (diamonds < totalCost) {
          throw new BadRequestException({ code: 2002, msg: 'diamond_not_enough' });
        }
      }

      // 5. 查询玩家已拥有的卡牌（用于 isNew 判定）
      const ownedCards = await manager.find(CardInstance, {
        where: { playerId },
        select: ['cardDefId'],
      });
      const ownedCardDefIds = new Set(ownedCards.map(c => c.cardDefId));

      // 6. 获取或创建保底计数器
      let pity = await manager.findOne(GachaPityCounter, {
        where: { playerId, poolId },
      });
      if (!pity) {
        pity = this.pityRepo.create({ playerId, poolId });
        await manager.save(pity);
      }

      // 7. 执行抽卡
      const draws: DrawResult[] = [];
      let totalFragments = 0;

      for (let i = 0; i < count; i++) {
        const result = this.executeOneDraw(pool, pity, i === count - 1, ownedCardDefIds);
        draws.push(result);

        // 更新保底计数
        pity.totalDraws++;
        pity.tenPullIndex = (pity.tenPullIndex + 1) % 10;

        if (result.rarity === 'legendary') {
          pity.sinceLastLegendary = 0;
          pity.guaranteedLegendary = false;
        } else {
          pity.sinceLastLegendary++;
        }

        if (result.rarity === 'rare' || result.rarity === 'epic' || result.rarity === 'legendary') {
          pity.sinceLastRare = 0;
        } else {
          pity.sinceLastRare++;
        }

        // 累计碎片（重复卡转化）
        if (!result.isNew) {
          totalFragments += result.fragmentsIfDup;
        }
      }

      // 8. 保存保底计数
      await manager.save(pity);

      // 9. 扣减资源
      if (pool.costType === 'diamond' && totalCost > 0) {
        let free = parseInt(resource.diamondFree, 10);
        let paid = parseInt(resource.diamondPaid, 10);
        if (free >= totalCost) {
          free -= totalCost;
        } else {
          paid -= (totalCost - free);
          free = 0;
        }
        resource.diamondFree = String(free);
        resource.diamondPaid = String(paid);
      }

      // 10. 添加碎片（重复卡转化）
      resource.fragments += totalFragments;
      await manager.save(resource);

      // 11. 创建卡牌实例
      for (const draw of draws) {
        if (draw.isNew) {
          const card = this.cardRepo.create({
            playerId,
            cardDefId: draw.cardId,
            level: 1,
            star: 1,
            exp: '0',
            qualityVariant: 0,
            skill1Lv: 1,
            skill2Lv: 0,
            skill3Lv: 0,
          });
          await manager.save(card);
        }
      }

      this.logger.log(`Gacha draw: ${playerId} pool=${poolId} count=${count} new_cards=${draws.filter(d => d.isNew).length} fragments_earned=${totalFragments}`);

      return {
        code: 0,
        data: {
          draws: draws.map(d => ({
            card_id: d.cardId,
            rarity: d.rarity,
            is_new: d.isNew,
            fragments_if_dup: d.fragmentsIfDup,
          })),
          pity_counter: {
            total_draws: pity.totalDraws,
            since_last_legendary: pity.sinceLastLegendary,
            hard_pity_at: pool.hardPity,
          },
        },
      };
    });
  }

  // ============ 私有方法 ============

  /** 执行单次抽卡 */
  private executeOneDraw(
    pool: PoolConfig,
    pity: GachaPityCounter,
    isLastInTen: boolean,
    ownedCardDefIds: Set<string>,
  ): DrawResult {
    // 1. 硬保底判定
    if (pity.sinceLastLegendary >= pool.hardPity) {
      return this.pickCardByRarity('legendary', pool, ownedCardDefIds);
    }

    // 2. 十连保底（最后一抽必出稀有以上）
    if (isLastInTen && pity.tenPullIndex === 9 && pity.sinceLastRare >= 9) {
      const roll = this.secureRandom();
      if (roll > 0.5) {
        return this.pickCardByRarity('epic', pool, ownedCardDefIds);
      }
      return this.pickCardByRarity('rare', pool, ownedCardDefIds);
    }

    // 3. 软保底概率提升
    let rates = { ...pool.baseRates };
    if (pity.sinceLastLegendary >= pool.softPityStart) {
      const boost = (pity.sinceLastLegendary - pool.softPityStart + 1) * 0.005;
      rates.legendary = Math.min(rates.legendary + boost, 1.0);
    }

    // 4. 正常判定
    const roll = this.secureRandom();
    let cumulative = 0;
    for (const [rarity, rate] of Object.entries(rates)) {
      cumulative += rate;
      if (roll < cumulative) {
        return this.pickCardByRarity(rarity as Rarity, pool, ownedCardDefIds);
      }
    }

    // 兜底：普通
    return this.pickCardByRarity('common', pool, ownedCardDefIds);
  }

  /** 按稀有度选卡 */
  private pickCardByRarity(
    rarity: Rarity,
    pool: PoolConfig,
    ownedCardDefIds: Set<string>,
  ): DrawResult {
    const candidates = pool.cards.filter(c => c.rarity === rarity);
    if (candidates.length === 0) {
      return {
        cardId: pool.cards[0]?.id || 'unknown',
        rarity,
        isNew: true,
        fragmentsIfDup: this.getFragmentCount(rarity),
      };
    }

    // 按权重随机
    const totalWeight = candidates.reduce((sum, c) => sum + c.weight, 0);
    let roll = this.secureRandom() * totalWeight;
    for (const card of candidates) {
      roll -= card.weight;
      if (roll <= 0) {
        const isNew = !ownedCardDefIds.has(card.id);
        return {
          cardId: card.id,
          rarity,
          isNew,
          fragmentsIfDup: isNew ? 0 : this.getFragmentCount(rarity),
        };
      }
    }

    // 兜底
    const fallback = candidates[0];
    const isNew = !ownedCardDefIds.has(fallback.id);
    return {
      cardId: fallback.id,
      rarity,
      isNew,
      fragmentsIfDup: isNew ? 0 : this.getFragmentCount(rarity),
    };
  }

  /** 获取碎片转化数量 */
  private getFragmentCount(rarity: Rarity): number {
    const fragments: Record<Rarity, number> = {
      common: 5,
      rare: 15,
      epic: 30,
      legendary: 80,
    };
    return fragments[rarity];
  }

  /** 安全随机数（加密级） */
  private secureRandom(): number {
    const buf = randomBytes(4);
    return buf.readUInt32BE(0) / 0xFFFFFFFF;
  }
}
