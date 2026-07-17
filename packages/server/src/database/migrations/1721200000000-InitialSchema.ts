/**
 * 初始数据库迁移
 * 
 * 创建所有核心表
 */

import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1721200000000 implements MigrationInterface {
  name = 'InitialSchema1721200000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    // 玩家账号
    await queryRunner.query(`
      CREATE TABLE player_account (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        open_id VARCHAR(128),
        device_id VARCHAR(128) UNIQUE,
        platform VARCHAR(32) DEFAULT 'guest',
        nick_name VARCHAR(64) NOT NULL,
        avatar_url VARCHAR(512),
        level INT DEFAULT 1,
        exp BIGINT DEFAULT '0',
        vip_level INT DEFAULT 0,
        status SMALLINT DEFAULT 0,
        last_login_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now(),
        deleted_at TIMESTAMPTZ
      )
    `);

    // 玩家资源（与 player_account 通过应用层软删除保持一致，不加 FK）
    await queryRunner.query(`
      CREATE TABLE player_resource (
        player_id UUID PRIMARY KEY,
        gold BIGINT DEFAULT '0',
        diamond_free BIGINT DEFAULT '0',
        diamond_paid BIGINT DEFAULT '0',
        stamina INT DEFAULT 120,
        stamina_updated_at TIMESTAMPTZ,
        exp_potion INT DEFAULT 0,
        star_stone INT DEFAULT 0,
        skill_book INT DEFAULT 0,
        fragments INT DEFAULT 0,
        version INT DEFAULT 1,
        updated_at TIMESTAMPTZ DEFAULT now()
      )
    `);

    // 卡牌实例
    await queryRunner.query(`
      CREATE TABLE card_instance (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        player_id UUID NOT NULL,
        card_def_id VARCHAR(64) NOT NULL,
        level INT DEFAULT 1,
        star INT DEFAULT 1,
        exp BIGINT DEFAULT '0',
        quality_variant REAL DEFAULT 0,
        skill_1_lv INT DEFAULT 1,
        skill_2_lv INT DEFAULT 0,
        skill_3_lv INT DEFAULT 0,
        obtained_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now(),
        deleted_at TIMESTAMPTZ
      )
    `);
    await queryRunner.query(`CREATE INDEX idx_player_card ON card_instance(player_id, card_def_id)`);

    // 阵容配置
    await queryRunner.query(`
      CREATE TABLE team_formation (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        player_id UUID NOT NULL,
        name VARCHAR(64),
        positions JSONB NOT NULL,
        total_power INT DEFAULT 0,
        is_default BOOLEAN DEFAULT false,
        type VARCHAR(16),
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now()
      )
    `);
    await queryRunner.query(`CREATE INDEX idx_player_formation ON team_formation(player_id, type)`);

    // 抽卡保底计数器
    await queryRunner.query(`
      CREATE TABLE gacha_pity_counter (
        player_id UUID NOT NULL,
        pool_id VARCHAR(32) NOT NULL,
        total_draws INT DEFAULT 0,
        since_last_legendary INT DEFAULT 0,
        since_last_rare INT DEFAULT 0,
        ten_pull_index INT DEFAULT 0,
        guaranteed_legendary BOOLEAN DEFAULT false,
        updated_at TIMESTAMPTZ DEFAULT now(),
        PRIMARY KEY (player_id, pool_id)
      )
    `);
    -- 主键已自动创建索引，无需额外 CREATE INDEX

    // 战斗记录
    await queryRunner.query(`
      CREATE TABLE battle_record (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        player_id UUID NOT NULL,
        battle_type VARCHAR(16),
        stage_id VARCHAR(64),
        seed BIGINT,
        result VARCHAR(16),
        player_power INT,
        enemy_power INT,
        frame_count INT,
        replay_url VARCHAR(512),
        created_at TIMESTAMPTZ DEFAULT now()
      )
    `);
    await queryRunner.query(`CREATE INDEX idx_battle_player_time ON battle_record(player_id, created_at DESC)`);

    // 冒险进度
    await queryRunner.query(`
      CREATE TABLE adventure_progress (
        player_id UUID NOT NULL,
        stage_id VARCHAR(32) NOT NULL,
        chapter_id VARCHAR(32),
        stars INT DEFAULT 0,
        cleared BOOLEAN DEFAULT false,
        first_clear_at TIMESTAMPTZ,
        last_clear_at TIMESTAMPTZ,
        PRIMARY KEY (player_id, stage_id)
      )
    `);

    // 任务进度
    await queryRunner.query(`
      CREATE TABLE quest_progress (
        player_id UUID NOT NULL,
        quest_id VARCHAR(32) NOT NULL,
        reset_date DATE NOT NULL,
        quest_type VARCHAR(16),
        progress INT DEFAULT 0,
        target INT,
        completed BOOLEAN DEFAULT false,
        claimed BOOLEAN DEFAULT false,
        completed_at TIMESTAMPTZ,
        updated_at TIMESTAMPTZ DEFAULT now(),
        PRIMARY KEY (player_id, quest_id, reset_date)
      )
    `);

    // PVP 竞技场
    await queryRunner.query(`
      CREATE TABLE arena_data (
        player_id UUID PRIMARY KEY,
        score INT DEFAULT 1000,
        tier VARCHAR(16) DEFAULT 'bronze',
        defense_power INT DEFAULT 0,
        wins INT DEFAULT 0,
        losses INT DEFAULT 0,
        win_streak INT DEFAULT 0,
        season_id INT,
        season_score INT DEFAULT 1000,
        defense_snapshot JSONB,
        updated_at TIMESTAMPTZ DEFAULT now()
      )
    `);

    // 装备实例
    await queryRunner.query(`
      CREATE TABLE equip_instance (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        player_id UUID NOT NULL,
        card_instance_id UUID,
        equip_def_id VARCHAR(64) NOT NULL,
        slot VARCHAR(16),
        enhance_level INT DEFAULT 0,
        refine_attr1 VARCHAR(32),
        refine_attr2 VARCHAR(32),
        obtained_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now()
      )
    `);
    await queryRunner.query(`CREATE INDEX idx_player_equip ON equip_instance(player_id)`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS equip_instance`);
    await queryRunner.query(`DROP TABLE IF EXISTS arena_data`);
    await queryRunner.query(`DROP TABLE IF EXISTS quest_progress`);
    await queryRunner.query(`DROP TABLE IF EXISTS adventure_progress`);
    await queryRunner.query(`DROP TABLE IF EXISTS battle_record`);
    await queryRunner.query(`DROP TABLE IF EXISTS gacha_pity_counter`);
    await queryRunner.query(`DROP TABLE IF EXISTS team_formation`);
    await queryRunner.query(`DROP TABLE IF EXISTS card_instance`);
    await queryRunner.query(`DROP TABLE IF EXISTS player_resource`);
    await queryRunner.query(`DROP TABLE IF EXISTS player_account`);
  }
}
