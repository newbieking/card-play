/**
 * 卡牌管理模块
 */

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CardController } from './card.controller';
import { CardService } from './card.service';
import { AuthModule } from '../auth/auth.module';
import { CardInstance } from '../database/entities/card-instance.entity';
import { PlayerResource } from '../database/entities/player-resource.entity';
import { TeamFormation } from '../database/entities/team-formation.entity';

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([CardInstance, PlayerResource, TeamFormation]),
  ],
  controllers: [CardController],
  providers: [CardService],
})
export class CardModule {}
