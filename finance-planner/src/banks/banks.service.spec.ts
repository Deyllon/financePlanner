import { Test, TestingModule } from '@nestjs/testing';
import { BanksService } from './banks.service';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { PrismaClient } from 'generated/prisma';
import { PrismaService } from '../prisma.service';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { Queue } from 'bull';
import { getQueueToken } from '@nestjs/bull';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { getModelToken } from '@nestjs/mongoose';
import { of } from 'rxjs';

describe('BanksService', () => {
  let service: BanksService;

  const mockHttpService = {
    post: jest.fn(),
    get: jest.fn(),
  };

  const bankModelMock = {
    updateOne: jest.fn(),
    findOne: jest.fn(),
  };

  let prismaMock: DeepMockProxy<PrismaClient>;
  let queueMock: DeepMockProxy<Queue>;

  const mockLogger = {
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    verbose: jest.fn(),
  };

  beforeEach(async () => {
    prismaMock = mockDeep<PrismaClient>();
    queueMock = mockDeep<Queue>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BanksService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
        {
          provide: WINSTON_MODULE_NEST_PROVIDER,
          useValue: mockLogger,
        },
        {
          provide: getQueueToken('transaction'),
          useValue: queueMock,
        },
        {
          provide: HttpService,
          useValue: mockHttpService,
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('mocked_value'),
          },
        },
        {
          provide: getModelToken('Bank'), // or Bank.name if that's how it's registered
          useValue: bankModelMock,
        },
        {
          provide: getModelToken('Account'),
          useValue: {
            updateOne: jest.fn(),
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<BanksService>(BanksService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create an item and update the bank model', async () => {
    const mockId = 123;
    const mockParams = { user: 'user', password: 'pass' };
    const mockConnectorId = 208;
    const mockApiKey = 'mocked-api-key';
    const mockItemResponse = {
      data: { id: 'item-789', connector: { name: 'Bank X' } },
    };

    jest.spyOn(service as any, 'getApiKey').mockResolvedValue(mockApiKey);

    mockHttpService.post.mockReturnValueOnce(of(mockItemResponse));

    bankModelMock.updateOne.mockResolvedValue({ acknowledged: true });

    await service.createItem(mockId, mockParams, mockConnectorId);

    // Assertions
    expect(mockHttpService.post).toHaveBeenCalledWith(
      'mocked_value/items',
      {
        parameters: mockParams,
        connectorId: mockConnectorId,
      },
      {
        headers: {
          'X-API-KEY': mockApiKey,
        },
      },
    );

    expect(bankModelMock.updateOne).toHaveBeenCalledWith(
      { userId: mockId },
      { $push: { items: mockItemResponse.data } },
      { upsert: true },
    );
  });
});
