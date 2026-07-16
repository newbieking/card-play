/**
 * 账号认证模块
 */

import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { PlayerAccount } from '../database/entities/player-account.entity';
import { PlayerResource } from '../database/entities/player-resource.entity';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'cardplay-dev-secret',
      signOptions: { expiresIn: '24h' },
    }),
    TypeOrmModule.forFeature([PlayerAccount, PlayerResource]),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
