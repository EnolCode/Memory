import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto, TokenPayload } from './dto/auth-response.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponseDto & { refreshToken: string }> {
    const { email, password, username } = registerDto;

    // 1. Verificar si el email ya existe
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('El email ya está registrado');
    }

    // 2. Crear el nuevo usuario
    const user = this.userRepository.create({
      email,
      password, // El @BeforeInsert lo hasheará automáticamente
      username,
    });

    try {
      // 3. Guardar en la base de datos
      await this.userRepository.save(user);

      // 4. Generar tokens
      const tokens = await this.generateTokens(user);

      // 5. Guardar refresh token hasheado en BD
      await this.updateRefreshToken(user.id, tokens.refreshToken);

      // 6. Retornar respuesta con refresh token para cookie
      return {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
        },
      };
    } catch (error) {
      // Por si hay algún error de BD no controlado
      throw new InternalServerErrorException('Error al crear el usuario');
    }
  }

  // ========== LOGIN CON VALIDATED USER (usado por el controller) ==========
  async loginWithValidatedUser(user: User): Promise<AuthResponseDto & { refreshToken: string }> {
    // Generar tokens
    const tokens = await this.generateTokens(user);

    // Guardar refresh token hasheado
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    // Retornar respuesta con refresh token (para cookie)
    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      },
    };
  }

  // ========== LOGIN (para uso directo si necesario) ==========
  async login(loginDto: LoginDto): Promise<AuthResponseDto & { refreshToken: string }> {
    const { email, password } = loginDto;

    // 1. Buscar usuario
    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // 2. Validar password
    const isPasswordValid = await user.validatePassword(password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // 3. Usar el método loginWithValidatedUser
    return this.loginWithValidatedUser(user);
  }

  // ========== REFRESH TOKEN ==========
  async refreshTokens(userId: string, refreshToken: string): Promise<AuthResponseDto & { refreshToken: string }> {
    // 1. Buscar usuario con su refresh token
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user || !user.hashedRefreshToken) {
      throw new UnauthorizedException('Token inválido');
    }

    // 2. Validar que el refresh token coincida
    const isRefreshTokenValid = await user.validateRefreshToken(refreshToken);

    if (!isRefreshTokenValid) {
      throw new UnauthorizedException('Token inválido');
    }

    // 3. Generar nuevos tokens (rotación de tokens)
    const tokens = await this.generateTokens(user);

    // 4. Actualizar refresh token en BD
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    // 5. Retornar nuevos tokens
    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      },
    };
  }

  // ========== LOGOUT ==========
  async logout(userId: string): Promise<void> {
    // Eliminar refresh token de la BD
    await this.userRepository.update(userId, {
      hashedRefreshToken: '',
    });
  }

  // ========== MÉTODOS AUXILIARES ==========

  // Generar access y refresh tokens
  private async generateTokens(user: User) {
    const payload: TokenPayload = {
      sub: user.id,
      email: user.email,
    };

    // Access token: 15 minutos
    const accessToken = this.jwtService.sign(payload);

    // Refresh token: 7 días con secret diferente
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: '7d',
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  // Actualizar refresh token hasheado en BD
  private async updateRefreshToken(userId: string, refreshToken: string) {
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    
    await this.userRepository.update(userId, {
      hashedRefreshToken,
    });
  }

  // ========== MÉTODOS PARA LAS ESTRATEGIAS ==========

  // Usado por LocalStrategy para validar login
  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      return null;
    }

    const isPasswordValid = await user.validatePassword(password);

    if (!isPasswordValid) {
      return null;
    }

    // Retornar usuario sin password
    const { password: _, hashedRefreshToken: __, ...result } = user;
    return result;
  }

  // Usado por JwtStrategy para obtener usuario
  async getUserById(id: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id },
    });
  }
}