import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy, StrategyOptionsWithRequest } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(configService: ConfigService) {
    const options: StrategyOptionsWithRequest = {
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request): string | null => {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return
          return request?.cookies?.refreshToken || null;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_REFRESH_SECRET') || 'default-refresh-secret',
      passReqToCallback: true,
    };
    super(options);
  }

  validate(req: Request, payload: { sub: string; email: string }) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const refreshToken = req.cookies?.refreshToken;
    return {
      sub: payload.sub,
      email: payload.email,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      refreshToken,
    };
  }
}
