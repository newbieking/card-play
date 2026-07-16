/**
 * 任务进度实体
 * 
 * 对应 docs/data/data-model.md §3.12
 */

import { Entity, PrimaryColumn, Column, UpdateDateColumn } from 'typeorm';

@Entity('quest_progress')
export class QuestProgress {
  @PrimaryColumn({ name: 'player_id', type: 'uuid' })
  playerId: string;

  @PrimaryColumn({ name: 'quest_id', type: 'varchar', length: 32 })
  questId: string;

  @PrimaryColumn({ name: 'reset_date', type: 'date' })
  resetDate: string;

  @Column({ name: 'quest_type', type: 'varchar', length: 16, comment: 'daily/weekly/achievement' })
  questType: string;

  @Column({ type: 'int', default: 0, comment: '当前进度' })
  progress: number;

  @Column({ type: 'int', comment: '目标值' })
  target: number;

  @Column({ type: 'boolean', default: false })
  completed: boolean;

  @Column({ type: 'boolean', default: false, comment: '是否已领取奖励' })
  claimed: boolean;

  @Column({ name: 'completed_at', type: 'timestamptz', nullable: true })
  completedAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
