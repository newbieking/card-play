/**
 * 配置同步控制器
 * 
 * 接口定义参见 docs/data/api-interfaces.md §3.3
 */

import { Controller, Get, Query } from '@nestjs/common';
import { GameConfigService } from './config.service';

@Controller('config')
export class ConfigController {
  constructor(private readonly gameConfigService: GameConfigService) {}

  /** 获取配置版本 */
  @Get('version')
  async getVersion() {
    return this.gameConfigService.getVersion();
  }

  /** 下载配置 */
  @Get('download')
  async download(@Query('version') version: string) {
    return this.gameConfigService.download(version);
  }
}
