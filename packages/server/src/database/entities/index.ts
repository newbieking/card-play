/**
 * 数据库实体导出
 */

export { PlayerAccount } from './player-account.entity';
export { PlayerResource } from './player-resource.entity';
export { CardInstance } from './card-instance.entity';

/** 所有实体列表（用于 TypeORM 配置） */
export const entities = [
  PlayerAccount,
  PlayerResource,
  CardInstance,
];
