/**
 * BattleService 单元测试
 */

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BattleService } from './battle.service';
import { CardInstance } from '../database/entities/card-instance.entity';
import { TeamFormation } from '../database/entities/team-formation.entity';
import { BattleRecord } from '../database/entities/battle-record.entity';
import { PlayerResource } from '../database/entities/player-resource.entity';

describe('BattleService', () => {
  let service: BattleService;

  const mockCardRepo = {
    findByIds: jest.fn(),
  };

  const mockFormationRepo = {
    find: jest.fn(),
  };

  const mockRecordRepo = {
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockResourceRepo = {
    findOne: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BattleService,
        { provide: getRepositoryToken(CardInstance), useValue: mockCardRepo },
        { provide: getRepositoryToken(TeamFormation), useValue: mockFormationRepo },
        { provide: getRepositoryToken(BattleRecord), useValue: mockRecordRepo },
        { provide: getRepositoryToken(PlayerResource), useValue: mockResourceRepo },
      ],
    }).compile();

    service = module.get<BattleService>(BattleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('startBattle', () => {
    it('should throw BadRequestException for invalid formation', async () => {
      await expect(
        service.startBattle('player1', [])
      ).rejects.toThrow();
    });

    it('should throw BadRequestException for wrong card count', async () => {
      await expect(
        service.startBattle('player1', [
          { cardInstanceId: '1' },
          { cardInstanceId: '2' },
        ])
      ).rejects.toThrow();
    });
  });
});
