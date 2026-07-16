/**
 * 玩家档案控制器
 * 
 * 接口定义参见 docs/data/api-interfaces.md §3.2
 */

import { Controller, Get, Post, Body, Req, Query, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { IsString, IsNotEmpty, MinLength, MaxLength, IsOptional, IsInt, Min } from 'class-validator';
import { ProfileService } from './profile.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

class UpdateNicknameDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(20)
  nickname: string;
}

@UseGuards(JwtAuthGuard)
@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  /** 获取档案 */
  @Get()
  async getProfile(@Req() req: any) {
    const playerId = req.user?.sub;
    return this.profileService.getProfile(playerId);
  }

  /** 更新昵称 */
  @Post('update_nickname')
  @HttpCode(HttpStatus.OK)
  async updateNickname(@Req() req: any, @Body() dto: UpdateNicknameDto) {
    const playerId = req.user?.sub;
    return this.profileService.updateNickname(playerId, dto.nickname);
  }

  /** 获取卡牌列表（支持分页） */
  @Get('inventory')
  async getInventory(
    @Req() req: any,
    @Query('page') page?: string,
    @Query('page_size') pageSize?: string,
  ) {
    const playerId = req.user?.sub;
    const pageNum = page ? Math.max(1, parseInt(page, 10)) : 1;
    const size = pageSize ? Math.min(100, Math.max(1, parseInt(pageSize, 10))) : 50;
    return this.profileService.getInventory(playerId, pageNum, size);
  }
}
