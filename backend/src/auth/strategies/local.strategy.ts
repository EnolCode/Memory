import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { AuthService } from '../auth.service';
import { User } from '../entities/user.entity';

// Usar require para evitar problemas de tipos
// eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
const LocalStrategyClass = require('passport-local').Strategy;

@Injectable()
export class LocalStrategy extends PassportStrategy(LocalStrategyClass) {
  constructor(private readonly authService: AuthService) {
    super({
      usernameField: 'email',
      passwordField: 'password', // NOSONAR - This is a field name, not a hardcoded password
    });
  }

  // Este método es llamado automáticamente por Passport
  async validate(
    email: string,
    password: string,
  ): Promise<Pick<User, 'id' | 'email' | 'username' | 'createdAt' | 'updatedAt'>> {
    const user = await this.authService.validateUser(email, password);

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Lo que retornemos aquí estará disponible en req.user
    return user;
  }
}
