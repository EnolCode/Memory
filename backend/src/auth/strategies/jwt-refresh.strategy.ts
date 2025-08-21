import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { TokenPayload } from '../dto/auth-response.dto';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(private readonly configService: ConfigService) {
    super({
      // Extrae el refresh token de las cookies
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          return request?.cookies?.refreshToken;
        },
      ]),
      ignoreExpiration: false,
      // Usa un secret diferente para refresh tokens
      secretOrKey:
        configService.get<string>('JWT_REFRESH_SECRET') ||
        'default-refresh-secret',
      passReqToCallback: true,
    } as any);
  }

  // Validamos y extraemos el refresh token del request
  async validate(req: Request, payload: TokenPayload) {
    const refreshToken = req?.cookies?.refreshToken;

    // Retornamos el payload y el token para validarlo contra el hash en BD
    return {
      ...payload,
      refreshToken,
    };
  }
}
