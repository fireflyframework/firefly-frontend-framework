import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Component } from '@angular/core';
import { authGuard } from './auth.guard';
import { AuthService } from './auth.service';

@Component({ template: '', standalone: true })
class DummyComponent {}

describe('authGuard', () => {
  let authService: AuthService;
  let router: Router;

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([
          {
            path: 'protected',
            component: DummyComponent,
            canActivate: [authGuard],
          },
          {
            path: 'other',
            component: DummyComponent,
            canActivate: [authGuard],
          },
          { path: 'login', component: DummyComponent },
        ]),
      ],
    });

    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should allow navigation when authenticated', async () => {
    authService.isAuthenticated.set(true);

    const result = await router.navigateByUrl('/protected');

    expect(result).toBe(true);
    expect(router.url).toBe('/protected');
  });

  it('should redirect to /login when not authenticated', async () => {
    authService.isAuthenticated.set(false);

    const result = await router.navigateByUrl('/protected');

    expect(result).toBe(true);
    expect(router.url).toBe('/login');
  });

  it('should redirect when navigating to a different guarded route while unauthenticated', async () => {
    authService.isAuthenticated.set(false);

    await router.navigateByUrl('/other');

    expect(router.url).toBe('/login');
  });
});
