/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRepositoryImpl } from './user.repository.impl';
import { UserSchema } from '../entities/user.schema';
import { User } from '../../../../domain/entities/user.entity';

describe('UserRepositoryImpl', () => {
  let repository: UserRepositoryImpl;
  let typeOrmRepository: jest.Mocked<Repository<UserSchema>>;

  beforeEach(async () => {
    const mockTypeOrmRepository = {
      findOne: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserRepositoryImpl,
        {
          provide: getRepositoryToken(UserSchema),
          useValue: mockTypeOrmRepository,
        },
      ],
    }).compile();

    repository = module.get<UserRepositoryImpl>(UserRepositoryImpl);
    typeOrmRepository = module.get(getRepositoryToken(UserSchema));
  });

  describe('findById', () => {
    it('should return a domain user when found', async () => {
      const userSchema: UserSchema = {
        id: 'uuid-123',
        email: 'test@example.com',
        username: 'testuser',
        password: 'hashedPassword',
        hashedRefreshToken: 'hashedToken',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      typeOrmRepository.findOne.mockResolvedValue(userSchema);

      const result = await repository.findById('uuid-123');

      expect(result).toBeInstanceOf(User);
      expect(result?.getId()).toBe('uuid-123');
      expect(result?.getEmail()).toBe('test@example.com');
      expect(result?.getUsername()).toBe('testuser');
      expect(typeOrmRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'uuid-123' },
      });
    });

    it('should return null when user not found', async () => {
      typeOrmRepository.findOne.mockResolvedValue(null);

      const result = await repository.findById('non-existent');

      expect(result).toBeNull();
      expect(typeOrmRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'non-existent' },
      });
    });
  });

  describe('findByEmail', () => {
    it('should return a domain user when found by email', async () => {
      const userSchema: UserSchema = {
        id: 'uuid-123',
        email: 'test@example.com',
        username: 'testuser',
        password: 'hashedPassword',
        hashedRefreshToken: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      typeOrmRepository.findOne.mockResolvedValue(userSchema);

      const result = await repository.findByEmail('test@example.com');

      expect(result).toBeInstanceOf(User);
      expect(result?.getEmail()).toBe('test@example.com');
      expect(typeOrmRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
    });

    it('should return null when user not found by email', async () => {
      typeOrmRepository.findOne.mockResolvedValue(null);

      const result = await repository.findByEmail('non-existent@example.com');

      expect(result).toBeNull();
    });
  });

  describe('save', () => {
    it('should save a user and return the domain entity', async () => {
      const user = new User('', 'test@example.com', 'testuser', 'password', new Date(), new Date());

      const savedSchema: UserSchema = {
        id: 'uuid-123',
        email: 'test@example.com',
        username: 'testuser',
        password: 'hashedPassword',
        hashedRefreshToken: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      typeOrmRepository.save.mockResolvedValue(savedSchema);

      const result = await repository.save(user);

      expect(result).toBeInstanceOf(User);
      expect(result.getId()).toBe('uuid-123');
      expect(result.getEmail()).toBe('test@example.com');
      expect(typeOrmRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'test@example.com',
          username: 'testuser',
          password: 'password',
        }),
      );
    });

    it('should preserve hashedRefreshToken when saving', async () => {
      const user = new User(
        'uuid-123',
        'test@example.com',
        'testuser',
        'password',
        new Date(),
        new Date(),
      );
      await user.setRefreshToken('refresh-token');

      const savedSchema: UserSchema = {
        id: 'uuid-123',
        email: 'test@example.com',
        username: 'testuser',
        password: 'password',
        hashedRefreshToken: 'hashedRefreshToken',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      typeOrmRepository.save.mockResolvedValue(savedSchema);

      const result = await repository.save(user);

      expect(result.getHashedRefreshToken()).toBeTruthy();
    });
  });

  describe('update', () => {
    it('should update user data', async () => {
      await repository.update('uuid-123', { hashedRefreshToken: 'newToken' });

      expect(typeOrmRepository.update).toHaveBeenCalledWith('uuid-123', {
        hashedRefreshToken: 'newToken',
      });
    });

    it('should handle empty update data', async () => {
      await repository.update('uuid-123', {});

      expect(typeOrmRepository.update).toHaveBeenCalledWith('uuid-123', {});
    });
  });

  describe('create', () => {
    it('should create a new domain user entity', () => {
      const userData = {
        email: 'new@example.com',
        password: 'password123',
        username: 'newuser',
      };

      const user = repository.create(userData);

      expect(user).toBeInstanceOf(User);
      expect(user.getEmail()).toBe('new@example.com');
      expect(user.getUsername()).toBe('newuser');
      expect(user.getPassword()).toBe('password123');
      expect(user.getId()).toBe(''); // ID will be generated by database
    });

    it('should handle creation without username', () => {
      const userData = {
        email: 'new@example.com',
        password: 'password123',
      };

      const user = repository.create(userData);

      expect(user).toBeInstanceOf(User);
      expect(user.getEmail()).toBe('new@example.com');
      expect(user.getUsername()).toBeNull();
    });
  });
});
