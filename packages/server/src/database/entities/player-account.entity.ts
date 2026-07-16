/**
 * 玩家账号实体
 * 
 * 对应 docs/data/data-model.md §3.1
 */

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';

@Entity('player_account')
export class PlayerAccount {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'open_id', type: 'varchar', length: 128, nullable: true })
  openId: string;

  @Column({ type: 'varchar', length: 32, default: 'guest' })
  platform: string;

  @Column({ name: 'nick_name', type: 'varchar', length: 64 })
  nickName: string;

  @Column({ name: 'avatar_url', type: 'varchar', length: 512, nullable: true })
  avatarUrl: string;

  @Column({ type: 'int', default: 1 })
  level: number;

  @Column({ type: 'bigint', default: '0' })
  exp: string;

  @Column({ name: 'vip_level', type: 'int', default: 0 })
  vipLevel: number;

  @Column({ type: 'smallint', default: 0, comment: '0=正常 1=封禁 2=注销' })
  status: number;

  @Column({ name: 'last_login_at', type: 'timestamptz', nullable: true })
  lastLoginAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true, comment: '软删除时间戳' })
  deletedAt: Date;
}
