/**
 * PVP 竞技场数据实体
 * 
 * 对应 docs/data/data-model.md §3.11
 * 匹配按阵容战力，升段按积分
 */

import { Entity, PrimaryColumn, Column, UpdateDateColumn } from 'typeorm';

@Entity('arena_data')
export class ArenaData {
  @PrimaryColumn({ name: 'player_id', type: 'uuid' })
  playerId: string;

  @Column({ type: 'int', default: 1000, comment: '段位积分' })
  score: number;

  @Column({ type: 'varchar', length: 16, default: 'bronze', comment: '段位' })
  tier: string;

  @Column({ name: 'defense_power', type: 'int', default: 0, comment: '防守阵容战力快照' })
  defensePower: number;

  @Column({ type: 'int', default: 0 })
  wins: number;

  @Column({ type: 'int', default: 0 })
  losses: number;

  @Column({ name: 'win_streak', type: 'int', default: 0, comment: '连胜计数' })
  winStreak: number;

  @Column({ name: 'season_id', type: 'int' })
  seasonId: number;

  @Column({ name: 'season_score', type: 'int', default: 1000, comment: '赛季初始积分' })
  seasonScore: number;

  // 防守阵容快照
  @Column({ name: 'defense_snapshot', type: 'jsonb', nullable: true })
  defenseSnapshot: Array<{
    cardInstanceId: string;
    cardDefId: string;
    level: number;
    star: number;
  }>;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
