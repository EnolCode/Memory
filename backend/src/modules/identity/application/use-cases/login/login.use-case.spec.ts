import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import { LoginUseCase } from './login.use-case';
import { LoginDto } from '../../dto/login.dto';
import { User } from '../../../domain/entities/user.entity';
import { USER_REPOSITORY_TOKEN } from '../../../domain/repositories/user.repository.token';

describe('LoginUseCase', () => {
  let useCase: LoginUseCase;

  const mockUserRepository = {
    findByEmail: jest.fn(),
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
        LoginUseCase,
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

    useCase = module.get<LoginUseCase>(LoginUseCase);
    jest.clearAllMocks();
  });

  describe('execute', () => {
    const loginDto: LoginDto = {
      email: 'test@example.com',
      password: 'Test1234@',
    };

    it('should successfully login with valid credentials', async () => {
      const mockUser = Object.create(User.prototype);
      Object.assign(mockUser, {
        getId: jest.fn().mockReturnValue('uuid-123'),
        getEmail: jest.fn().mockReturnValue(loginDto.email),
        getUsername: jest.fn().mockReturnValue('testuser'),
        getHashedRefreshToken: jest.fn().mockReturnValue('hashed-refresh'),
        validatePassword: jest.fn().mockResolvedValue(true),
        setRefreshToken: jest.fn(),
      });

      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValueOnce('access-token');
      mockJwtService.sign.mockReturnValueOnce('refresh-token');
      mockConfigService.get.mockReturnValue('refresh-secret');

      const result = await useCase.execute(loginDto);

      expect(result).toEqual({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        user: {
          id: 'uuid-123',
          email: loginDto.email,
          username: 'testuser',
        },
      });

      expect(mockUser.validatePassword).toHaveBeenCalledWith(loginDto.password);
      expect(mockUser.setRefreshToken).toHaveBeenCalledWith('refresh-token');
    });

    it('should throw UnauthorizedException for invalid email', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);

      await expect(useCase.execute(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for invalid password', async () => {
      const mockUser = Object.create(User.prototype);
      Object.assign(mockUser, {
        validatePassword: jest.fn().mockResolvedValue(false),
      });

      mockUserRepository.findByEmail.mockResolvedValue(mockUser);

      await expect(useCase.execute(loginDto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('validateUser', () => {
    it('should return user for valid credentials', async () => {
      const mockUser = Object.create(User.prototype);
      Object.assign(mockUser, {
        getId: jest.fn().mockReturnValue('uuid-123'),
        validatePassword: jest.fn().mockResolvedValue(true),
      });

      mockUserRepository.findByEmail.mockResolvedValue(mockUser);

      const result = await useCase.validateUser('test@example.com', 'Test1234@');

      expect(result).toBe(mockUser);
      expect(mockUser.validatePassword).toHaveBeenCalledWith('Test1234@');
    });

    it('should return null for invalid credentials', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);

      const result = await useCase.validateUser('invalid@example.com', 'password');

      expect(result).toBeNull();
    });
  });

  describe('getUserById', () => {
    it('should return user by id', async () => {
      const mockUser = { id: 'uuid-123', email: 'test@example.com' };
      mockUserRepository.findById.mockResolvedValue(mockUser);

      const result = await useCase.getUserById('uuid-123');

      expect(result).toEqual(mockUser);
      expect(mockUserRepository.findById).toHaveBeenCalledWith('uuid-123');
    });

    it('should return null if user not found', async () => {
      mockUserRepository.findById.mockResolvedValue(null);

      const result = await useCase.getUserById('invalid-id');

      expect(result).toBeNull();
    });
  });
});
