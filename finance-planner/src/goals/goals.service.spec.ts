/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { GoalsService } from './goals.service';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { PrismaClient } from 'generated/prisma';
import { PrismaService } from '../prisma.service';
import { UpdateGoalDto } from './dto/update-goal.schema';
import { CreateGoalDto } from './dto/create-goal.schema';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

describe('GoalsService', () => {
  let service: GoalsService;

  let prismaMock: DeepMockProxy<PrismaClient>;

  const mockLogger = {
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    verbose: jest.fn(),
  };

  beforeEach(async () => {
    prismaMock = mockDeep<PrismaClient>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GoalsService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
        {
          provide: WINSTON_MODULE_NEST_PROVIDER,
          useValue: mockLogger,
        },
      ],
    }).compile();

    service = module.get<GoalsService>(GoalsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a goal', async () => {
      const createGoalDto: CreateGoalDto = {
        userId: 1,
        value: 1000,
        deadline: '2025-12-31',
        name: 'New Goal',
      };

      const expectedResult = {
        id: 1,
        user_id: 1,
        value: 1000,
        deadline: new Date(createGoalDto.deadline),
        name: 'New Goal',
      };

      prismaMock.goal.create.mockResolvedValue(expectedResult);

      const result = await service.create(createGoalDto);

      expect(result).toEqual(expectedResult);
      expect(prismaMock.goal.create).toHaveBeenCalledWith({
        data: {
          user_id: 1,
          value: 1000,
          deadline: new Date(createGoalDto.deadline),
          name: 'New Goal',
        },
      });
    });
  });

  describe('findAll', () => {
    it('should return a paginated list of goals with filters', async () => {
      const goals = [
        {
          id: 1,
          user_id: 1,
          value: 1000,
          deadline: new Date('2025-12-31'),
          name: 'New Goal',
        },
      ];

      prismaMock.goal.findMany.mockResolvedValue(goals);

      const result = await service.findAll(1, 2, { user_id: '1' });

      expect(result).toEqual(goals);
      expect(prismaMock.goal.findMany).toHaveBeenCalledWith({
        where: { user_id: '1' },
        skip: 0,
        take: 2,
      });
    });
  });

  describe('findOne', () => {
    it('should return one goal by id', async () => {
      const goal = {
        id: 1,
        user_id: 1,
        value: 1000,
        deadline: new Date('2025-12-31'),
        name: 'New Goal',
      };

      prismaMock.goal.findUnique.mockResolvedValue(goal);

      const result = await service.findOne(1);

      expect(result).toEqual(goal);
      expect(prismaMock.goal.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });
  });

  describe('update', () => {
    it('should update a goal', async () => {
      const updateGoalDto: UpdateGoalDto = {
        name: 'Updated Goal',
        value: 1500,
        deadline: '2025-12-31',
      };

      const updatedGoal = {
        id: 1,
        name: 'Updated Goal',
        value: 1500,
        deadline: new Date(updateGoalDto.deadline as string),
        user_id: 1,
      };

      prismaMock.goal.update.mockResolvedValue(updatedGoal);

      const result = await service.update(1, updateGoalDto);

      expect(result).toEqual(updatedGoal);
      expect(prismaMock.goal.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: updateGoalDto,
      });
    });
  });

  describe('remove', () => {
    it('should delete a goal', async () => {
      const deletedGoal = {
        id: 1,
        name: 'Deleted Goal',
        value: 1000,
        user_id: 1,
        deadline: new Date('2025-12-31'),
      };

      prismaMock.goal.delete.mockResolvedValue(deletedGoal);

      const result = await service.remove(1);

      expect(result).toEqual(deletedGoal);
      expect(prismaMock.goal.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });
  });
});
