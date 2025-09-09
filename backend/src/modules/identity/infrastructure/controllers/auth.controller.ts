import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Res,
  HttpCode,
  HttpStatus,
  Get,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Response } from 'express';
import { RegisterUseCase } from '../../application/use-cases/register/register.use-case';
import { LoginUseCase } from '../../application/use-cases/login/login.use-case';
import { RefreshTokenUseCase } from '../../application/use-cases/refresh-token/refresh-token.use-case';
import { LogoutUseCase } from '../../application/use-cases/logout/logout.use-case';
import { RegisterDto } from '../../application/dto/register.dto';

interface LoginRequest {
  user: {
    id: string;
  };
}

interface RefreshRequest {
  user: {
    sub: string;
    refreshToken: string;
  };
}

interface AuthenticatedRequest {
  user: {
    id: string;
  };
}

interface ProfileRequest {
  user: Record<string, unknown>;
}

@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerUseCase: RegisterUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    private readonly logoutUseCase: LogoutUseCase,
  ) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto, @Res({ passthrough: true }) response: Response) {
    const result = await this.registerUseCase.execute(registerDto);

    this.setRefreshTokenCookie(response, result.refreshToken);

    return {
      accessToken: result.accessToken,
      user: result.user,
    };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('local'))
  async login(@Req() req: LoginRequest, @Res({ passthrough: true }) response: Response) {
    const user = await this.loginUseCase.getUserById(req.user.id);
    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }
    const result = await this.loginUseCase.loginWithValidatedUser(user);

    this.setRefreshTokenCookie(response, result.refreshToken);

    return {
      accessToken: result.accessToken,
      user: result.user,
    };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('jwt-refresh'))
  async refresh(@Req() req: RefreshRequest, @Res({ passthrough: true }) response: Response) {
    const result = await this.refreshTokenUseCase.execute(req.user.sub, req.user.refreshToken);

    this.setRefreshTokenCookie(response, result.refreshToken);

    return {
      accessToken: result.accessToken,
      user: result.user,
    };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('jwt'))
  async logout(@Req() req: AuthenticatedRequest, @Res({ passthrough: true }) response: Response) {
    await this.logoutUseCase.execute(req.user.id);

    response.clearCookie('refreshToken');

    return { message: 'Logout exitoso' };
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  getProfile(@Req() req: ProfileRequest) {
    return req.user;
  }

  private setRefreshTokenCookie(response: Response, refreshToken: string) {
    response.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });
  }
}
