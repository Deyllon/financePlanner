import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;

  let mockUserService: Partial<UserService>;
  let mockJwtService: Partial<JwtService>;

  beforeEach(async () => {
    mockUserService = {
      findByEmail: jest.fn(),
    };

    mockJwtService = {
      signAsync: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserService, useValue: mockUserService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return a JWT token if credentials are valid', async () => {
    const mockUser = { id: 1, email: 'test@example.com', password: '123456' };
    (mockUserService.findByEmail as jest.Mock).mockResolvedValue(mockUser);
    (mockJwtService.signAsync as jest.Mock).mockResolvedValue('mock-token');

    const result = await service.signIn('test@example.com', '123456');

    expect(result).toEqual({ access_token: 'mock-token' });
    expect(mockUserService.findByEmail).toHaveBeenCalledWith(
      'test@example.com',
    );
    expect(mockJwtService.signAsync).toHaveBeenCalledWith({
      sub: mockUser.id,
      username: mockUser.email,
    });
  });

  it('should throw UnauthorizedException if password is invalid', async () => {
    const mockUser = { id: 1, email: 'test@example.com', password: '123456' };
    (mockUserService.findByEmail as jest.Mock).mockResolvedValue(mockUser);

    await expect(
      service.signIn('test@example.com', 'wrong-password'),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException if user is not found', async () => {
    (mockUserService.findByEmail as jest.Mock).mockResolvedValue(null);

    await expect(
      service.signIn('notfound@example.com', 'any-password'),
    ).rejects.toThrow(UnauthorizedException);
  });
});
