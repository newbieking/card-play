/**
 * 账号认证服务
 */

import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  /** 游客登录 */
  async guestLogin(deviceId: string) {
    // TODO: 查询数据库，如不存在则创建游客账号
    const playerId = uuidv4();

    const token = this.jwtService.sign({
      sub: playerId,
      platform: 'guest',
    });

    return {
      code: 0,
      data: {
        token,
        player_id: playerId,
        is_new_player: true,
        server_time: Date.now(),
      },
    };
  }

  /** 刷新 Token */
  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken);
      const newToken = this.jwtService.sign({
        sub: payload.sub,
        platform: payload.platform,
      });

      return {
        code: 0,
        data: {
          token: newToken,
        },
      };
    } catch {
      return {
        code: 1004,
        msg: 'token_expired',
      };
    }
  }
}
