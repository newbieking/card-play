/**
 * 账号认证服务
 * 
 * 接口定义参见 docs/data/api-interfaces.md §3.1
 */

import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { PlayerAccount } from '../database/entities/player-account.entity';
import { PlayerResource } from '../database/entities/player-resource.entity';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(PlayerAccount)
    private readonly accountRepo: Repository<PlayerAccount>,
    @InjectRepository(PlayerResource)
    private readonly resourceRepo: Repository<PlayerResource>,
  ) {}

  /** 游客登录 */
  async guestLogin(deviceId: string) {
    this.logger.log(`Guest login attempt: deviceId=${deviceId}`);

    // 查询是否已有该设备的游客账号
    let account = await this.accountRepo.findOne({ where: { deviceId } });
    let isNewPlayer = false;

    if (account) {
      // 已有账号，更新登录时间
      account.lastLoginAt = new Date();
      await this.accountRepo.save(account);
      this.logger.log(`Existing player logged in: ${account.id}`);
    } else {
      // 创建新账号
      const playerId = uuidv4();
      account = this.accountRepo.create({
        id: playerId,
        deviceId,
        platform: 'guest',
        nickName: `游客${playerId.slice(0, 6)}`,
        lastLoginAt: new Date(),
      });
      await this.accountRepo.save(account);

      // 创建初始资源
      const resource = this.resourceRepo.create({
        playerId,
        gold: '50000',
        diamondFree: '200',
        diamondPaid: '0',
        stamina: 120,
        staminaUpdatedAt: new Date(),
      });
      await this.resourceRepo.save(resource);

      isNewPlayer = true;
      this.logger.log(`New player created: ${playerId}`);
    }

    // 生成 JWT Token
    const token = this.jwtService.sign({
      sub: account.id,
      platform: 'guest',
    });

    return {
      code: 0,
      data: {
        token,
        player_id: account.id,
        is_new_player: isNewPlayer,
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
