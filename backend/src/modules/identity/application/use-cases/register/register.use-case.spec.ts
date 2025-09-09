import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ConflictException } from '@nestjs/common';
import { RegisterUseCase } from './register.use-case';
import { RegisterDto } from '../../dto/register.dto';
import { User } from '../../../domain/entities/user.entity';
import { USER_REPOSITORY_TOKEN } from '../../../domain/repositories/user.repository.token';

describe('RegisterUseCase', () => {
  let useCase: RegisterUseCase;

  const mockUserRepository = {
    findByEmail: jest.fn(),
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
        RegisterUseCase,
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

    useCase = module.get<RegisterUseCase>(RegisterUseCase);
    jest.clearAllMocks();
  });

  describe('execute', () => {
    const registerDto: RegisterDto = {
      email: 'test@example.com',
      password: 'Test1234@',
      username: 'testuser',
    };

    it('should successfully register a new user', async () => {
      const mockUser = Object.create(User.prototype);
      Object.assign(mockUser, {
        getId: jest.fn().mockReturnValue('uuid-123'),
        getEmail: jest.fn().mockReturnValue(registerDto.email),
        getUsername: jest.fn().mockReturnValue(registerDto.username),
        getHashedRefreshToken: jest.fn().mockReturnValue('hashed-refresh'),
        hashPasswordBeforeCreate: jest.fn(),
        setRefreshToken: jest.fn(),
      });

      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.create.mockReturnValue(mockUser);
      mockUserRepository.save.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValueOnce('access-token');
      mockJwtService.sign.mockReturnValueOnce('refresh-token');
      mockConfigService.get.mockReturnValue('refresh-secret');

      const result = await useCase.execute(registerDto);

      expect(result).toEqual({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        user: {
          id: 'uuid-123',
          email: registerDto.email,
          username: registerDto.username,
        },
      });

      expect(mockUser.hashPasswordBeforeCreate).toHaveBeenCalled();
      expect(mockUserRepository.save).toHaveBeenCalledWith(mockUser);
      expect(mockUser.setRefreshToken).toHaveBeenCalledWith('refresh-token');
    });

    it('should throw ConflictException if email already exists', async () => {
      mockUserRepository.findByEmail.mockResolvedValue({ id: 'existing-user' });

      await expect(useCase.execute(registerDto)).rejects.toThrow(ConflictException);
      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });
  });
});
