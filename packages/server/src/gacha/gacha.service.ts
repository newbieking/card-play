/**
 * 抽卡服务
 * 
 * 参见 docs/data/gacha-rng.md（保底算法）
 */

import { Injectable } from '@nestjs/common';

@Injectable()
export class GachaService {
  /** 获取卡池列表 */
  async getPools() {
    // TODO: 从配置表查询可用卡池
    return {
      code: 0,
      data: {
        pools: [
          {
            id: 'standard_pool',
            name: '常驻召唤池',
            type: 'standard',
            cost_type: 'diamond',
            cost_1: 100,
            cost_10: 900,
            description: '常驻卡池，所有卡牌均可抽取',
          },
          {
            id: 'newbie_pool',
            name: '新手召唤池',
            type: 'newbie',
            cost_type: 'free',
            cost_1: 0,
            cost_10: 0,
            description: '前 10 抽必出传说卡',
          },
        ],
      },
    };
  }

  /** 抽卡 */
  async draw(playerId: string, poolId: string, count: number) {
    // TODO: 校验资源 → 调用 RNG → 保底判定 → 扣减资源 → 返回结果
    return {
      code: 0,
      data: {
        draws: [],
        pity_counter: {
          total_draws: 0,
          since_last_legendary: 0,
          hard_pity_at: 90,
        },
      },
    };
  }
}
