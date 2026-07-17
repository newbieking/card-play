/**
 * 抽卡保底计数器实体
 * 
 * 对应 docs/data/data-model.md §3.8
 */

import { Entity, PrimaryColumn, Column, UpdateDateColumn } from 'typeorm';

// 主键 (player_id, pool_id) 已自动创建复合索引，无需额外 @Index
@Entity('gacha_pity_counter')
export class GachaPityCounter {
  @PrimaryColumn({ name: 'player_id', type: 'uuid' })
  playerId: string;

  @PrimaryColumn({ name: 'pool_id', type: 'varchar', length: 32 })
  poolId: string;

  @Column({ name: 'total_draws', type: 'int', default: 0, comment: '该池总抽数' })
  totalDraws: number;

  @Column({ name: 'since_last_legendary', type: 'int', default: 0, comment: '距上次传说抽数（软保底用）' })
  sinceLastLegendary: number;

  @Column({ name: 'since_last_rare', type: 'int', default: 0, comment: '距上次稀有及以上' })
  sinceLastRare: number;

  @Column({ name: 'ten_pull_index', type: 'int', default: 0, comment: '当前十连内位置（0-9）' })
  tenPullIndex: number;

  @Column({ name: 'guaranteed_legendary', type: 'boolean', default: false, comment: '是否已触发硬保底' })
  guaranteedLegendary: boolean;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
