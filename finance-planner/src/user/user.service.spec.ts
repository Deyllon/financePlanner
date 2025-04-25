/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { PrismaService } from '../prisma.service';
import { PrismaClient, Profile } from 'generated/prisma';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

describe('UserService', () => {
  let service: UserService;

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
        UserService,
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

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a user', async () => {
    const dto = {
      name: 'John',
      email: 'john@example.com',
      profile: 'DETERMINADO' as Profile,
      password: '@Amanha27',
      active: true,
    };
    const createdUser = { id: 1, ...dto };

    prismaMock.user.create.mockResolvedValue(createdUser);

    const result = await service.create(dto);

    expect(result).toEqual(createdUser);
    expect(prismaMock.user.create).toHaveBeenCalledWith({
      data: dto,
      select: {
        id: true,
        profile: true,
        email: true,
        name: true,
      },
    });
  });

  it('should return users with filters', async () => {
    const users = [
      {
        id: 1,
        name: 'John',
        email: 'john@example.com',
        profile: 'DETERMINADO' as Profile,
        password: '@Amanha27',
        active: true,
      },
    ];
    const filters = { name: 'John' };

    prismaMock.user.findMany.mockResolvedValue(users);

    const result = await service.findAll(1, 10, filters);

    expect(result).toEqual(users);
    expect(prismaMock.user.findMany).toHaveBeenCalledWith({
      where: filters,
      skip: 0,
      take: 10,
    });
  });

  it('should return a user by email', async () => {
    const user = {
      id: 1,
      name: 'John',
      email: 'john@example.com',
      profile: 'DETERMINADO' as Profile,
      password: '@Amanha27',
      active: true,
    };

    prismaMock.user.findUnique.mockResolvedValue(user);

    const result = await service.findByEmail('john@example.com');

    expect(result).toEqual(user);
    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
      where: { email: 'john@example.com' },
    });
  });

  it('should return a user by id', async () => {
    const user = {
      id: 1,
      name: 'John',
      email: 'john@example.com',
      profile: 'DETERMINADO' as Profile,
      password: '@Amanha27',
      active: true,
    };

    prismaMock.user.findUnique.mockResolvedValue(user);

    const result = await service.findOne(1);

    expect(result).toEqual(user);
    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
      where: { id: 1 },
    });
  });

  it('should update a user', async () => {
    const dto = { name: 'Updated Name' };
    const updatedUser = {
      id: 1,
      name: 'Updated Name',
      email: 'john@example.com',
      profile: 'DETERMINADO' as Profile,
      password: '@Amanha27',
      active: true,
    };

    prismaMock.user.update.mockResolvedValue(updatedUser);

    const result = await service.update(1, dto);

    expect(result).toEqual(updatedUser);
    expect(prismaMock.user.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: dto,
      select: {
        name: true,
        email: true,
        profile: true,
        active: true,
        id: true,
      },
    });
  });

  it('should delete a user', async () => {
    const deletedUser = {
      name: 'John',
      email: 'john@example.com',
      profile: 'DETERMINADO' as Profile,
      active: false,
      id: 1,
      password: '@Amanha27',
    };

    prismaMock.user.update.mockResolvedValue(deletedUser);

    const result = await service.remove(1);

    expect(result).toEqual(deletedUser);
    expect(prismaMock.user.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { active: false },
      select: {
        name: true,
        email: true,
        profile: true,
        active: true,
      },
    });
  });
});
