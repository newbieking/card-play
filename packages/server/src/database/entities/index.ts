/**
 * 数据库实体导出
 */

export { PlayerAccount } from './player-account.entity';
export { PlayerResource } from './player-resource.entity';
export { CardInstance } from './card-instance.entity';
export { EquipInstance } from './equip-instance.entity';
export { TeamFormation } from './team-formation.entity';
export { GachaPityCounter } from './gacha-pity-counter.entity';
export { AdventureProgress } from './adventure-progress.entity';
export { QuestProgress } from './quest-progress.entity';
export { ArenaData } from './arena-data.entity';

/** 所有实体列表（用于 TypeORM 配置） */
export const entities = [
  PlayerAccount,
  PlayerResource,
  CardInstance,
  EquipInstance,
  TeamFormation,
  GachaPityCounter,
  AdventureProgress,
  QuestProgress,
  ArenaData,
];
