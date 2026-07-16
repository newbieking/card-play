/**
 * 玩家档案服务
 * 
 * 接口定义参见 docs/data/api-interfaces.md §3.2
 */

import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlayerAccount } from '../database/entities/player-account.entity';
import { PlayerResource } from '../database/entities/player-resource.entity';
import { CardInstance } from '../database/entities/card-instance.entity';

@Injectable()
export class ProfileService {
  private readonly logger = new Logger(ProfileService.name);

  constructor(
    @InjectRepository(PlayerAccount)
    private readonly accountRepo: Repository<PlayerAccount>,
    @InjectRepository(PlayerResource)
    private readonly resourceRepo: Repository<PlayerResource>,
    @InjectRepository(CardInstance)
    private readonly cardRepo: Repository<CardInstance>,
  ) {}

  /** 获取玩家档案 */
  async getProfile(playerId: string) {
    const account = await this.accountRepo.findOne({ where: { id: playerId } });
    if (!account) {
      throw new NotFoundException({ code: 5, msg: 'player_not_found' });
    }

    const resource = await this.resourceRepo.findOne({ where: { playerId } });

    // 防御性检查：resource 不应为 null（登录时已同步创建）
    if (!resource) {
      this.logger.warn(`Resource not found for player: ${playerId}, returning defaults`);
      return {
        code: 0,
        data: {
          player_id: account.id,
          nick_name: account.nickName,
          avatar_url: account.avatarUrl || '',
          level: account.level,
          exp: parseInt(account.exp, 10) || 0,
          vip_level: account.vipLevel,
          resource: {
            gold: 0,
            diamond_free: 0,
            diamond_paid: 0,
            stamina: 120,
            stamina_max: 120,
            stamina_recovery_at: Date.now(),
            exp_potion: 0,
            star_stone: 0,
            skill_book: 0,
          },
        },
      };
    }

    return {
      code: 0,
      data: {
        player_id: account.id,
        nick_name: account.nickName,
        avatar_url: account.avatarUrl || '',
        level: account.level,
        exp: parseInt(account.exp, 10) || 0,
        vip_level: account.vipLevel,
        resource: {
          gold: parseInt(resource.gold, 10) || 0,
          diamond_free: parseInt(resource.diamondFree, 10) || 0,
          diamond_paid: parseInt(resource.diamondPaid, 10) || 0,
          stamina: resource.stamina,
          stamina_max: 120, // TODO: 从 player_level 配置表读取
          stamina_recovery_at: resource.staminaUpdatedAt?.getTime() || Date.now(),
          exp_potion: resource.expPotion,
          star_stone: resource.starStone,
          skill_book: resource.skillBook,
        },
      },
    };
  }

  /** 更新昵称 */
  async updateNickname(playerId: string, nickname: string) {
    const account = await this.accountRepo.findOne({ where: { id: playerId } });
    if (!account) {
      throw new NotFoundException({ code: 5, msg: 'player_not_found' });
    }

    account.nickName = nickname;
    await this.accountRepo.save(account);

    this.logger.log(`Nickname updated: ${playerId} -> ${nickname}`);

    return {
      code: 0,
      data: { nickname },
    };
  }

  /** 获取卡牌列表（支持分页） */
  async getInventory(playerId: string, page: number = 1, pageSize: number = 50) {
    const [cards, totalCount] = await this.cardRepo.findAndCount({
      where: { playerId },
      order: { star: 'DESC', level: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return {
      code: 0,
      data: {
        cards: cards.map(card => ({
          id: card.id,
          card_def_id: card.cardDefId,
          level: card.level,
          star: card.star,
          exp: parseInt(card.exp, 10) || 0,
          quality_variant: card.qualityVariant,
          skill_1_lv: card.skill1Lv,
          skill_2_lv: card.skill2Lv,
          skill_3_lv: card.skill3Lv,
        })),
        total_count: totalCount,
        page,
        page_size: pageSize,
        total_pages: Math.ceil(totalCount / pageSize),
      },
    };
  }
}
