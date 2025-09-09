export class AuthResponseDto {
  accessToken: string;
  user: {
    id: string;
    email: string;
    username: string | null;
  };
}

export class AuthResponseWithRefreshDto extends AuthResponseDto {
  refreshToken: string;
}