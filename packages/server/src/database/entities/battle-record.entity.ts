/**
 * 战斗记录实体
 * 
 * 对应 docs/data/data-model.md §3.10
 */

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('battle_record')
export class BattleRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'player_id', type: 'uuid' })
  @Index('idx_battle_player_time')
  playerId: string;

  @Column({ name: 'battle_type', type: 'varchar', length: 16, comment: 'adventure/tower/pvp' })
  battleType: string;

  @Column({ name: 'stage_id', type: 'varchar', length: 64, nullable: true })
  stageId: string;

  @Column({ type: 'bigint', nullable: true })
  seed: string;

  @Column({ type: 'varchar', length: 16, comment: 'win/lose/draw' })
  result: string;

  @Column({ name: 'player_power', type: 'int', nullable: true })
  playerPower: number;

  @Column({ name: 'enemy_power', type: 'int', nullable: true })
  enemyPower: number;

  @Column({ name: 'frame_count', type: 'int', nullable: true })
  frameCount: number;

  @Column({ name: 'replay_url', type: 'varchar', length: 512, nullable: true })
  replayUrl: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
