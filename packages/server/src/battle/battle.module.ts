/**
 * 战斗模块
 */

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BattleController } from './battle.controller';
import { BattleService } from './battle.service';
import { BattleGateway } from './battle.gateway';
import { AuthModule } from '../auth/auth.module';
import { CardInstance } from '../database/entities/card-instance.entity';
import { TeamFormation } from '../database/entities/team-formation.entity';
import { BattleRecord } from '../database/entities/battle-record.entity';
import { PlayerResource } from '../database/entities/player-resource.entity';

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([CardInstance, TeamFormation, BattleRecord, PlayerResource]),
  ],
  controllers: [BattleController],
  providers: [BattleService, BattleGateway],
  exports: [BattleService],
})
export class BattleModule {}
