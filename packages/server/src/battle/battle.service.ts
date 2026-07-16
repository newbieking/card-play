/**
 * 战斗服务
 * 
 * 复用 @cardplay/battle-engine 战斗引擎
 * 参见 docs/combat/battle-protocol.md
 */

import { Injectable } from '@nestjs/common';
import { BattleEngine, CardState } from '@cardplay/battle-engine';
import { createHash } from 'crypto';

@Injectable()
export class BattleService {
  /** 活跃战斗实例（生产环境应存 Redis） */
  private activeBattles: Map<string, BattleEngine> = new Map();

  /** 开始战斗 */
  async startBattle(playerId: string, formation: any[]) {
    // TODO: 校验阵容 → 生成敌人
    
    const battleId = `battle_${Date.now()}_${playerId}`;
    
    // 使用加密级安全随机源生成种子（确定性保障）
    const seed = this.generateSecureSeed();
    const rngSalt = this.generateSecureSeed();

    // 创建战斗引擎实例
    const engine = new BattleEngine(battleId, seed, rngSalt);
    this.activeBattles.set(battleId, engine);

    return {
      code: 0,
      data: {
        battle_id: battleId,
        seed,
        rng_salt: rngSalt,
        player_power: 0,
        enemy_power: 0,
      },
    };
  }

  /** 执行战斗（服务端权威结算） */
  async executeBattle(battleId: string, playerActions: any[]) {
    const engine = this.activeBattles.get(battleId);
    if (!engine) {
      return { code: 5002, msg: 'battle_not_found' };
    }

    // TODO: 加载阵容 → 运行引擎 → 返回结果
    // const result = engine.runBattle();
    
    // 清理
    this.activeBattles.delete(battleId);

    return {
      code: 0,
      data: {
        battle_id: battleId,
        winner: 'player',
        frames: [],
        final_state: {
          win: true,
          player_hp: [],
          enemy_hp: [],
        },
        rewards: {},
      },
    };
  }

  /** 生成安全随机种子 */
  private generateSecureSeed(): number {
    // 使用 crypto 生成确定性种子
    const buffer = require('crypto').randomBytes(4);
    return buffer.readUInt32BE(0);
  }
}
