/**
 * 游戏配置同步模块
 */

import { Module } from '@nestjs/common';
import { ConfigController } from './config.controller';
import { GameConfigService } from './config.service';

@Module({
  controllers: [ConfigController],
  providers: [GameConfigService],
})
export class ConfigModule {}
