import * as bcrypt from 'bcrypt';
import { User } from './user.entity';

describe('User Entity', () => {
  let user: User;

  beforeEach(() => {
    user = new User();
    user.id = 'uuid-123';
    user.email = 'test@example.com';
    user.username = 'testuser';
    user.password = 'plainPassword';
  });

  describe('hashPassword', () => {
    it('should hash password before insert', async () => {
      await user.hashPassword();

      expect(user.password).not.toBe('plainPassword');
      expect(user.password).toContain('$2b$');
      
      // Verificar que el hash es válido
      const isValid = await bcrypt.compare('plainPassword', user.password);
      expect(isValid).toBe(true);
    });

    it('should not re-hash already hashed password', async () => {
      // Simular un password ya hasheado
      user.password = '$2b$12$hashedPassword';
      const originalHash = user.password;

      await user.hashPassword();

      expect(user.password).toBe(originalHash);
    });

    it('should use 12 rounds for bcrypt', async () => {
      await user.hashPassword();

      // El hash de bcrypt incluye el número de rounds
      // $2b$12$ indica 12 rounds
      expect(user.password).toContain('$2b$12$');
    });
  });

  describe('validatePassword', () => {
    beforeEach(async () => {
      // Hashear el password primero
      user.password = await bcrypt.hash('correctPassword', 12);
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
      const result = await user.validatePassword(null as any);
      expect(result).toBe(false);
    });
  });

  describe('setRefreshToken', () => {
    it('should hash and store refresh token', async () => {
      const refreshToken = 'refresh-token-123';
      
      await user.setRefreshToken(refreshToken);

      expect(user.hashedRefreshToken).toBeDefined();
      expect(user.hashedRefreshToken).not.toBe(refreshToken);
      expect(user.hashedRefreshToken).toContain('$2b$');
    });

    it('should use 10 rounds for refresh token hashing', async () => {
      await user.setRefreshToken('refresh-token');

      // $2b$10$ indica 10 rounds
      expect(user.hashedRefreshToken).toContain('$2b$10$');
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
      user.hashedRefreshToken = '';
      
      const result = await user.validateRefreshToken(validToken);
      expect(result).toBe(false);
    });

    it('should return false for empty refresh token', async () => {
      const result = await user.validateRefreshToken('');
      expect(result).toBe(false);
    });
  });

  describe('removeRefreshToken', () => {
    it('should clear the refresh token', () => {
      user.hashedRefreshToken = 'some-hashed-token';
      
      user.removeRefreshToken();

      expect(user.hashedRefreshToken).toBe('');
    });

    it('should work even if refresh token is already null', () => {
      user.hashedRefreshToken = '';
      
      expect(() => user.removeRefreshToken()).not.toThrow();
      expect(user.hashedRefreshToken).toBe('');
    });
  });

  describe('Entity fields', () => {
    it('should have all required fields', () => {
      const newUser = new User();

      expect(newUser).toHaveProperty('id');
      expect(newUser).toHaveProperty('email');
      expect(newUser).toHaveProperty('username');
      expect(newUser).toHaveProperty('password');
      expect(newUser).toHaveProperty('hashedRefreshToken');
      expect(newUser).toHaveProperty('createdAt');
      expect(newUser).toHaveProperty('updatedAt');
    });
  });
});