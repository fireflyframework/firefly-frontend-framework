import { TestBed } from '@angular/core/testing';
import {
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { AuthTokens } from './auth.types';
import { SessionService } from '../session/session.service';
import { UserContextService } from '../user-context/user-context.service';
import { provideAuth } from './provide-auth';
import { provideSession } from '../session/provide-session';
import { provideUserContext } from '../user-context/provide-user-context';

const API = '/api/v1/experience/security';

const MOCK_TOKENS: AuthTokens = {
  accessToken: buildJwt({ sub: 'u1', exp: futureExp() }),
  refreshToken: 'refresh-abc',
  expiresIn: 3600,
  tokenType: 'Bearer',
};

/** Build a minimal JWT with a JSON payload (header.payload.signature). */
function buildJwt(payload: Record<string, unknown>): string {
  const header = btoa(JSON.stringify({ alg: 'none' }));
  const body = btoa(JSON.stringify(payload));
  return `${header}.${body}.sig`;
}

function futureExp(): number {
  return Math.floor(Date.now() / 1000) + 3600;
}

function pastExp(): number {
  return Math.floor(Date.now() / 1000) - 3600;
}

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let sessionService: SessionService;
  let userContextService: UserContextService;

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [
        provideAuth(),
        provideSession(),
        provideUserContext(),
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    sessionService = TestBed.inject(SessionService);
    userContextService = TestBed.inject(UserContextService);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  // ── login ────────────────────────────────────────────────

  describe('login', () => {
    it('should store tokens and set isAuthenticated on success', async () => {
      const promise = service.login({
        username: 'user',
        password: 'pass',
      });

      const req = httpMock.expectOne(`${API}/auth/login`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({
        username: 'user',
        password: 'pass',
      });
      req.flush(MOCK_TOKENS);

      const result = await promise;

      expect(result.success).toBe(true);
      expect(result.tokens).toEqual(MOCK_TOKENS);
      expect(service.isAuthenticated()).toBe(true);
      expect(localStorage.getItem('ff_access_token')).toBe(
        MOCK_TOKENS.accessToken,
      );
      expect(localStorage.getItem('ff_refresh_token')).toBe(
        MOCK_TOKENS.refreshToken,
      );
    });

    it('should return error and set isAuthenticated false on failure', async () => {
      const promise = service.login({
        username: 'user',
        password: 'wrong',
      });

      const req = httpMock.expectOne(`${API}/auth/login`);
      req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

      const result = await promise;

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(service.isAuthenticated()).toBe(false);
    });

    it('should forward optional deviceInfo in the request body', async () => {
      const promise = service.login({
        username: 'u',
        password: 'p',
        deviceInfo: 'browser-xyz',
      });

      const req = httpMock.expectOne(`${API}/auth/login`);
      expect(req.request.body.deviceInfo).toBe('browser-xyz');
      req.flush(MOCK_TOKENS);

      await promise;
    });
  });

  // ── logout ───────────────────────────────────────────────

  describe('logout', () => {
    it('should clear tokens, set isAuthenticated false, and call server', async () => {
      localStorage.setItem('ff_access_token', 'tok');
      localStorage.setItem('ff_refresh_token', 'ref');

      const promise = service.logout();

      const req = httpMock.expectOne(`${API}/auth/logout`);
      expect(req.request.method).toBe('POST');
      req.flush(null);

      await promise;

      expect(service.isAuthenticated()).toBe(false);
      expect(localStorage.getItem('ff_access_token')).toBeNull();
      expect(localStorage.getItem('ff_refresh_token')).toBeNull();
    });

    it('should clear local state even if server logout fails', async () => {
      localStorage.setItem('ff_access_token', 'tok');
      localStorage.setItem('ff_refresh_token', 'ref');

      const promise = service.logout();

      const req = httpMock.expectOne(`${API}/auth/logout`);
      req.flush('error', { status: 500, statusText: 'Server Error' });

      await promise;

      expect(service.isAuthenticated()).toBe(false);
      expect(localStorage.getItem('ff_access_token')).toBeNull();
    });

    it('should skip server call when no token exists', async () => {
      await service.logout();

      httpMock.expectNone(`${API}/auth/logout`);
      expect(service.isAuthenticated()).toBe(false);
    });

    it('should stop session tracking and clear user context', async () => {
      localStorage.setItem('ff_access_token', 'tok');

      const stopSpy = vi.spyOn(sessionService, 'stopTracking');
      const clearSpy = vi.spyOn(userContextService, 'clear');

      const promise = service.logout();

      const req = httpMock.expectOne(`${API}/auth/logout`);
      req.flush(null);

      await promise;

      expect(stopSpy).toHaveBeenCalledOnce();
      expect(clearSpy).toHaveBeenCalledOnce();

      stopSpy.mockRestore();
      clearSpy.mockRestore();
    });
  });

  // ── refreshToken ─────────────────────────────────────────

  describe('refreshToken', () => {
    it('should refresh and store new tokens on success', async () => {
      localStorage.setItem('ff_refresh_token', 'old-refresh');

      const promise = service.refreshToken();

      const req = httpMock.expectOne(`${API}/auth/refresh`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ refreshToken: 'old-refresh' });
      req.flush(MOCK_TOKENS);

      const result = await promise;

      expect(result).toBe(true);
      expect(service.isAuthenticated()).toBe(true);
      expect(localStorage.getItem('ff_access_token')).toBe(
        MOCK_TOKENS.accessToken,
      );
    });

    it('should return false and clear tokens on refresh failure', async () => {
      localStorage.setItem('ff_refresh_token', 'old');
      localStorage.setItem('ff_access_token', 'stale');

      const promise = service.refreshToken();

      const req = httpMock.expectOne(`${API}/auth/refresh`);
      req.flush('fail', { status: 401, statusText: 'Unauthorized' });

      const result = await promise;

      expect(result).toBe(false);
      expect(service.isAuthenticated()).toBe(false);
      expect(localStorage.getItem('ff_access_token')).toBeNull();
      expect(localStorage.getItem('ff_refresh_token')).toBeNull();
    });

    it('should return false when no refresh token exists', async () => {
      const result = await service.refreshToken();

      expect(result).toBe(false);
      expect(service.isAuthenticated()).toBe(false);
    });

    it('should share a single in-flight request across concurrent callers (mutex)', async () => {
      localStorage.setItem('ff_refresh_token', 'ref');

      const p1 = service.refreshToken();
      const p2 = service.refreshToken();
      const p3 = service.refreshToken();

      // Only ONE request should have been sent
      const reqs = httpMock.match(`${API}/auth/refresh`);
      expect(reqs.length).toBe(1);
      reqs[0].flush(MOCK_TOKENS);

      const [r1, r2, r3] = await Promise.all([p1, p2, p3]);

      expect(r1).toBe(true);
      expect(r2).toBe(true);
      expect(r3).toBe(true);
    });
  });

  // ── restoreSession ───────────────────────────────────────

  describe('restoreSession', () => {
    it('should return true and set isAuthenticated when tokens are valid', async () => {
      const validToken = buildJwt({ sub: 'u1', exp: futureExp() });
      localStorage.setItem('ff_access_token', validToken);
      localStorage.setItem('ff_refresh_token', 'ref');

      const result = await service.restoreSession();

      expect(result).toBe(true);
      expect(service.isAuthenticated()).toBe(true);
    });

    it('should return false when no tokens exist', async () => {
      const result = await service.restoreSession();

      expect(result).toBe(false);
      expect(service.isAuthenticated()).toBe(false);
    });

    it('should attempt refresh when access token is expired', async () => {
      const expiredToken = buildJwt({ sub: 'u1', exp: pastExp() });
      localStorage.setItem('ff_access_token', expiredToken);
      localStorage.setItem('ff_refresh_token', 'ref');

      const promise = service.restoreSession();

      const req = httpMock.expectOne(`${API}/auth/refresh`);
      req.flush(MOCK_TOKENS);

      const result = await promise;

      expect(result).toBe(true);
      expect(service.isAuthenticated()).toBe(true);
    });

    it('should return false when access token is expired and refresh fails', async () => {
      const expiredToken = buildJwt({ sub: 'u1', exp: pastExp() });
      localStorage.setItem('ff_access_token', expiredToken);
      localStorage.setItem('ff_refresh_token', 'ref');

      const promise = service.restoreSession();

      const req = httpMock.expectOne(`${API}/auth/refresh`);
      req.flush('fail', { status: 401, statusText: 'Unauthorized' });

      const result = await promise;

      expect(result).toBe(false);
      expect(service.isAuthenticated()).toBe(false);
    });

    it('should return false when access token exists but refresh token is missing', async () => {
      const validToken = buildJwt({ sub: 'u1', exp: futureExp() });
      localStorage.setItem('ff_access_token', validToken);
      // no refresh token

      const result = await service.restoreSession();

      expect(result).toBe(false);
      expect(service.isAuthenticated()).toBe(false);
    });
  });

  // ── getAccessToken ───────────────────────────────────────

  describe('getAccessToken', () => {
    it('should return the stored access token', () => {
      localStorage.setItem('ff_access_token', 'my-token');
      expect(service.getAccessToken()).toBe('my-token');
    });

    it('should return null when no token is stored', () => {
      expect(service.getAccessToken()).toBeNull();
    });
  });
});
