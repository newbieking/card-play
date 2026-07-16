/**
 * 卡牌管理服务
 */

import { Injectable } from '@nestjs/common';

@Injectable()
export class CardService {
  /** 卡牌升星 */
  async starUp(playerId: string, cardInstanceId: string, targetStar: number) {
    // TODO: 校验碎片/金币是否足够 → 扣减 → 更新卡牌星级 → 返回
    return {
      code: 0,
      data: {
        success: true,
        new_star: targetStar,
        consumed: { fragments: 0, gold: 0, star_stone: 0 },
        new_stat: { hp: 0, atk: 0, matk: 0, def: 0, mdef: 0, spd: 0 },
        unlocked_skills: [],
        visual_change: 'none',
        new_power: 0,
      },
    };
  }

  /** 技能升级 */
  async skillLevelUp(playerId: string, cardInstanceId: string, skillSlot: number) {
    // TODO: 校验技能书/金币 → 扣减 → 更新技能等级
    return {
      code: 0,
      data: {
        success: true,
        new_level: 1,
        consumed: { skill_book: 0, gold: 0 },
      },
    };
  }

  /** 获取阵容 */
  async getFormation(playerId: string) {
    // TODO: 从数据库查询
    return {
      code: 0,
      data: {
        formations: [],
      },
    };
  }

  /** 设置阵容 */
  async setFormation(playerId: string, dto: any) {
    // TODO: 校验卡牌归属 → 保存阵容 → 计算战力
    return {
      code: 0,
      data: {
        success: true,
        total_power: 0,
      },
    };
  }
}
