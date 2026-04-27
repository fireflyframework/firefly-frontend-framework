/**
 * Credentials for username/password login.
 * Maps to OpenAPI: LoginCommand (exp-security POST /auth/login)
 */
export interface LoginCredentials {
  username: string;
  password: string;
  deviceInfo?: string;
}

/**
 * Token payload returned by login and refresh endpoints.
 * Maps to OpenAPI: AuthTokenDTO (exp-security)
 */
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
}

/**
 * Result of a login attempt.
 */
export interface AuthResult {
  success: boolean;
  tokens?: AuthTokens;
  error?: string;
}
