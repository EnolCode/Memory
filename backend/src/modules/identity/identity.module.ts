import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

// Infrastructure
import { UserSchema } from './infrastructure/persistence/typeorm/entities/user.schema';
import { UserRepositoryImpl } from './infrastructure/persistence/typeorm/repositories/user.repository.impl';
import { AuthController } from './infrastructure/controllers/auth.controller';
import { LocalStrategy } from './infrastructure/strategies/local.strategy';
import { JwtStrategy } from './infrastructure/strategies/jwt.strategy';
import { JwtRefreshStrategy } from './infrastructure/strategies/jwt-refresh.strategy';

// Application
import { RegisterUseCase } from './application/use-cases/register/register.use-case';
import { LoginUseCase } from './application/use-cases/login/login.use-case';
import { RefreshTokenUseCase } from './application/use-cases/refresh-token/refresh-token.use-case';
import { LogoutUseCase } from './application/use-cases/logout/logout.use-case';

// Domain
import { USER_REPOSITORY_TOKEN } from './domain/repositories/user.repository.token';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserSchema]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: '15m',
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    // Repository binding
    {
      provide: USER_REPOSITORY_TOKEN,
      useClass: UserRepositoryImpl,
    },
    // Use cases
    RegisterUseCase,
    LoginUseCase,
    RefreshTokenUseCase,
    LogoutUseCase,
    // Strategies
    LocalStrategy,
    JwtStrategy,
    JwtRefreshStrategy,
  ],
  exports: [USER_REPOSITORY_TOKEN, JwtModule],
})
export class IdentityModule {}
