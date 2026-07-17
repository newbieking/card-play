/**
 * CardService 单元测试
 */

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { CardService } from './card.service';
import { CardInstance } from '../database/entities/card-instance.entity';
import { PlayerResource } from '../database/entities/player-resource.entity';
import { TeamFormation } from '../database/entities/team-formation.entity';

describe('CardService', () => {
  let service: CardService;

  const mockCardRepo = {
    findOne: jest.fn(),
    find: jest.fn(),
    findByIds: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockResourceRepo = {
    findOne: jest.fn(),
    save: jest.fn(),
  };

  const mockFormationRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockDataSource = {
    transaction: jest.fn((fn: Function) => fn({
      findOne: jest.fn(),
      save: jest.fn(),
    })),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CardService,
        { provide: getRepositoryToken(CardInstance), useValue: mockCardRepo },
        { provide: getRepositoryToken(PlayerResource), useValue: mockResourceRepo },
        { provide: getRepositoryToken(TeamFormation), useValue: mockFormationRepo },
        { provide: DataSource, useValue: mockDataSource },
      ],
    }).compile();

    service = module.get<CardService>(CardService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('starUp', () => {
    it('should throw NotFoundException if card not found', async () => {
      mockCardRepo.findOne.mockResolvedValue(null);

      await expect(
        service.starUp('player1', 'card1', 2)
      ).rejects.toThrow();
    });
  });

  describe('skillLevelUp', () => {
    it('should throw NotFoundException if card not found', async () => {
      mockCardRepo.findOne.mockResolvedValue(null);

      await expect(
        service.skillLevelUp('player1', 'card1', 1)
      ).rejects.toThrow();
    });
  });

  describe('getFormation', () => {
    it('should return empty formations', async () => {
      mockFormationRepo.find.mockResolvedValue([]);

      const result = await service.getFormation('player1');
      expect(result.code).toBe(0);
      expect(result.data.formations).toEqual([]);
    });
  });
});
