/**
 * 游戏配置同步服务
 * 
 * 注意：类名使用 GameConfigService 而非 ConfigService，
 * 避免与 @nestjs/config 的 ConfigService 命名冲突。
 */

import { Injectable } from '@nestjs/common';

@Injectable()
export class GameConfigService {
  /** 获取配置版本 */
  async getVersion() {
    // TODO: 从 Config Center 获取最新版本
    return {
      code: 0,
      data: {
        latest_version: '2024.07.16.001',
        min_required_version: '2024.07.01.000',
        force_update: false,
        download_url: 'https://cdn.example.com/config/2024.07.16.001.json',
      },
    };
  }

  /** 下载配置 */
  async download(version: string) {
    // TODO: 从 Config Center 获取指定版本配置
    return {
      code: 0,
      data: {
        version,
        configs: {
          card_def: [],
          card_skill: [],
          card_star_up: [],
          global_const: {},
        },
      },
    };
  }
}
