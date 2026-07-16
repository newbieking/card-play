/**
 * JWT 认证守卫
 * 
 * 用于保护需要登录的接口
 * 公开接口（如登录、配置下载）不需要此守卫
 */

import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any) {
    if (err || !user) {
      throw err || new UnauthorizedException({
        code: 3,
        msg: 'unauthorized',
      });
    }
    return user;
  }
}
