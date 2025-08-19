import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
} from 'typeorm';
import * as bcrypt from 'bcrypt';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  username: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  hashedRefreshToken: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Hook que se ejecuta antes de insertar un nuevo usuario
  @BeforeInsert()
  async hashPassword() {
    // Solo hashea si el password no está ya hasheado
    if (this.password && !this.password.startsWith('$2b$')) {
      // 12 rounds es el balance entre seguridad y performance en 2025
      this.password = await bcrypt.hash(this.password, 12);
    }
  }

  // Método para validar password durante el login
  async validatePassword(password: string): Promise<boolean> {
    if (!password || !this.password) return false;
    return bcrypt.compare(password, this.password);
  }

  // Método para hashear y guardar el refresh token
  async setRefreshToken(refreshToken: string): Promise<void> {
    // Hasheamos el refresh token antes de guardarlo
    this.hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
  }

  // Método para validar refresh token
  async validateRefreshToken(refreshToken: string): Promise<boolean> {
    if (!this.hashedRefreshToken) return false;
    return bcrypt.compare(refreshToken, this.hashedRefreshToken);
  }

  // Método para logout - elimina el refresh token
  removeRefreshToken(): void {
    this.hashedRefreshToken = '';
  }
}