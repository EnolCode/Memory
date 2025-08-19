import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { TokenPayload } from '../dto/auth-response.dto';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {
    super({
      // Extrae el JWT del header Authorization: Bearer TOKEN
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // Si el token está expirado, rechazar
      ignoreExpiration: false,
      // Secret para verificar la firma
      secretOrKey: configService.get<string>('JWT_SECRET') || 'default-secret',
    });
  }

  // Se ejecuta después de que el JWT es validado
  async validate(payload: TokenPayload) {
    // Verificar que el usuario aún existe y está activo
    const user = await this.authService.getUserById(payload.sub);
    
    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }
    
    // Retornamos el usuario simplificado para req.user
    return {
      id: payload.sub,
      email: payload.email,
    };
  }
}