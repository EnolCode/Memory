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
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // ========== REGISTRO ==========
  @Post('register')
  async register(
    @Body() registerDto: RegisterDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.register(registerDto);
    
    // El refresh token va en cookie HTTPOnly
    this.setRefreshTokenCookie(response, result.refreshToken);
    
    // Retornamos solo el access token y usuario
    return {
      accessToken: result.accessToken,
      user: result.user,
    };
  }

  // ========== LOGIN ==========
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('local'))
  async login(
    @Req() req: any,
    @Res({ passthrough: true }) response: Response,
  ) {
    // req.user viene de LocalStrategy.validate()
    // Creamos un método específico para login con usuario ya validado
    const user = await this.authService.getUserById(req.user.id);
    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }
    const result = await this.authService.loginWithValidatedUser(user);
    
    // Configurar cookie con refresh token
    this.setRefreshTokenCookie(response, result.refreshToken);
    
    // Retornar access token y usuario
    return {
      accessToken: result.accessToken,
      user: result.user,
    };
  }

  // ========== REFRESH TOKEN ==========
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('jwt-refresh')) // Usa JwtRefreshStrategy
  async refresh(
    @Req() req: any,
    @Res({ passthrough: true }) response: Response,
  ) {
    // req.user viene de JwtRefreshStrategy.validate()
    const result = await this.authService.refreshTokens(
      req.user.sub,
      req.user.refreshToken,
    );
    
    // Actualizar cookie con nuevo refresh token
    this.setRefreshTokenCookie(response, result.refreshToken);
    
    // Retornar nuevo access token
    return {
      accessToken: result.accessToken,
      user: result.user,
    };
  }

  // ========== LOGOUT ==========
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('jwt')) // Requiere estar autenticado
  async logout(
    @Req() req: any,
    @Res({ passthrough: true }) response: Response,
  ) {
    // req.user viene de JwtStrategy.validate()
    await this.authService.logout(req.user.id);
    
    // Limpiar cookie
    response.clearCookie('refreshToken');
    
    return { message: 'Logout exitoso' };
  }

  // ========== PERFIL (ejemplo de ruta protegida) ==========
  @Get('me')
  @UseGuards(AuthGuard('jwt')) // Protegido con JWT
  async getProfile(@Req() req: any) {
    // req.user contiene el usuario del token
    return req.user;
  }

  // ========== MÉTODO AUXILIAR PARA COOKIES ==========
  private setRefreshTokenCookie(response: Response, refreshToken: string) {
    response.cookie('refreshToken', refreshToken, {
      httpOnly: true,  // No accesible desde JavaScript
      secure: process.env.NODE_ENV === 'production', // HTTPS en producción
      sameSite: 'strict', // Protección CSRF
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días en milisegundos
      path: '/', // Disponible en toda la app
    });
  }
}