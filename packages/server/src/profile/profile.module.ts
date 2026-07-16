/**
 * 玩家档案模块
 */

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';
import { AuthModule } from '../auth/auth.module';
import { PlayerAccount } from '../database/entities/player-account.entity';
import { PlayerResource } from '../database/entities/player-resource.entity';
import { CardInstance } from '../database/entities/card-instance.entity';

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([PlayerAccount, PlayerResource, CardInstance]),
  ],
  controllers: [ProfileController],
  providers: [ProfileService],
})
export class ProfileModule {}
