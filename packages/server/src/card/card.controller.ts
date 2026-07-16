/**
 * 卡牌管理控制器
 * 
 * 接口定义参见 docs/data/api-interfaces.md §3.4
 */

import { Controller, Get, Post, Body, Req, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { IsString, IsNotEmpty, IsInt, Min, Max, IsArray, ValidateNested, IsIn, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { CardService } from './card.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

class StarUpDto {
  @IsString()
  @IsNotEmpty()
  cardInstanceId: string;

  @IsInt()
  @Min(2)
  @Max(10)
  targetStar: number;
}

class SkillLevelUpDto {
  @IsString()
  @IsNotEmpty()
  cardInstanceId: string;

  @IsInt()
  @Min(1)
  @Max(3)
  skillSlot: number;
}

class FormationPositionDto {
  @IsInt()
  @Min(0)
  @Max(4)
  pos: number;

  @IsString()
  @IsNotEmpty()
  cardInstanceId: string;

  @IsIn(['front', 'back'])
  row: 'front' | 'back';
}

class SetFormationDto {
  @IsString()
  @IsOptional()
  formationId?: string;

  @IsString()
  name: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FormationPositionDto)
  positions: FormationPositionDto[];

  @IsOptional()
  isDefault?: boolean;
}

@UseGuards(JwtAuthGuard)
@Controller('card')
export class CardController {
  constructor(private readonly cardService: CardService) {}

  /** 卡牌升星 */
  @Post('star_up')
  @HttpCode(HttpStatus.OK)
  async starUp(@Req() req: any, @Body() dto: StarUpDto) {
    const playerId = req.user?.sub;
    return this.cardService.starUp(playerId, dto.cardInstanceId, dto.targetStar);
  }

  /** 技能升级 */
  @Post('skill_level_up')
  @HttpCode(HttpStatus.OK)
  async skillLevelUp(@Req() req: any, @Body() dto: SkillLevelUpDto) {
    const playerId = req.user?.sub;
    return this.cardService.skillLevelUp(playerId, dto.cardInstanceId, dto.skillSlot);
  }

  /** 获取阵容 */
  @Get('formation')
  async getFormation(@Req() req: any) {
    const playerId = req.user?.sub;
    return this.cardService.getFormation(playerId);
  }

  /** 设置阵容 */
  @Post('set_formation')
  @HttpCode(HttpStatus.OK)
  async setFormation(@Req() req: any, @Body() dto: SetFormationDto) {
    const playerId = req.user?.sub;
    return this.cardService.setFormation(playerId, dto);
  }
}
