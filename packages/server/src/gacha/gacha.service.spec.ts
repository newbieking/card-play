/**
 * GachaService 单元测试
 */

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { GachaService } from './gacha.service';
import { GachaPityCounter } from '../database/entities/gacha-pity-counter.entity';
import { PlayerResource } from '../database/entities/player-resource.entity';
import { CardInstance } from '../database/entities/card-instance.entity';

describe('GachaService', () => {
  let service: GachaService;

  const mockPityRepo = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockResourceRepo = {
    findOne: jest.fn(),
    save: jest.fn(),
  };

  const mockCardRepo = {
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockDataSource = {
    transaction: jest.fn((fn: Function) => fn({
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    })),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GachaService,
        { provide: getRepositoryToken(GachaPityCounter), useValue: mockPityRepo },
        { provide: getRepositoryToken(PlayerResource), useValue: mockResourceRepo },
        { provide: getRepositoryToken(CardInstance), useValue: mockCardRepo },
        { provide: DataSource, useValue: mockDataSource },
      ],
    }).compile();

    service = module.get<GachaService>(GachaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getPools', () => {
    it('should return pool list', async () => {
      const result = await service.getPools();
      expect(result.code).toBe(0);
      expect(result.data.pools.length).toBeGreaterThan(0);
      expect(result.data.pools[0]).toHaveProperty('id');
      expect(result.data.pools[0]).toHaveProperty('name');
    });
  });

  describe('draw', () => {
    it('should throw NotFoundException for invalid pool', async () => {
      mockDataSource.transaction.mockImplementation(async (fn: Function) => {
        return fn({
          findOne: jest.fn().mockResolvedValue(null),
          find: jest.fn().mockResolvedValue([]),
          create: jest.fn(),
          save: jest.fn(),
        });
      });

      await expect(
        service.draw('player1', 'invalid_pool', 1)
      ).rejects.toThrow();
    });
  });
});
