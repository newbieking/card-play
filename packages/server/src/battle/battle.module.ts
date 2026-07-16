/**
 * 战斗模块
 */

import { Module } from '@nestjs/common';
import { BattleController } from './battle.controller';
import { BattleService } from './battle.service';
import { BattleGateway } from './battle.gateway';
import { AuthModule } from '../auth/auth.module'; // 需要 JwtAuthGuard + JwtService

@Module({
  imports: [AuthModule],
  controllers: [BattleController],
  providers: [BattleService, BattleGateway],
  exports: [BattleService],
})
export class BattleModule {}
