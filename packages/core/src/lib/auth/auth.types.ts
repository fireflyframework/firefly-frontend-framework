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

/**
 * Optional configuration for the auth module (passed to `provideAuth`).
 */
export interface AuthConfig {
  /**
   * Maps the framework `LoginCredentials` (`{ username, password, deviceInfo? }`)
   * to the request body the backend actually expects. Use this when the
   * backend's login contract differs from the framework's (e.g. it wants
   * `{ email, password, tenantSlug }`). When omitted, the credentials are
   * sent as-is — existing integrations are unaffected.
   */
  loginBodyMapper?: (credentials: LoginCredentials) => unknown;
}
