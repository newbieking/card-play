/**
 * 账号认证控制器
 * 
 * 接口定义参见 docs/data/api-interfaces.md §3.1
 */

import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { IsString, IsNotEmpty } from 'class-validator';
import { AuthService } from './auth.service';

class GuestLoginDto {
  @IsString()
  @IsNotEmpty()
  deviceId: string;

  @IsString()
  platform: string = 'guest';

  @IsString()
  clientVersion: string = '0.1.0';
}

class RefreshTokenDto {
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}

@Controller('account')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /** 游客登录 */
  @Post('guest_login')
  @HttpCode(HttpStatus.OK)
  async guestLogin(@Body() dto: GuestLoginDto) {
    return this.authService.guestLogin(dto.deviceId);
  }

  /** 刷新 Token */
  @Post('refresh_token')
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshToken(dto.refreshToken);
  }
}
