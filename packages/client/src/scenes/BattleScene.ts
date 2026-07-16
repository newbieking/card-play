/**
 * 战斗场景
 * 
 * 客户端战斗演出层，负责：
 * 1. 接收服务端 BattleResult 帧序列
 * 2. 逐帧播放战斗动画（卡牌移动/技能特效/伤害数字）
 * 3. 管理战斗 UI（血条/怒气/技能按钮）
 * 
 * 注意：
 * - 战斗逻辑由 @cardplay/battle-engine 处理
 * - 本文件仅负责表现层演出
 * - Cocos Creator 环境下的具体组件挂载需在 Creator 中实现
 */

import { BattleFrame, BattleAction } from '@cardplay/battle-engine';
import { WebSocketClient } from '../network/WebSocketClient';

/** 战斗场景状态 */
export type BattleSceneState = 'idle' | 'loading' | 'playing' | 'paused' | 'finished';

/** 战斗场景配置 */
export interface BattleSceneConfig {
  /** 动画播放倍速 */
  animationSpeed: number;
  /** 是否自动战斗 */
  autoBattle: boolean;
  /** 操作超时时间（毫秒） */
  actionTimeout: number;
}

/** 战斗场景默认配置 */
const DEFAULT_CONFIG: BattleSceneConfig = {
  animationSpeed: 1.0,
  autoBattle: false,
  actionTimeout: 30000,
};

export class BattleScene {
  private ws: WebSocketClient;
  private config: BattleSceneConfig;
  private state: BattleSceneState = 'idle';
  private battleId: string = '';
  private currentTurn: number = 0;

  constructor(ws: WebSocketClient, config?: Partial<BattleSceneConfig>) {
    this.ws = ws;
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.setupHandlers();
  }

  /** 注册 WebSocket 消息处理器 */
  private setupHandlers() {
    this.ws.on('BattleInit', (payload) => {
      console.log('[BattleScene] BattleInit received');
      this.battleId = payload.battle_id;
      this.state = 'loading';
      // TODO: 在 Cocos Creator 中初始化战斗 UI
      // - 显示双方阵容
      // - 初始化血条/怒气条
      // - 播放入场动画
      this.state = 'playing';
    });

    this.ws.on('BattleResult', (payload) => {
      console.log('[BattleScene] BattleResult received');
      this.playBattleAnimation(payload.frames).then(() => {
        this.state = 'finished';
        // TODO: 显示结算界面
        this.onBattleFinished(payload);
      });
    });
  }

  /** 开始战斗 */
  startBattle(stageId: string, formation: any[]) {
    if (this.state !== 'idle') {
      console.warn('[BattleScene] Cannot start battle in state:', this.state);
      return;
    }

    this.state = 'loading';
    this.ws.send('BattleStart', {
      stage_id: stageId,
      formation,
    });
  }

  /** 播放战斗动画序列 */
  private async playBattleAnimation(frames: BattleFrame[]): Promise<void> {
    for (const frame of frames) {
      this.currentTurn = frame.turn;
      for (const action of frame.actions) {
        await this.playActionAnimation(action);
      }
    }
  }

  /** 播放单个行动动画 */
  private async playActionAnimation(action: BattleAction): Promise<void> {
    const delay = 500 / this.config.animationSpeed;

    return new Promise((resolve) => {
      switch (action.type) {
        case 'attack':
          console.log(`[BattleScene] Attack: ${action.sourceId} → ${action.targetIds}`);
          // TODO: Cocos Creator 实现
          // - 近战：卡牌飞向目标，撞击特效，返回
          // - 远程：卡牌前倾，弹道飞行，命中特效
          break;

        case 'skill':
          console.log(`[BattleScene] Skill: ${action.sourceId} uses ${action.skillId}`);
          // TODO: Cocos Creator 实现
          // - 卡牌发光
          // - 播放元素特效（冰/火/雷/暗/光/自然）
          // - 显示伤害数字
          break;

        case 'ultimate':
          console.log(`[BattleScene] Ultimate: ${action.sourceId} uses ${action.skillId}`);
          // TODO: Cocos Creator 实现
          // - 全屏特效
          // - 屏幕震动
          // - 大号伤害数字
          break;

        case 'passive_trigger':
          console.log(`[BattleScene] Passive triggered on ${action.sourceId}: ${action.skillId}`);
          // TODO: Cocos Creator 实现
          // - 被动触发特效（较小的光效）
          // - 显示被动触发提示文字
          break;

        case 'buff_tick':
          console.log(`[BattleScene] Buff tick on ${action.sourceId}`);
          // TODO: Buff/Debuff 回合开始时的视觉反馈
          break;

        case 'dot_tick':
          console.log(`[BattleScene] DOT tick on ${action.sourceId}`);
          // TODO: DOT 伤害数字（较小字体）
          break;
      }

      setTimeout(resolve, delay);
    });
  }

  /** 发送玩家操作 */
  sendAction(action: any) {
    if (this.state !== 'playing') {
      console.warn('[BattleScene] Cannot send action in state:', this.state);
      return;
    }

    this.ws.sendBattleAction(this.battleId, this.currentTurn, action);
  }

  /** 暂停/恢复 */
  togglePause() {
    if (this.state === 'playing') {
      this.state = 'paused';
    } else if (this.state === 'paused') {
      this.state = 'playing';
    }
  }

  /** 倍速切换 */
  setSpeed(speed: number) {
    this.config.animationSpeed = Math.max(0.5, Math.min(3.0, speed));
  }

  /** 战斗结束回调 */
  private onBattleFinished(result: any) {
    console.log('[BattleScene] Battle finished:', result.winner);
    // TODO: 在 Cocos Creator 中
    // - 停止所有动画
    // - 显示结算界面（胜利/失败/平局）
    // - 展示奖励
  }

  /** 获取当前状态 */
  getState(): BattleSceneState {
    return this.state;
  }

  /** 重置场景 */
  reset() {
    this.state = 'idle';
    this.battleId = '';
    this.currentTurn = 0;
  }
}
