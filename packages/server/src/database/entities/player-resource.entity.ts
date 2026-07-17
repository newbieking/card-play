/**
 * 玩家资源实体
 * 
 * 对应 docs/data/data-model.md §3.2
 */

import { Entity, PrimaryColumn, Column, UpdateDateColumn, VersionColumn } from 'typeorm';

// 与 player_account 通过应用层软删除保持一致，不加 FK
@Entity('player_resource')
export class PlayerResource {
  @PrimaryColumn({ name: 'player_id', type: 'uuid' })
  playerId: string;

  // 注意：PostgreSQL bigint 超过 JS Number 安全范围，TypeORM 映射为 string
  // 使用时需 parseInt() 转换，或在业务层处理
  @Column({ type: 'bigint', default: '0' })
  gold: string;

  @Column({ name: 'diamond_free', type: 'bigint', default: '0' })
  diamondFree: string;

  @Column({ name: 'diamond_paid', type: 'bigint', default: '0' })
  diamondPaid: string;

  @Column({ type: 'int', default: 120 })
  stamina: number;

  @Column({ name: 'stamina_updated_at', type: 'timestamptz', nullable: true })
  staminaUpdatedAt: Date;

  @Column({ name: 'exp_potion', type: 'int', default: 0 })
  expPotion: number;

  @Column({ name: 'star_stone', type: 'int', default: 0 })
  starStone: number;

  @Column({ name: 'skill_book', type: 'int', default: 0 })
  skillBook: number;

  @Column({ name: 'fragments', type: 'int', default: 0, comment: '通用碎片（抽卡重复卡转化）' })
  fragments: number;

  @VersionColumn({ type: 'int', default: 1, comment: '乐观锁版本号' })
  version: number;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  /** 获取金币数值（安全转换） */
  getGoldNumber(): number {
    return parseInt(this.gold, 10) || 0;
  }

  /** 获取免费钻石数值 */
  getDiamondFreeNumber(): number {
    return parseInt(this.diamondFree, 10) || 0;
  }

  /** 获取付费钻石数值 */
  getDiamondPaidNumber(): number {
    return parseInt(this.diamondPaid, 10) || 0;
  }
}
