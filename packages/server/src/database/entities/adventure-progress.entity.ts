/**
 * 冒险进度实体
 * 
 * 对应 docs/data/data-model.md §3.6
 */

import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('adventure_progress')
export class AdventureProgress {
  @PrimaryColumn({ name: 'player_id', type: 'uuid' })
  playerId: string;

  @PrimaryColumn({ name: 'stage_id', type: 'varchar', length: 32 })
  stageId: string;

  @Column({ name: 'chapter_id', type: 'varchar', length: 32 })
  chapterId: string;

  @Column({ type: 'int', default: 0, comment: '最高星级' })
  stars: number;

  @Column({ type: 'boolean', default: false })
  cleared: boolean;

  @Column({ name: 'first_clear_at', type: 'timestamptz', nullable: true })
  firstClearAt: Date;

  @Column({ name: 'last_clear_at', type: 'timestamptz', nullable: true })
  lastClearAt: Date;
}
