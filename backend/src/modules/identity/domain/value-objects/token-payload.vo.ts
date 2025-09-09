export class TokenPayload {
  constructor(
    public readonly sub: string,
    public readonly email: string,
  ) {}

  static create(userId: string, email: string): TokenPayload {
    return new TokenPayload(userId, email);
  }
}
