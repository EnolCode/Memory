export class AuthResponseDto {
  accessToken: string;
  user: {
    id: string;
    email: string;
    username?: string;
  };
}

export class TokenPayload {
  sub: string; // ID del usuario (subject en JWT standard)
  email: string;
  iat?: number; // Issued at - automático
  exp?: number; // Expiration - automático
}
