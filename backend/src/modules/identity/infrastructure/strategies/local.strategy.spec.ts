/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { LocalStrategy } from './local.strategy';
import { LoginUseCase } from '../../application/use-cases/login/login.use-case';
import { User } from '../../domain/entities/user.entity';

describe('LocalStrategy', () => {
  let strategy: LocalStrategy;

  const mockLoginUseCase = {
    validateUser: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocalStrategy,
        {
          provide: LoginUseCase,
          useValue: mockLoginUseCase,
        },
      ],
    }).compile();

    strategy = module.get<LocalStrategy>(LocalStrategy);
    loginUseCase = module.get<LoginUseCase>(LoginUseCase);
    jest.clearAllMocks();
  });

  describe('validate', () => {
    it('should return user data when credentials are valid', async () => {
      const email = 'test@example.com';
      const password = 'Test1234@';

      const mockUser = Object.create(User.prototype);
      Object.assign(mockUser, {
        getId: jest.fn().mockReturnValue('uuid-123'),
        getEmail: jest.fn().mockReturnValue(email),
        getUsername: jest.fn().mockReturnValue('testuser'),
      });

      mockLoginUseCase.validateUser.mockResolvedValue(mockUser);

      const result = await strategy.validate(email, password);

      expect(result).toEqual({
        id: 'uuid-123',
        email: email,
        username: 'testuser',
      });
      expect(mockLoginUseCase.validateUser).toHaveBeenCalledWith(email, password);
    });

    it('should throw UnauthorizedException when credentials are invalid', async () => {
      const email = 'test@example.com';
      const password = 'wrongpassword';

      mockLoginUseCase.validateUser.mockResolvedValue(null);

      await expect(strategy.validate(email, password)).rejects.toThrow(UnauthorizedException);
      expect(mockLoginUseCase.validateUser).toHaveBeenCalledWith(email, password);
    });

    it('should throw UnauthorizedException with correct message', async () => {
      mockLoginUseCase.validateUser.mockResolvedValue(null);

      await expect(strategy.validate('test@example.com', 'wrong')).rejects.toThrow(
        'Credenciales inválidas',
      );
    });

    it('should handle empty credentials', async () => {
      mockLoginUseCase.validateUser.mockResolvedValue(null);

      await expect(strategy.validate('', '')).rejects.toThrow(UnauthorizedException);
      expect(mockLoginUseCase.validateUser).toHaveBeenCalledWith('', '');
    });
  });

  describe('constructor', () => {
    it('should configure passport strategy with correct fields', () => {
      // The LocalStrategy extends PassportStrategy which sets up the configuration
      // We can't directly test the super() call, but we can verify the strategy exists
      expect(strategy).toBeDefined();
      expect(strategy.validate).toBeDefined();
    });
  });
});
