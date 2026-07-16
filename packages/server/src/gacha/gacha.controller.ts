/**
 * 抽卡控制器
 * 
 * 接口定义参见 docs/data/api-interfaces.md §3.7
 */

import { Controller, Get, Post, Body, Req, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { IsString, IsNotEmpty, IsInt, Min, Max, IsIn } from 'class-validator';
import { GachaService } from './gacha.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

class DrawDto {
  @IsString()
  @IsNotEmpty()
  poolId: string;

  @IsInt()
  @IsIn([1, 10])
  count: number;
}

@UseGuards(JwtAuthGuard)
@Controller('gacha')
export class GachaController {
  constructor(private readonly gachaService: GachaService) {}

  /** 获取卡池列表 */
  @Get('pools')
  async getPools() {
    return this.gachaService.getPools();
  }

  /** 抽卡 */
  @Post('draw')
  @HttpCode(HttpStatus.OK)
  async draw(@Req() req: any, @Body() dto: DrawDto) {
    const playerId = req.user?.sub;
    return this.gachaService.draw(playerId, dto.poolId, dto.count);
  }
}
