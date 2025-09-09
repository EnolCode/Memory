import { Injectable, Inject } from '@nestjs/common';
import type { IUserRepository } from '../../../domain/repositories/user.repository.interface';
import { USER_REPOSITORY_TOKEN } from '../../../domain/repositories/user.repository.token';

@Injectable()
export class LogoutUseCase {
  constructor(
    @Inject(USER_REPOSITORY_TOKEN)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(userId: string): Promise<void> {
    await this.userRepository.update(userId, {
      hashedRefreshToken: '',
    });
  }
}
