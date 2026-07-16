/**
 * 抽卡模块
 */

import { Module } from '@nestjs/common';
import { GachaController } from './gacha.controller';
import { GachaService } from './gacha.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [GachaController],
  providers: [GachaService],
})
export class GachaModule {}
