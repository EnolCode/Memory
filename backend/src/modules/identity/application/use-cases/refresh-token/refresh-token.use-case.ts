import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import type { IUserRepository } from '../../../domain/repositories/user.repository.interface';
import { USER_REPOSITORY_TOKEN } from '../../../domain/repositories/user.repository.token';
import { AuthResponseWithRefreshDto } from '../../dto/auth-response.dto';
import { TokenPayload } from '../../../domain/value-objects/token-payload.vo';

@Injectable()
export class RefreshTokenUseCase {
  constructor(
    @Inject(USER_REPOSITORY_TOKEN)
    private readonly userRepository: IUserRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async execute(userId: string, refreshToken: string): Promise<AuthResponseWithRefreshDto> {
    // Find user
    const user = await this.userRepository.findById(userId);
    if (!user || !user.getHashedRefreshToken()) {
      throw new UnauthorizedException('Token inválido');
    }

    // Validate refresh token
    const isRefreshTokenValid = await user.validateRefreshToken(refreshToken);
    if (!isRefreshTokenValid) {
      throw new UnauthorizedException('Token inválido');
    }

    // Generate new tokens (token rotation)
    const tokens = this.generateTokens(user.getId(), user.getEmail());

    // Update refresh token in database
    await user.setRefreshToken(tokens.refreshToken);
    await this.userRepository.update(user.getId(), {
      hashedRefreshToken: user.getHashedRefreshToken(),
    });

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user.getId(),
        email: user.getEmail(),
        username: user.getUsername(),
      },
    };
  }

  private generateTokens(userId: string, email: string) {
    const payload = TokenPayload.create(userId, email);

    const accessToken = this.jwtService.sign({
      sub: payload.sub,
      email: payload.email,
    });

    const refreshToken = this.jwtService.sign(
      {
        sub: payload.sub,
        email: payload.email,
      },
      {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: '7d',
      },
    );

    return {
      accessToken,
      refreshToken,
    };
  }
}
