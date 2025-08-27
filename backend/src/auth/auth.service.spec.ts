import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { User } from './entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

describe('AuthService', () => {
  let service: AuthService;
  // Mock services are used instead of actual instances

  const mockUserRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
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
        AuthService,
        {
          provide: getRepositoryToken(User),
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

    service = module.get<AuthService>(AuthService);
    // Clear all mocks
    jest.clearAllMocks();
  });

  describe('register', () => {
    const registerDto: RegisterDto = {
      email: 'test@example.com',
      password: 'Test1234@', // NOSONAR: Test password for e2e testing
      username: 'testuser',
    };

    it('should successfully register a new user', async () => {
      const mockUser = {
        id: 'uuid-123',
        email: registerDto.email,
        username: registerDto.username,
        password: 'hashedPassword', // NOSONAR: Test password for e2e testing
        hashedRefreshToken: null,
        validatePassword: jest.fn(),
        setRefreshToken: jest.fn(),
        validateRefreshToken: jest.fn(),
        removeRefreshToken: jest.fn(),
      } as unknown as User;

      mockUserRepository.findOne.mockResolvedValue(null); // Usuario no existe
      mockUserRepository.create.mockReturnValue(mockUser);
      mockUserRepository.save.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValueOnce('access-token');
      mockJwtService.sign.mockReturnValueOnce('refresh-token');
      mockConfigService.get.mockReturnValue('refresh-secret');

      const result = await service.register(registerDto);

      expect(result).toHaveProperty('accessToken', 'access-token');
      expect(result).toHaveProperty('refreshToken', 'refresh-token');
      expect(result.user).toEqual({
        id: (mockUser as { id: string }).id,
        email: (mockUser as { email: string }).email,
        username: (mockUser as { username: string }).username,
      });
      expect(mockUserRepository.save).toHaveBeenCalledWith(mockUser);
    });

    it('should throw ConflictException if email already exists', async () => {
      mockUserRepository.findOne.mockResolvedValue({ id: 'existing-user' });

      await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    const loginDto: LoginDto = {
      email: 'test@example.com',
      password: 'Test1234@', // NOSONAR: Test password for e2e testing
    };

    it('should successfully login with valid credentials', async () => {
      const mockUser = {
        id: 'uuid-123',
        email: loginDto.email,
        username: 'testuser',
        password: 'hashedPassword', // NOSONAR: Test password for e2e testing
        validatePassword: jest.fn().mockResolvedValue(true),
      } as unknown as User;

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValueOnce('access-token');
      mockJwtService.sign.mockReturnValueOnce('refresh-token');
      mockConfigService.get.mockReturnValue('refresh-secret');

      const result = await service.login(loginDto);

      expect(result).toHaveProperty('accessToken', 'access-token');
      expect(result).toHaveProperty('refreshToken', 'refresh-token');
      expect(
        (mockUser as unknown as { validatePassword: jest.Mock }).validatePassword,
      ).toHaveBeenCalledWith(loginDto.password);
    });

    it('should throw UnauthorizedException for invalid email', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for invalid password', async () => {
      const mockUser = {
        validatePassword: jest.fn().mockResolvedValue(false),
      } as Partial<User>;

      mockUserRepository.findOne.mockResolvedValue(mockUser);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('refreshTokens', () => {
    it('should successfully refresh tokens with valid refresh token', async () => {
      const mockUser = {
        id: 'uuid-123',
        email: 'test@example.com',
        username: 'testuser',
        hashedRefreshToken: 'hashedToken',
        validateRefreshToken: jest.fn().mockResolvedValue(true),
      } as unknown as User;

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValueOnce('new-access-token');
      mockJwtService.sign.mockReturnValueOnce('new-refresh-token');
      mockConfigService.get.mockReturnValue('refresh-secret');

      const result = await service.refreshTokens('uuid-123', 'refresh-token');

      expect(result).toHaveProperty('accessToken', 'new-access-token');
      expect(result).toHaveProperty('refreshToken', 'new-refresh-token');
      expect(
        (mockUser as unknown as { validateRefreshToken: jest.Mock }).validateRefreshToken,
      ).toHaveBeenCalledWith('refresh-token');
    });

    it('should throw UnauthorizedException for invalid refresh token', async () => {
      const mockUser = {
        hashedRefreshToken: 'hashedToken',
        validateRefreshToken: jest.fn().mockResolvedValue(false),
      } as Partial<User>;

      mockUserRepository.findOne.mockResolvedValue(mockUser);

      await expect(service.refreshTokens('uuid-123', 'invalid-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.refreshTokens('invalid-id', 'refresh-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('logout', () => {
    it('should successfully logout user', async () => {
      await service.logout('uuid-123');

      expect(mockUserRepository.update).toHaveBeenCalledWith('uuid-123', {
        hashedRefreshToken: '',
      });
    });
  });

  describe('validateUser', () => {
    it('should return user data for valid credentials', async () => {
      const mockUser = {
        id: 'uuid-123',
        email: 'test@example.com',
        password: 'hashedPassword', // NOSONAR: Test password for e2e testing
        hashedRefreshToken: 'token',
        validatePassword: jest.fn().mockResolvedValue(true),
      } as unknown as User;

      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.validateUser(
        'test@example.com',
        'Test1234@', // NOSONAR: Test password for e2e testing
      );

      expect(result).toBeTruthy();
      expect(result).not.toHaveProperty('password');
      expect(result).not.toHaveProperty('hashedRefreshToken');
    });

    it('should return null for invalid credentials', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      const result = await service.validateUser(
        'invalid@example.com',
        'password', // NOSONAR: Test password for e2e testing
      );

      expect(result).toBeNull();
    });
  });

  describe('getUserById', () => {
    it('should return user by id', async () => {
      const mockUser = { id: 'uuid-123', email: 'test@example.com' };
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.getUserById('uuid-123');

      expect(result).toEqual(mockUser);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'uuid-123' },
      });
    });

    it('should return null if user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      const result = await service.getUserById('invalid-id');

      expect(result).toBeNull();
    });
  });
});
