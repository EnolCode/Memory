import { Injectable, ConflictException, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import type { IUserRepository } from '../../../domain/repositories/user.repository.interface';
import { USER_REPOSITORY_TOKEN } from '../../../domain/repositories/user.repository.token';
import { RegisterDto } from '../../dto/register.dto';
import { AuthResponseWithRefreshDto } from '../../dto/auth-response.dto';
import { TokenPayload } from '../../../domain/value-objects/token-payload.vo';

@Injectable()
export class RegisterUseCase {
  constructor(
    @Inject(USER_REPOSITORY_TOKEN)
    private readonly userRepository: IUserRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async execute(registerDto: RegisterDto): Promise<AuthResponseWithRefreshDto> {
    const { email, password, username } = registerDto;

    // Check if email already exists
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('El email ya está registrado');
    }

    // Create new user
    const user = this.userRepository.create({
      email,
      password,
      username,
    });

    // Hash password before saving
    await user.hashPasswordBeforeCreate();

    // Save user
    const savedUser = await this.userRepository.save(user);

    // Generate tokens
    const tokens = this.generateTokens(savedUser.getId(), savedUser.getEmail());

    // Save refresh token
    await savedUser.setRefreshToken(tokens.refreshToken);
    await this.userRepository.update(savedUser.getId(), {
      hashedRefreshToken: savedUser.getHashedRefreshToken(),
    });

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: savedUser.getId(),
        email: savedUser.getEmail(),
        username: savedUser.getUsername(),
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
