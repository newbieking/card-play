/**
 * 数据库模块
 * 
 * 配置 TypeORM 连接 PostgreSQL
 */

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { entities } from './entities';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USER || 'cardplay',
      password: process.env.DB_PASSWORD || 'cardplay_dev',
      database: process.env.DB_NAME || 'cardplay',
      entities,
      synchronize: process.env.NODE_ENV === 'development', // 仅开发环境自动同步
      logging: process.env.NODE_ENV !== 'production',
    }),
  ],
})
export class DatabaseModule {}
