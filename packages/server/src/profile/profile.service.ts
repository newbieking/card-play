/**
 * 玩家档案服务
 */

import { Injectable } from '@nestjs/common';

@Injectable()
export class ProfileService {
  /** 获取玩家档案 */
  async getProfile(playerId: string) {
    // TODO: 从数据库查询
    return {
      code: 0,
      data: {
        player_id: playerId,
        nick_name: '测试玩家',
        avatar_url: '',
        level: 1,
        exp: 0,
        vip_level: 0,
        resource: {
          gold: 50000,
          diamond_free: 200,
          diamond_paid: 100,
          stamina: 120,
          stamina_max: 120,
          stamina_recovery_at: Date.now(),
          exp_potion: 10,
          star_stone: 5,
          skill_book: 8,
        },
      },
    };
  }

  /** 更新昵称 */
  async updateNickname(playerId: string, nickname: string) {
    // TODO: 更新数据库
    return {
      code: 0,
      data: { nickname },
    };
  }

  /** 获取卡牌列表 */
  async getInventory(playerId: string) {
    // TODO: 从数据库查询
    return {
      code: 0,
      data: {
        cards: [],
        total_count: 0,
      },
    };
  }
}
