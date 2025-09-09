import * as bcrypt from 'bcrypt';

export class User {
  private hashedRefreshToken?: string;

  constructor(
    private readonly id: string,
    private email: string,
    private username: string | null,
    private password: string,
    private readonly createdAt: Date,
    private updatedAt: Date,
  ) {}

  // Getters
  getId(): string {
    return this.id;
  }

  getEmail(): string {
    return this.email;
  }

  getUsername(): string | null {
    return this.username;
  }

  getPassword(): string {
    return this.password;
  }

  getHashedRefreshToken(): string | undefined {
    return this.hashedRefreshToken;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getUpdatedAt(): Date {
    return this.updatedAt;
  }

  // Business Logic
  async hashPasswordBeforeCreate(): Promise<void> {
    if (this.password && !this.password.startsWith('$2b$')) {
      this.password = await bcrypt.hash(this.password, 12);
    }
  }

  async validatePassword(password: string): Promise<boolean> {
    if (!password || !this.password) return false;
    return bcrypt.compare(password, this.password);
  }

  async setRefreshToken(refreshToken: string): Promise<void> {
    this.hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    this.updatedAt = new Date();
  }

  async validateRefreshToken(refreshToken: string): Promise<boolean> {
    if (!this.hashedRefreshToken) return false;
    return bcrypt.compare(refreshToken, this.hashedRefreshToken);
  }

  removeRefreshToken(): void {
    this.hashedRefreshToken = '';
    this.updatedAt = new Date();
  }

  updateEmail(email: string): void {
    this.email = email;
    this.updatedAt = new Date();
  }

  updateUsername(username: string): void {
    this.username = username;
    this.updatedAt = new Date();
  }

  async updatePassword(newPassword: string): Promise<void> {
    this.password = await bcrypt.hash(newPassword, 12);
    this.updatedAt = new Date();
  }
}
