import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { LoginCredentials, AuthTokens, AuthResult } from './auth.types';

const TOKEN_STORAGE_KEY = 'ff_access_token';
const REFRESH_STORAGE_KEY = 'ff_refresh_token';
const AUTH_API_BASE = '/api/v1/experience/security';

/**
 * Core authentication service for the Firefly framework.
 *
 * Handles login, logout, token storage (localStorage), and token refresh
 * with mutual exclusion to prevent concurrent refresh requests.
 *
 * This service is intentionally decoupled from SessionService and
 * UserContextService (D8 — 3 independent services). Logout coordination
 * across services is the consumer's responsibility.
 *
 * API base: /api/v1/experience/security (exp-security microservice)
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  /** Reactive signal indicating whether the user is currently authenticated. */
  readonly isAuthenticated = signal(false);

  /** Mutex: holds the in-flight refresh promise so concurrent callers share it. */
  private refreshPromise: Promise<boolean> | null = null;

  constructor(private readonly http: HttpClient) {}

  /**
   * Authenticate with username/password credentials.
   * On success, stores tokens in localStorage and sets isAuthenticated to true.
   *
   * @param credentials - Username, password, and optional deviceInfo
   * @returns AuthResult with success status and tokens or error message
   */
  async login(credentials: LoginCredentials): Promise<AuthResult> {
    try {
      const tokens = await firstValueFrom(
        this.http.post<AuthTokens>(`${AUTH_API_BASE}/auth/login`, credentials),
      );
      this.storeTokens(tokens);
      this.isAuthenticated.set(true);
      return { success: true, tokens };
    } catch (error: unknown) {
      this.isAuthenticated.set(false);
      const message =
        error instanceof Error ? error.message : 'Login failed';
      return { success: false, error: message };
    }
  }

  /**
   * Log out the current user.
   * Clears local tokens immediately, then notifies the server (best-effort).
   * Does NOT call SessionService or UserContextService — the consumer
   * is responsible for coordinating a full logout across services.
   */
  async logout(): Promise<void> {
    const token = this.getAccessToken();
    this.clearTokens();
    this.isAuthenticated.set(false);

    if (token) {
      try {
        await firstValueFrom(
          this.http.post(`${AUTH_API_BASE}/auth/logout`, null),
        );
      } catch {
        // Server logout is best-effort; local state is already cleared
      }
    }
  }

  /**
   * Refresh the access token using the stored refresh token.
   * Uses mutual exclusion: if a refresh is already in progress,
   * subsequent calls await the same promise instead of firing a new request.
   *
   * @returns true if refresh succeeded, false otherwise
   */
  async refreshToken(): Promise<boolean> {
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = this.doRefresh();
    try {
      return await this.refreshPromise;
    } finally {
      this.refreshPromise = null;
    }
  }

  /**
   * Attempt to restore a previous session from localStorage.
   * Checks for stored tokens and validates expiration.
   * If the access token is expired but a refresh token exists, attempts refresh.
   *
   * @returns true if session was restored successfully
   */
  async restoreSession(): Promise<boolean> {
    const accessToken = this.getAccessToken();
    const refreshTokenValue = localStorage.getItem(REFRESH_STORAGE_KEY);

    if (!accessToken || !refreshTokenValue) {
      this.isAuthenticated.set(false);
      return false;
    }

    if (this.isTokenExpired(accessToken)) {
      return this.refreshToken();
    }

    this.isAuthenticated.set(true);
    return true;
  }

  /**
   * Get the current access token from localStorage.
   *
   * @returns The stored JWT access token, or null if not authenticated
   */
  getAccessToken(): string | null {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  }

  /** Execute the actual refresh API call. Called only by refreshToken(). */
  private async doRefresh(): Promise<boolean> {
    const refreshTokenValue = localStorage.getItem(REFRESH_STORAGE_KEY);
    if (!refreshTokenValue) {
      this.isAuthenticated.set(false);
      return false;
    }

    try {
      const tokens = await firstValueFrom(
        this.http.post<AuthTokens>(`${AUTH_API_BASE}/auth/refresh`, {
          refreshToken: refreshTokenValue,
        }),
      );
      this.storeTokens(tokens);
      this.isAuthenticated.set(true);
      return true;
    } catch {
      this.clearTokens();
      this.isAuthenticated.set(false);
      return false;
    }
  }

  private storeTokens(tokens: AuthTokens): void {
    localStorage.setItem(TOKEN_STORAGE_KEY, tokens.accessToken);
    localStorage.setItem(REFRESH_STORAGE_KEY, tokens.refreshToken);
  }

  private clearTokens(): void {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(REFRESH_STORAGE_KEY);
  }

  /** Check JWT expiration by decoding the payload. Returns true if expired or malformed. */
  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  }
}
