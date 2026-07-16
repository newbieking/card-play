/**
 * 玩家档案控制器
 * 
 * 接口定义参见 docs/data/api-interfaces.md §3.2
 */

import { Controller, Get, Post, Body, Req, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';
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

  /** 获取卡牌列表 */
  @Get('inventory')
  async getInventory(@Req() req: any) {
    const playerId = req.user?.sub;
    return this.profileService.getInventory(playerId);
  }
}
