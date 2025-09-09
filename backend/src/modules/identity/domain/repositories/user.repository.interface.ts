import { User } from '../entities/user.entity';

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  save(user: User): Promise<User>;
  update(id: string, data: Partial<{ hashedRefreshToken: string }>): Promise<void>;
  create(userData: { email: string; password: string; username?: string }): User;
}
