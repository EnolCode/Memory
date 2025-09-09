import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import { RefreshTokenUseCase } from './refresh-token.use-case';
import { User } from '../../../domain/entities/user.entity';
import { USER_REPOSITORY_TOKEN } from '../../../domain/repositories/user.repository.token';

describe('RefreshTokenUseCase', () => {
  let useCase: RefreshTokenUseCase;

  const mockUserRepository = {
    findById: jest.fn(),
    update: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RefreshTokenUseCase,
        {
          provide: USER_REPOSITORY_TOKEN,
          useValue: mockUserRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    useCase = module.get<RefreshTokenUseCase>(RefreshTokenUseCase);
    jest.clearAllMocks();
  });

  describe('execute', () => {
    const userId = 'uuid-123';
    const refreshToken = 'valid-refresh-token';

    it('should successfully refresh tokens with valid refresh token', async () => {
      const mockUser = Object.create(User.prototype);
      Object.assign(mockUser, {
        getId: jest.fn().mockReturnValue(userId),
        getEmail: jest.fn().mockReturnValue('test@example.com'),
        getUsername: jest.fn().mockReturnValue('testuser'),
        getHashedRefreshToken: jest.fn().mockReturnValue('hashed-token'),
        validateRefreshToken: jest.fn().mockResolvedValue(true),
        setRefreshToken: jest.fn(),
      });

      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValueOnce('new-access-token');
      mockJwtService.sign.mockReturnValueOnce('new-refresh-token');
      mockConfigService.get.mockReturnValue('refresh-secret');

      const result = await useCase.execute(userId, refreshToken);

      expect(result).toEqual({
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
        user: {
          id: userId,
          email: 'test@example.com',
          username: 'testuser',
        },
      });

      expect(mockUser.validateRefreshToken).toHaveBeenCalledWith(refreshToken);
      expect(mockUser.setRefreshToken).toHaveBeenCalledWith('new-refresh-token');
      expect(mockUserRepository.update).toHaveBeenCalledWith(userId, {
        hashedRefreshToken: mockUser.getHashedRefreshToken(),
      });
    });

    it('should throw UnauthorizedException if user not found', async () => {
      mockUserRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute(userId, refreshToken)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if no refresh token stored', async () => {
      const mockUser = Object.create(User.prototype);
      Object.assign(mockUser, {
        getHashedRefreshToken: jest.fn().mockReturnValue(null),
      });

      mockUserRepository.findById.mockResolvedValue(mockUser);

      await expect(useCase.execute(userId, refreshToken)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for invalid refresh token', async () => {
      const mockUser = Object.create(User.prototype);
      Object.assign(mockUser, {
        getHashedRefreshToken: jest.fn().mockReturnValue('hashed-token'),
        validateRefreshToken: jest.fn().mockResolvedValue(false),
      });

      mockUserRepository.findById.mockResolvedValue(mockUser);

      await expect(useCase.execute(userId, 'invalid-token')).rejects.toThrow(UnauthorizedException);
    });

    it('should rotate refresh tokens on successful refresh', async () => {
      const mockUser = Object.create(User.prototype);
      Object.assign(mockUser, {
        getId: jest.fn().mockReturnValue(userId),
        getEmail: jest.fn().mockReturnValue('test@example.com'),
        getUsername: jest.fn().mockReturnValue('testuser'),
        getHashedRefreshToken: jest.fn().mockReturnValue('new-hashed-token'),
        validateRefreshToken: jest.fn().mockResolvedValue(true),
        setRefreshToken: jest.fn(),
      });

      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValueOnce('new-access-token');
      mockJwtService.sign.mockReturnValueOnce('new-refresh-token');
      mockConfigService.get.mockReturnValue('refresh-secret');

      await useCase.execute(userId, refreshToken);

      // Verify token rotation
      expect(mockJwtService.sign).toHaveBeenCalledTimes(2);
      expect(mockUser.setRefreshToken).toHaveBeenCalledWith('new-refresh-token');
    });
  });
});
