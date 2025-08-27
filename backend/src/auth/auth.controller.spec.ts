import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { Response } from 'express';

describe('AuthController', () => {
  let controller: AuthController;

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
    loginWithValidatedUser: jest.fn(),
    refreshTokens: jest.fn(),
    logout: jest.fn(),
    getUserById: jest.fn(),
  };

  const mockResponse = {
    cookie: jest.fn(),
    clearCookie: jest.fn(),
  } as unknown as Response;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);

    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user and set refresh token cookie', async () => {
      const registerDto: RegisterDto = {
        email: 'test@example.com',
        password: 'Test1234@',
        username: 'testuser',
      };

      const mockResult = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        user: {
          id: 'uuid-123',
          email: registerDto.email,
          username: registerDto.username,
        },
      };

      mockAuthService.register.mockResolvedValue(mockResult);

      const result = await controller.register(registerDto, mockResponse);

      expect(result).toEqual({
        accessToken: mockResult.accessToken,
        user: mockResult.user,
      });

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'refreshToken',
        'refresh-token',
        expect.objectContaining({
          httpOnly: true,
          sameSite: 'strict',
          maxAge: 7 * 24 * 60 * 60 * 1000,
          path: '/',
        }),
      );
    });
  });

  describe('login', () => {
    it('should login user and set refresh token cookie', async () => {
      const mockUser = {
        id: 'uuid-123',
        email: 'test@example.com',
        username: 'testuser',
      };

      const mockLoginResult = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        user: mockUser,
      };

      mockAuthService.getUserById.mockResolvedValue(mockUser);
      mockAuthService.loginWithValidatedUser.mockResolvedValue(mockLoginResult);

      const req = { user: mockUser };

      const result = await controller.login(req, mockResponse);

      expect(result).toEqual({
        accessToken: mockLoginResult.accessToken,
        user: mockLoginResult.user,
      });

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'refreshToken',
        'refresh-token',
        expect.any(Object),
      );
    });

    it('should throw UnauthorizedException if user not found', async () => {
      mockAuthService.getUserById.mockResolvedValue(null);

      const req = { user: { id: 'invalid-id' } };

      await expect(controller.login(req, mockResponse)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('refresh', () => {
    it('should refresh tokens and update cookie', async () => {
      const mockResult = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
        user: {
          id: 'uuid-123',
          email: 'test@example.com',
          username: 'testuser',
        },
      };

      mockAuthService.refreshTokens.mockResolvedValue(mockResult);

      const req = {
        user: {
          sub: 'uuid-123',
          refreshToken: 'old-refresh-token',
        },
      };

      const result = await controller.refresh(req, mockResponse);

      expect(result).toEqual({
        accessToken: mockResult.accessToken,
        user: mockResult.user,
      });

      expect(mockAuthService.refreshTokens).toHaveBeenCalledWith('uuid-123', 'old-refresh-token');

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'refreshToken',
        'new-refresh-token',
        expect.any(Object),
      );
    });
  });

  describe('logout', () => {
    it('should logout user and clear cookie', async () => {
      const req = { user: { id: 'uuid-123' } };

      const result = await controller.logout(req, mockResponse);

      expect(mockAuthService.logout).toHaveBeenCalledWith('uuid-123');
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockResponse.clearCookie).toHaveBeenCalledWith('refreshToken');
      expect(result).toEqual({ message: 'Logout exitoso' });
    });
  });

  describe('getProfile', () => {
    it('should return user profile', () => {
      const req = {
        user: {
          id: 'uuid-123',
          email: 'test@example.com',
        },
      };

      const result = controller.getProfile(req);

      expect(result).toEqual(req.user);
    });
  });
});
