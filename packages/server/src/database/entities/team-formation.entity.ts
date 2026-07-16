/**
 * 阵容配置实体
 * 
 * 对应 docs/data/data-model.md §3.5
 * 统一 5 张卡牌，2 前 3 后阵型
 */

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('team_formation')
export class TeamFormation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'player_id', type: 'uuid' })
  @Index('idx_player_formation')
  playerId: string;

  @Column({ type: 'varchar', length: 64, nullable: true })
  name: string;

  // JSON 存储阵容位置：[{pos: 0-4, card_instance_id, row: 'front'|'back'}]
  @Column({ type: 'jsonb' })
  positions: Array<{
    pos: number;
    cardInstanceId: string;
    row: 'front' | 'back';
  }>;

  @Column({ name: 'total_power', type: 'int', default: 0, comment: '阵容总战力（保存时计算快照）' })
  totalPower: number;

  @Column({ name: 'is_default', type: 'boolean', default: false })
  isDefault: boolean;

  @Column({ type: 'varchar', length: 16, comment: 'adventure/tower/pvp_defense' })
  type: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
