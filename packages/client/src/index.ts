/**
 * @cardplay/client
 * 
 * 卡牌游戏客户端入口
 */

// 常量
export { CLIENT_VERSION, DEFAULT_API_BASE_URL, DEFAULT_WS_URL } from './constants';

// 网络层
export * from './network';

// 战斗场景
export { BattleScene } from './scenes/BattleScene';
export type { BattleSceneState, BattleSceneConfig } from './scenes/BattleScene';
