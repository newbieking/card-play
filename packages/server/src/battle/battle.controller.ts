/**
 * 战斗控制器
 * 
 * 参见 docs/data/api-interfaces.md §3.5
 * 注意：战斗主要通过 WebSocket 进行，HTTP 接口用于开始战斗
 */

import { Controller, Post, Body, Req, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { IsString, IsNotEmpty, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { BattleService } from './battle.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

class StartBattleDto {
  @IsString()
  @IsNotEmpty()
  stageId: string;

  @IsArray()
  formation: any[]; // TODO: 定义 FormationPositionDto
}

@UseGuards(JwtAuthGuard)
@Controller('battle')
export class BattleController {
  constructor(private readonly battleService: BattleService) {}

  /** 开始战斗 */
  @Post('start')
  @HttpCode(HttpStatus.OK)
  async startBattle(@Req() req: any, @Body() dto: StartBattleDto) {
    const playerId = req.user?.sub;
    return this.battleService.startBattle(playerId, dto.formation);
  }
}
