import { Test, TestingModule } from '@nestjs/testing';
import { LogoutUseCase } from './logout.use-case';
import { USER_REPOSITORY_TOKEN } from '../../../domain/repositories/user.repository.token';

describe('LogoutUseCase', () => {
  let useCase: LogoutUseCase;

  const mockUserRepository = {
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LogoutUseCase,
        {
          provide: USER_REPOSITORY_TOKEN,
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    useCase = module.get<LogoutUseCase>(LogoutUseCase);
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should successfully logout user by clearing refresh token', async () => {
      const userId = 'uuid-123';

      await useCase.execute(userId);

      expect(mockUserRepository.update).toHaveBeenCalledWith(userId, {
        hashedRefreshToken: '',
      });
    });

    it('should handle logout for non-existent user gracefully', async () => {
      const userId = 'non-existent-user';
      mockUserRepository.update.mockResolvedValue({ affected: 0 });

      await expect(useCase.execute(userId)).resolves.not.toThrow();

      expect(mockUserRepository.update).toHaveBeenCalledWith(userId, {
        hashedRefreshToken: '',
      });
    });

    it('should handle database errors properly', async () => {
      const userId = 'uuid-123';
      const dbError = new Error('Database connection error');
      mockUserRepository.update.mockRejectedValue(dbError);

      await expect(useCase.execute(userId)).rejects.toThrow('Database connection error');
    });
  });
});
