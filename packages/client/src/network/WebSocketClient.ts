/**
 * WebSocket 客户端
 * 
 * 封装 WebSocket 长连接，用于战斗/PVP 等实时通信
 * 参见 docs/data/api-interfaces.md §2.2
 */

export type MessageType = 'BattleStart' | 'BattleInit' | 'BattleAction' | 'BattleResult' | 'Notification';

export interface WebSocketMessage {
  type: MessageType;
  req_id?: string;
  payload: any;
}

export class WebSocketClient {
  private ws: WebSocket | null = null;
  private url: string;
  private handlers: Map<MessageType, (payload: any) => void> = new Map();
  private errorHandler?: (error: any) => void;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private reconnectAttempts: number = 0;
  private static readonly MAX_RECONNECT_ATTEMPTS = 10;
  private static readonly RECONNECT_INTERVAL = 3000;

  constructor(url: string) {
    this.url = url;
  }

  /** 注册错误回调 */
  onError(handler: (error: any) => void) {
    this.errorHandler = handler;
  }

  /** 连接 WebSocket */
  connect(token: string) {
    this.ws = new WebSocket(`${this.url}?token=${token}`);

    this.ws.onopen = () => {
      console.log('🔗 WebSocket connected');
      this.reconnectAttempts = 0; // 重置重连计数
    };

    this.ws.onmessage = (event) => {
      const msg: WebSocketMessage = JSON.parse(event.data);
      const handler = this.handlers.get(msg.type);
      if (handler) {
        handler(msg.payload);
      }
    };

    this.ws.onclose = () => {
      console.log('🔌 WebSocket disconnected');
      this.scheduleReconnect(token);
    };

    this.ws.onerror = (error) => {
      console.error('❌ WebSocket error:', error);
      this.errorHandler?.(error);
    };
  }

  /** 断线重连（带次数限制） */
  private scheduleReconnect(token: string) {
    if (this.reconnectTimer) return;
    if (this.reconnectAttempts >= WebSocketClient.MAX_RECONNECT_ATTEMPTS) {
      console.error('❌ Max reconnect attempts reached');
      this.errorHandler?.(new Error('Max reconnect attempts reached'));
      return;
    }

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.reconnectAttempts++;
      console.log(`🔄 Reconnect attempt ${this.reconnectAttempts}/${WebSocketClient.MAX_RECONNECT_ATTEMPTS}`);
      this.connect(token);
    }, WebSocketClient.RECONNECT_INTERVAL);
  }

  /** 注册消息处理器 */
  on(type: MessageType, handler: (payload: any) => void) {
    this.handlers.set(type, handler);
  }

  /** 发送消息 */
  send(type: MessageType, payload: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type,
        req_id: crypto.randomUUID(),
        payload,
      }));
    }
  }

  /** 发送战斗操作 */
  sendBattleAction(battleId: string, turn: number, action: any) {
    this.send('BattleAction', {
      battle_id: battleId,
      turn,
      action,
    });
  }

  /** 断开连接 */
  disconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }
    this.ws?.close();
  }
}
