/**
 * 卡牌管理服务
 * 
 * 接口定义参见 docs/data/api-interfaces.md §3.4
 * 升星规则参见 docs/progression/progression-tables.md
 */

import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { CardInstance } from '../database/entities/card-instance.entity';
import { PlayerResource } from '../database/entities/player-resource.entity';
import { TeamFormation } from '../database/entities/team-formation.entity';

@Injectable()
export class CardService {
  private readonly logger = new Logger(CardService.name);

  constructor(
    @InjectRepository(CardInstance)
    private readonly cardRepo: Repository<CardInstance>,
    @InjectRepository(PlayerResource)
    private readonly resourceRepo: Repository<PlayerResource>,
    @InjectRepository(TeamFormation)
    private readonly formationRepo: Repository<TeamFormation>,
    private readonly dataSource: DataSource,
  ) {}

  /** 卡牌升星（带事务 + 乐观锁） */
  async starUp(playerId: string, cardInstanceId: string, targetStar: number) {
    return await this.dataSource.transaction(async (manager) => {
      // 1. 查询卡牌
      const card = await manager.findOne(CardInstance, {
        where: { id: cardInstanceId, playerId },
      });
      if (!card) {
        throw new NotFoundException({ code: 3001, msg: 'card_not_owned' });
      }

      // 2. 校验星级
      if (targetStar <= card.star || targetStar > 10) {
        throw new BadRequestException({ code: 3002, msg: 'card_max_star' });
      }

      // 3. 查询资源（悲观锁）
      const resource = await manager.findOne(PlayerResource, {
        where: { playerId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!resource) {
        throw new NotFoundException({ code: 5, msg: 'player_not_found' });
      }

      // 4. 计算消耗
      const fragCost = this.getStarUpFragCost(card.star, targetStar);
      const goldCost = this.getStarUpGoldCost(card.star, targetStar);
      const starStoneCost = card.star >= 5 ? (targetStar - card.star) * 5 : 0;

      // 5. 校验资源
      const gold = parseInt(resource.gold, 10);
      if (gold < goldCost) {
        throw new BadRequestException({ code: 2001, msg: 'gold_not_enough' });
      }
      if (resource.fragments < fragCost) {
        throw new BadRequestException({ code: 2004, msg: 'fragments_not_enough' });
      }
      if (resource.starStone < starStoneCost) {
        throw new BadRequestException({ code: 2005, msg: 'star_stone_not_enough' });
      }

      // 6. 扣减资源
      resource.gold = String(gold - goldCost);
      resource.fragments -= fragCost;
      resource.starStone -= starStoneCost;
      await manager.save(resource);

      // 7. 更新卡牌星级
      card.star = targetStar;
      await manager.save(card);

      // 8. 检查解锁技能
      const unlockedSkills: string[] = [];
      if (targetStar >= 2 && card.skill1Lv === 1) unlockedSkills.push('skill_lv2');
      if (targetStar >= 3 && card.skill2Lv === 0) unlockedSkills.push('passive');
      if (targetStar >= 5 && card.skill3Lv === 0) unlockedSkills.push('ultimate');

      this.logger.log(`Card star up: ${cardInstanceId} ${card.star - 1}★ → ${targetStar}★`);

      return {
        code: 0,
        data: {
          success: true,
          new_star: targetStar,
          consumed: { fragments: fragCost, gold: goldCost, star_stone: starStoneCost },
          new_stat: this.calculateBaseStats(card.cardDefId, targetStar),
          unlocked_skills: unlockedSkills,
          visual_change: targetStar % 3 === 0 ? 'appearance' : targetStar === 10 ? 'awaken' : 'none',
          new_power: 0,
        },
      };
    });
  }

  /** 技能升级（带事务 + 乐观锁） */
  async skillLevelUp(playerId: string, cardInstanceId: string, skillSlot: number) {
    return await this.dataSource.transaction(async (manager) => {
      // 1. 查询卡牌
      const card = await manager.findOne(CardInstance, {
        where: { id: cardInstanceId, playerId },
      });
      if (!card) {
        throw new NotFoundException({ code: 3001, msg: 'card_not_owned' });
      }

      // 2. 校验技能槽位
      if (skillSlot < 1 || skillSlot > 3) {
        throw new BadRequestException({ code: 5006, msg: 'invalid_action' });
      }

      // 3. 获取当前技能等级
      let currentLv: number;
      switch (skillSlot) {
        case 1: currentLv = card.skill1Lv; break;
        case 2: currentLv = card.skill2Lv; break;
        case 3: currentLv = card.skill3Lv; break;
      }

      if (currentLv === 0) {
        throw new BadRequestException({ code: 3005, msg: 'skill_not_unlocked' });
      }
      if (currentLv >= 10) {
        throw new BadRequestException({ code: 3006, msg: 'skill_max_level' });
      }

      // 4. 查询资源（悲观锁）
      const resource = await manager.findOne(PlayerResource, {
        where: { playerId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!resource) {
        throw new NotFoundException({ code: 5, msg: 'player_not_found' });
      }

      // 5. 计算消耗
      const bookCost = currentLv + 1;
      const goldCost = currentLv * 1000;

      const gold = parseInt(resource.gold, 10);
      if (gold < goldCost) {
        throw new BadRequestException({ code: 2001, msg: 'gold_not_enough' });
      }
      if (resource.skillBook < bookCost) {
        throw new BadRequestException({ code: 2006, msg: 'skill_book_not_enough' });
      }

      // 6. 扣减资源
      resource.gold = String(gold - goldCost);
      resource.skillBook -= bookCost;
      await manager.save(resource);

      // 7. 更新技能等级
      const newLv = currentLv + 1;
      switch (skillSlot) {
        case 1: card.skill1Lv = newLv; break;
        case 2: card.skill2Lv = newLv; break;
        case 3: card.skill3Lv = newLv; break;
      }
      await manager.save(card);

      this.logger.log(`Skill level up: ${cardInstanceId} slot ${skillSlot} → Lv${newLv}`);

      return {
        code: 0,
        data: {
          success: true,
          new_level: newLv,
          consumed: { skill_book: bookCost, gold: goldCost },
        },
      };
    });
  }

  /** 获取阵容 */
  async getFormation(playerId: string) {
    const formations = await this.formationRepo.find({
      where: { playerId },
      order: { isDefault: 'DESC', updatedAt: 'DESC' },
    });

    return {
      code: 0,
      data: {
        formations: formations.map(f => ({
          id: f.id,
          name: f.name,
          positions: f.positions,
          total_power: f.totalPower,
          is_default: f.isDefault,
          type: f.type,
        })),
      },
    };
  }

  /** 设置阵容（upsert 逻辑） */
  async setFormation(playerId: string, dto: { formationId?: string; name: string; positions: any[]; isDefault?: boolean }) {
    // 1. 校验阵容数量
    if (dto.positions.length !== 5) {
      throw new BadRequestException({ code: 3009, msg: 'formation_invalid' });
    }

    // 2. 校验卡牌归属
    const cardIds = dto.positions.map(p => p.cardInstanceId);
    const cards = await this.cardRepo.findByIds(cardIds);
    const ownedCards = cards.filter(c => c.playerId === playerId);
    if (ownedCards.length !== cardIds.length) {
      throw new BadRequestException({ code: 3001, msg: 'card_not_owned' });
    }

    // 3. 查找或创建阵容（upsert）
    let formation: TeamFormation;
    if (dto.formationId) {
      formation = await this.formationRepo.findOne({
        where: { id: dto.formationId, playerId },
      });
      if (!formation) {
        throw new NotFoundException({ code: 5, msg: 'formation_not_found' });
      }
    } else {
      formation = this.formationRepo.create({ playerId });
    }

    // 4. 更新字段
    formation.name = dto.name || formation.name || '默认阵容';
    formation.positions = dto.positions;
    formation.totalPower = this.calculateFormationPower(dto.positions);
    if (dto.isDefault !== undefined) {
      formation.isDefault = dto.isDefault;
    }

    await this.formationRepo.save(formation);

    this.logger.log(`Formation ${dto.formationId ? 'updated' : 'created'}: ${playerId}`);

    return {
      code: 0,
      data: {
        success: true,
        formation_id: formation.id,
        total_power: formation.totalPower,
      },
    };
  }

  // ============ 私有辅助方法 ============

  /** 计算升星碎片消耗 */
  private getStarUpFragCost(currentStar: number, targetStar: number): number {
    const costs = [0, 10, 20, 30, 50, 80, 120, 180, 250, 350, 500];
    let total = 0;
    for (let star = currentStar; star < targetStar; star++) {
      total += costs[star] || 500;
    }
    return total;
  }

  /** 计算升星金币消耗 */
  private getStarUpGoldCost(currentStar: number, targetStar: number): number {
    const costs = [0, 5000, 15000, 50000, 150000, 500000, 1000000, 2000000, 5000000, 8000000, 10000000];
    let total = 0;
    for (let star = currentStar; star < targetStar; star++) {
      total += costs[star] || 10000000;
    }
    return total;
  }

  /** 计算基础属性 */
  private calculateBaseStats(cardDefId: string, star: number) {
    const baseMultiplier = 1 + 0.175 * (star - 1);
    return {
      hp: Math.round(1000 * baseMultiplier),
      atk: Math.round(200 * baseMultiplier),
      matk: Math.round(200 * baseMultiplier),
      def: Math.round(150 * baseMultiplier),
      mdef: Math.round(150 * baseMultiplier),
      spd: 50,
    };
  }

  /** 计算阵容战力 */
  private calculateFormationPower(positions: any[]): number {
    // TODO: 从配置表读取卡牌基础属性并计算
    return positions.length * 1000;
  }
}
