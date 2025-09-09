import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import type { IUserRepository } from '../../../domain/repositories/user.repository.interface';
import { USER_REPOSITORY_TOKEN } from '../../../domain/repositories/user.repository.token';
import { User } from '../../../domain/entities/user.entity';
import { LoginDto } from '../../dto/login.dto';
import { AuthResponseWithRefreshDto } from '../../dto/auth-response.dto';
import { TokenPayload } from '../../../domain/value-objects/token-payload.vo';

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject(USER_REPOSITORY_TOKEN)
    private readonly userRepository: IUserRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async execute(loginDto: LoginDto): Promise<AuthResponseWithRefreshDto> {
    const { email, password } = loginDto;

    // Find user
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Validate password
    const isPasswordValid = await user.validatePassword(password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    return this.loginWithValidatedUser(user);
  }

  async loginWithValidatedUser(user: User): Promise<AuthResponseWithRefreshDto> {
    // Generate tokens
    const tokens = this.generateTokens(user.getId(), user.getEmail());

    // Save refresh token
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

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      return null;
    }

    const isPasswordValid = await user.validatePassword(password);
    if (!isPasswordValid) {
      return null;
    }

    return user;
  }

  async getUserById(id: string): Promise<User | null> {
    return this.userRepository.findById(id);
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
