/**
 * 战斗模块
 */

import { Module } from '@nestjs/common';
import { BattleController } from './battle.controller';
import { BattleService } from './battle.service';
import { AuthModule } from '../auth/auth.module'; // 需要 JwtAuthGuard

@Module({
  imports: [AuthModule],
  controllers: [BattleController],
  providers: [BattleService],
  exports: [BattleService],
})
export class BattleModule {}
