/**
 * 卡牌实例实体
 * 
 * 对应 docs/data/data-model.md §3.3
 * 注意：面板属性（HP/ATK/MATK/DEF/MDEF/SPD）运行时计算，不落库存储
 */

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, Index } from 'typeorm';

@Entity('card_instance')
export class CardInstance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'player_id', type: 'uuid' })
  @Index('idx_player_card')
  playerId: string;

  @Column({ name: 'card_def_id', type: 'varchar', length: 64 })
  @Index('idx_player_card')
  cardDefId: string;

  @Column({ type: 'int', default: 1 })
  level: number;

  @Column({ type: 'int', default: 1 })
  star: number;

  @Column({ type: 'bigint', default: '0' })
  exp: string;

  @Column({ name: 'quality_variant', type: 'real', default: 0 })
  qualityVariant: number;

  @Column({ name: 'skill_1_lv', type: 'int', default: 1, comment: '主动技能等级（怒气驱动）' })
  skill1Lv: number;

  @Column({ name: 'skill_2_lv', type: 'int', default: 0, comment: '被动技能等级（0=未解锁）' })
  skill2Lv: number;

  @Column({ name: 'skill_3_lv', type: 'int', default: 0, comment: '终极技能等级（冷却驱动，0=未解锁）' })
  skill3Lv: number;

  @CreateDateColumn({ name: 'obtained_at' })
  obtainedAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true, comment: '软删除时间戳' })
  deletedAt: Date;
}
