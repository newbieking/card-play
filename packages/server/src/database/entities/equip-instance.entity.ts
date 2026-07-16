/**
 * 装备实例实体
 * 
 * 对应 docs/data/data-model.md §3.4
 */

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('equip_instance')
export class EquipInstance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'player_id', type: 'uuid' })
  @Index('idx_player_equip')
  playerId: string;

  @Column({ name: 'card_instance_id', type: 'uuid', nullable: true, comment: 'NULL=未装备' })
  cardInstanceId: string;

  @Column({ name: 'equip_def_id', type: 'varchar', length: 64 })
  equipDefId: string;

  @Column({ type: 'varchar', length: 16, comment: 'weapon/armor/accessory' })
  slot: string;

  @Column({ name: 'enhance_level', type: 'int', default: 0, comment: '强化 +0 ~ +15' })
  enhanceLevel: number;

  @Column({ name: 'refine_attr1', type: 'varchar', length: 32, nullable: true })
  refineAttr1: string;

  @Column({ name: 'refine_attr2', type: 'varchar', length: 32, nullable: true })
  refineAttr2: string;

  @CreateDateColumn({ name: 'obtained_at' })
  obtainedAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
