/**
 * 战斗 WebSocket Gateway
 * 
 * 处理战斗相关的实时通信
 * 参见 docs/combat/battle-protocol.md
 * 参见 docs/data/api-interfaces.md §2.2
 */

import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { BattleService } from './battle.service';

interface AuthenticatedSocket extends Socket {
  playerId?: string;
}

@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  },
  pingInterval: 30000,  // 30 秒心跳间隔
  pingTimeout: 10000,   // 10 秒心跳超时
})
export class BattleGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  // 支持多设备登录：playerId -> Set<socketId>
  private activeSockets: Map<string, Set<string>> = new Map();

  private static readonly AUTH_TIMEOUT_MS = 10000; // 认证超时 10 秒

  constructor(
    private readonly battleService: BattleService,
    private readonly jwtService: JwtService,
  ) {}

  /** 客户端连接 */
  async handleConnection(client: AuthenticatedSocket) {
    console.log(`[WS] Client connected: ${client.id}`);

    // 认证超时机制：10 秒内未认证则断开
    const authTimeout = setTimeout(() => {
      if (!client.playerId) {
        console.log(`[WS] Auth timeout: ${client.id}`);
        client.emit('error', { code: 3, msg: 'auth_timeout' });
        client.disconnect();
      }
    }, BattleGateway.AUTH_TIMEOUT_MS);

    // 首条消息认证
    client.once('auth', async (data: { token: string }) => {
      clearTimeout(authTimeout);

      try {
        const payload = this.jwtService.verify(data.token);
        client.playerId = payload.sub;

        // 支持多设备登录
        if (!this.activeSockets.has(payload.sub)) {
          this.activeSockets.set(payload.sub, new Set());
        }
        this.activeSockets.get(payload.sub)!.add(client.id);

        console.log(`[WS] Client authenticated: ${payload.sub} (${client.id})`);
        client.emit('auth_success', { player_id: payload.sub });
      } catch (error) {
        console.log(`[WS] Auth failed: ${client.id}`);
        client.emit('auth_error', { code: 3, msg: 'unauthorized' });
        client.disconnect();
      }
    });
  }

  /** 客户端断开 */
  handleDisconnect(client: AuthenticatedSocket) {
    console.log(`[WS] Client disconnected: ${client.id}`);
    if (client.playerId) {
      const sockets = this.activeSockets.get(client.playerId);
      if (sockets) {
        sockets.delete(client.id);
        if (sockets.size === 0) {
          this.activeSockets.delete(client.playerId);
        }
      }
    }
  }

  /** 开始战斗 */
  @SubscribeMessage('BattleStart')
  async handleBattleStart(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { stage_id: string; formation: any[] },
  ) {
    if (!client.playerId) {
      client.emit('error', { code: 3, msg: 'unauthorized' });
      return;
    }

    const result = await this.battleService.startBattle(
      client.playerId,
      data.formation,
    );

    client.emit('BattleInit', result.data);
  }

  /** 战斗操作 */
  @SubscribeMessage('BattleAction')
  async handleBattleAction(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { battle_id: string; turn: number; action: any },
  ) {
    if (!client.playerId) {
      client.emit('error', { code: 3, msg: 'unauthorized' });
      return;
    }

    try {
      // 收集玩家操作（简化：直接执行战斗）
      const result = await this.battleService.executeBattle(
        data.battle_id,
        client.playerId,
      );

      client.emit('BattleResult', result.data);
    } catch (error) {
      client.emit('error', {
        code: error.code || 5000,
        msg: error.message || 'battle_error',
      });
    }
  }

  /** 发送通知给指定玩家（所有设备） */
  sendToPlayer(playerId: string, event: string, data: any) {
    const sockets = this.activeSockets.get(playerId);
    if (sockets) {
      for (const socketId of sockets) {
        this.server.to(socketId).emit(event, data);
      }
    }
  }
}
