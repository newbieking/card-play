/**
 * 抽卡模块
 */

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GachaController } from './gacha.controller';
import { GachaService } from './gacha.service';
import { AuthModule } from '../auth/auth.module';
import { GachaPityCounter } from '../database/entities/gacha-pity-counter.entity';
import { PlayerResource } from '../database/entities/player-resource.entity';
import { CardInstance } from '../database/entities/card-instance.entity';

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([GachaPityCounter, PlayerResource, CardInstance]),
  ],
  controllers: [GachaController],
  providers: [GachaService],
})
export class GachaModule {}
