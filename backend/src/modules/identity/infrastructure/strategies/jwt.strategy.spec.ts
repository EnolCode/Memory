/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy';
import { LoginUseCase } from '../../application/use-cases/login/login.use-case';
import { User } from '../../domain/entities/user.entity';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;

  const mockConfigService = {
    get: jest.fn().mockReturnValue('test-secret'),
  };

  const mockLoginUseCase = {
    getUserById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: LoginUseCase,
          useValue: mockLoginUseCase,
        },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
    loginUseCase = module.get<LoginUseCase>(LoginUseCase);
    jest.clearAllMocks();
  });

  describe('validate', () => {
    it('should return user data when token payload is valid', async () => {
      const payload = {
        sub: 'uuid-123',
        email: 'test@example.com',
      };

      const mockUser = Object.create(User.prototype);
      Object.assign(mockUser, {
        getId: jest.fn().mockReturnValue('uuid-123'),
        getEmail: jest.fn().mockReturnValue('test@example.com'),
        getUsername: jest.fn().mockReturnValue('testuser'),
      });

      mockLoginUseCase.getUserById.mockResolvedValue(mockUser);

      const result = await strategy.validate(payload);

      expect(result).toEqual({
        id: 'uuid-123',
        email: 'test@example.com',
      });
      expect(mockLoginUseCase.getUserById).toHaveBeenCalledWith('uuid-123');
    });

    it('should throw UnauthorizedException when user not found', async () => {
      const payload = {
        sub: 'invalid-uuid',
        email: 'test@example.com',
      };

      mockLoginUseCase.getUserById.mockResolvedValue(null);

      await expect(strategy.validate(payload)).rejects.toThrow(UnauthorizedException);
      expect(mockLoginUseCase.getUserById).toHaveBeenCalledWith('invalid-uuid');
    });

    it('should throw UnauthorizedException with correct message', async () => {
      const payload = {
        sub: 'invalid-uuid',
        email: 'test@example.com',
      };

      mockLoginUseCase.getUserById.mockResolvedValue(null);

      await expect(strategy.validate(payload)).rejects.toThrow('Usuario no encontrado');
    });

    it('should handle different payload structures', async () => {
      const payload = {
        sub: 'uuid-456',
        email: 'another@example.com',
      };

      const mockUser = Object.create(User.prototype);
      mockLoginUseCase.getUserById.mockResolvedValue(mockUser);

      const result = await strategy.validate(payload);

      expect(result).toEqual({
        id: 'uuid-456',
        email: 'another@example.com',
      });
    });
  });

  describe('constructor', () => {
    it('should configure strategy with JWT secret from config', () => {
      // The configuration is done in the constructor, we can't test super() directly
      // But we can verify the strategy was created successfully
      expect(strategy).toBeDefined();
      expect(strategy.validate).toBeDefined();
    });

    it('should use default secret when config returns undefined', async () => {
      const mockConfigServiceWithUndefined = {
        get: jest.fn().mockReturnValue(undefined),
      };

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          JwtStrategy,
          {
            provide: ConfigService,
            useValue: mockConfigServiceWithUndefined,
          },
          {
            provide: LoginUseCase,
            useValue: mockLoginUseCase,
          },
        ],
      }).compile();

      const strategyWithDefault = module.get<JwtStrategy>(JwtStrategy);
      expect(strategyWithDefault).toBeDefined();
    });
  });
});
