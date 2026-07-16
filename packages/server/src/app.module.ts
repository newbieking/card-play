/**
 * 根模块
 */

import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ProfileModule } from './profile/profile.module';
import { CardModule } from './card/card.module';
import { BattleModule } from './battle/battle.module';
import { ConfigModule } from './config/config.module';
import { GachaModule } from './gacha/gacha.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    HealthModule,
    AuthModule,
    ProfileModule,
    CardModule,
    BattleModule,
    ConfigModule,
    GachaModule,
  ],
})
export class AppModule {}
