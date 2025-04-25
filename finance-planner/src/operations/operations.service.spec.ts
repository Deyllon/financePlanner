/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { OperationsService } from './operations.service';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { OperationType, PrismaClient } from 'generated/prisma';
import { PrismaService } from '../prisma.service';
import { CreateOperationDto } from './dto/create-operation.schema';
import { UpdateOperationDto } from './dto/update-operation.schema';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

describe('OperationsService', () => {
  let service: OperationsService;

  let prismaMock: DeepMockProxy<PrismaClient>;

  beforeEach(async () => {
    prismaMock = mockDeep<PrismaClient>();

    const mockLogger = {
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
      verbose: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OperationsService,
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

    service = module.get<OperationsService>(OperationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create an operation', async () => {
      const dto: CreateOperationDto = {
        userId: 1,
        value: 100,
        type: 'CREDIT',
        date: '2025-04-10',
        category: 'FOOD',
        operationId: 'id34',
      };

      const expected = {
        id: 1,
        user_id: dto.userId,
        value: dto.value,
        date: new Date(dto.date),
        type: dto.type,
        category: dto.category,
        operationId: 'id34',
      };

      prismaMock.operation.create.mockResolvedValue(expected);

      const result = await service.create(dto);
      expect(result).toEqual(expected);
      expect(prismaMock.operation.create).toHaveBeenCalledWith({
        data: {
          user_id: dto.userId,
          value: dto.value,
          date: new Date(dto.date),
          type: dto.type,
          category: dto.category,
        },
        select: {
          id: true,
          user_id: true,
          value: true,
          date: true,
          type: true,
          category: true,
        },
      });
    });
  });

  describe('findOne', () => {
    it('should return a single operation by id', async () => {
      const mockOperation = {
        id: 1,
        user_id: 1,
        value: 100,
        date: new Date(),
        type: 'CREDIT' as OperationType,
        category: 'FOOD',
        operationId: 'id34',
      };

      prismaMock.operation.findUnique.mockResolvedValue(mockOperation);

      const result = await service.findOne(1);
      expect(result).toEqual(mockOperation);
      expect(prismaMock.operation.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        select: {
          id: true,
          user_id: true,
          value: true,
          date: true,
          type: true,
          category: true,
        },
      });
    });
  });

  describe('update', () => {
    it('should update an operation', async () => {
      const dto: UpdateOperationDto = {
        value: 200,
      };

      const expected = {
        id: 1,
        user_id: 1,
        value: 200,
        date: new Date(),
        type: 'CREDIT' as OperationType,
        category: 'FOOD',
        operationId: 'id34',
      };

      prismaMock.operation.update.mockResolvedValue(expected);

      const result = await service.update(1, dto);
      expect(result).toEqual(expected);
      expect(prismaMock.operation.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: dto,
        select: {
          type: true,
          value: true,
          date: true,
          category: true,
        },
      });
    });
  });

  describe('remove', () => {
    it('should delete an operation', async () => {
      const deleted = {
        id: 1,
        user_id: 1,
        value: 100,
        date: new Date(),
        type: 'CREDIT' as OperationType,
        category: 'FOOD',
        operationId: 'id34',
      };

      prismaMock.operation.delete.mockResolvedValue(deleted);

      const result = await service.remove(1);
      expect(result).toEqual(deleted);
      expect(prismaMock.operation.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });
  });

  describe('findAll', () => {
    it('should return paginated and filtered list of users', async () => {
      const operations = [
        {
          id: 1,
          user_id: 1,
          value: 100,
          date: new Date(),
          type: 'CREDIT' as OperationType,
          category: 'FOOD',
          operationId: 'id34',
        },
      ];

      prismaMock.operation.findMany.mockResolvedValue(operations);

      const page = 1;
      const limit = 2;
      const filters = { type: 'CREDIT' };

      const result = await service.findAll(page, limit, filters);
      expect(result).toEqual(operations);
      expect(prismaMock.operation.findMany).toHaveBeenCalledWith({
        where: filters,
        skip: 0,
        take: 2,
      });
    });
  });
});
