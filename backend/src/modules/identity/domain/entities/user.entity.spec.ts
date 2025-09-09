import * as bcrypt from 'bcrypt';
import { User } from './user.entity';

describe('User Entity', () => {
  let user: User;

  beforeEach(() => {
    user = new User(
      'uuid-123',
      'test@example.com',
      'testuser',
      'plainPassword',
      new Date(),
      new Date(),
    );
  });

  describe('hashPasswordBeforeCreate', () => {
    it('should hash password before insert', async () => {
      const originalPassword = user.getPassword();
      await user.hashPasswordBeforeCreate();

      expect(user.getPassword()).not.toBe(originalPassword);
      expect(user.getPassword()).toContain('$2b$');

      // Verificar que el hash es válido
      const isValid = await bcrypt.compare('plainPassword', user.getPassword());
      expect(isValid).toBe(true);
    });

    it('should not re-hash already hashed password', async () => {
      // Simular un password ya hasheado
      await user.updatePassword('alreadyHashed');
      const hashedPassword = user.getPassword();

      await user.hashPasswordBeforeCreate();

      expect(user.getPassword()).toBe(hashedPassword);
    });

    it('should use 12 rounds for bcrypt', async () => {
      await user.hashPasswordBeforeCreate();

      // El hash de bcrypt incluye el número de rounds
      // $2b$12$ indica 12 rounds
      expect(user.getPassword()).toContain('$2b$12$');
    });
  });

  describe('validatePassword', () => {
    beforeEach(async () => {
      // Hashear el password primero
      await user.updatePassword('correctPassword');
    });

    it('should return true for correct password', async () => {
      const result = await user.validatePassword('correctPassword');
      expect(result).toBe(true);
    });

    it('should return false for incorrect password', async () => {
      const result = await user.validatePassword('wrongPassword');
      expect(result).toBe(false);
    });

    it('should return false for empty password', async () => {
      const result = await user.validatePassword('');
      expect(result).toBe(false);
    });

    it('should handle null password gracefully', async () => {
      const result = await user.validatePassword(null as unknown as string);
      expect(result).toBe(false);
    });
  });

  describe('setRefreshToken', () => {
    it('should hash and store refresh token', async () => {
      const refreshToken = 'refresh-token-123';

      await user.setRefreshToken(refreshToken);

      expect(user.getHashedRefreshToken()).toBeDefined();
      expect(user.getHashedRefreshToken()).not.toBe(refreshToken);
      expect(user.getHashedRefreshToken()).toContain('$2b$');
    });

    it('should use 10 rounds for refresh token hashing', async () => {
      await user.setRefreshToken('refresh-token');

      // $2b$10$ indica 10 rounds
      expect(user.getHashedRefreshToken()).toContain('$2b$10$');
    });

    it('should update updatedAt timestamp', async () => {
      const originalUpdatedAt = user.getUpdatedAt();

      // Wait a bit to ensure timestamp difference
      await new Promise((resolve) => setTimeout(resolve, 10));

      await user.setRefreshToken('refresh-token');

      expect(user.getUpdatedAt().getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });
  });

  describe('validateRefreshToken', () => {
    const validToken = 'valid-refresh-token';

    beforeEach(async () => {
      await user.setRefreshToken(validToken);
    });

    it('should return true for valid refresh token', async () => {
      const result = await user.validateRefreshToken(validToken);
      expect(result).toBe(true);
    });

    it('should return false for invalid refresh token', async () => {
      const result = await user.validateRefreshToken('invalid-token');
      expect(result).toBe(false);
    });

    it('should return false if no refresh token is set', async () => {
      user.removeRefreshToken();

      const result = await user.validateRefreshToken(validToken);
      expect(result).toBe(false);
    });

    it('should return false for empty refresh token', async () => {
      const result = await user.validateRefreshToken('');
      expect(result).toBe(false);
    });
  });

  describe('removeRefreshToken', () => {
    it('should clear the refresh token', async () => {
      await user.setRefreshToken('some-token');
      expect(user.getHashedRefreshToken()).toBeTruthy();

      user.removeRefreshToken();

      expect(user.getHashedRefreshToken()).toBe('');
    });

    it('should update updatedAt timestamp', () => {
      const originalUpdatedAt = user.getUpdatedAt();

      // Wait a bit to ensure timestamp difference
      setTimeout(() => {
        user.removeRefreshToken();
        expect(user.getUpdatedAt().getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
      }, 10);
    });
  });

  describe('updateEmail', () => {
    it('should update email', () => {
      const newEmail = 'newemail@example.com';
      user.updateEmail(newEmail);

      expect(user.getEmail()).toBe(newEmail);
    });

    it('should update updatedAt timestamp', () => {
      const originalUpdatedAt = user.getUpdatedAt();

      setTimeout(() => {
        user.updateEmail('newemail@example.com');
        expect(user.getUpdatedAt().getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
      }, 10);
    });
  });

  describe('updateUsername', () => {
    it('should update username', () => {
      const newUsername = 'newusername';
      user.updateUsername(newUsername);

      expect(user.getUsername()).toBe(newUsername);
    });

    it('should update updatedAt timestamp', () => {
      const originalUpdatedAt = user.getUpdatedAt();

      setTimeout(() => {
        user.updateUsername('newusername');
        expect(user.getUpdatedAt().getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
      }, 10);
    });
  });

  describe('updatePassword', () => {
    it('should hash and update password', async () => {
      const newPassword = 'newPassword123';
      await user.updatePassword(newPassword);

      expect(user.getPassword()).not.toBe(newPassword);
      expect(user.getPassword()).toContain('$2b$12$');

      const isValid = await bcrypt.compare(newPassword, user.getPassword());
      expect(isValid).toBe(true);
    });

    it('should update updatedAt timestamp', async () => {
      const originalUpdatedAt = user.getUpdatedAt();

      await new Promise((resolve) => setTimeout(resolve, 10));
      await user.updatePassword('newPassword');

      expect(user.getUpdatedAt().getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });
  });

  describe('Entity getters', () => {
    it('should return all fields correctly', () => {
      expect(user.getId()).toBe('uuid-123');
      expect(user.getEmail()).toBe('test@example.com');
      expect(user.getUsername()).toBe('testuser');
      expect(user.getPassword()).toBe('plainPassword');
      expect(user.getCreatedAt()).toBeInstanceOf(Date);
      expect(user.getUpdatedAt()).toBeInstanceOf(Date);
    });

    it('should handle null username', () => {
      const userWithoutUsername = new User(
        'uuid-456',
        'test2@example.com',
        null,
        'password',
        new Date(),
        new Date(),
      );

      expect(userWithoutUsername.getUsername()).toBeNull();
    });
  });
});
