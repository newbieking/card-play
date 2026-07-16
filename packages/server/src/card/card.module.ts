/**
 * 卡牌管理模块
 */

import { Module } from '@nestjs/common';
import { CardController } from './card.controller';
import { CardService } from './card.service';
import { AuthModule } from '../auth/auth.module'; // 需要 JwtAuthGuard

@Module({
  imports: [AuthModule],
  controllers: [CardController],
  providers: [CardService],
})
export class CardModule {}
