import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

/**
 * Functional route guard that protects routes requiring authentication.
 *
 * - If authenticated: allows navigation (returns true)
 * - If not authenticated: redirects to /login
 *
 * Usage in route config:
 * ```typescript
 * { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] }
 * ```
 */
export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  return router.createUrlTree(['/login']);
};
