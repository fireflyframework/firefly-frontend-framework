import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { PermissionService } from './permission.service';

/**
 * Factory that creates a route guard requiring ALL given permissions.
 *
 * - If the user has every listed permission: allows navigation.
 * - Otherwise: redirects to '/'.
 *
 * Usage:
 * ```typescript
 * { path: 'settings', canActivate: [permissionGuard('config.read', 'config.write')] }
 * ```
 */
export function permissionGuard(...required: string[]): CanActivateFn {
  return () => {
    const permissions = inject(PermissionService);
    const router = inject(Router);

    if (required.every((key) => permissions.permissions().includes(key))) {
      return true;
    }

    return router.createUrlTree(['/']);
  };
}

/**
 * Factory that creates a route guard requiring at least ONE of the given roles.
 *
 * - If the user has any of the listed roles: allows navigation.
 * - Otherwise: redirects to '/'.
 *
 * Usage:
 * ```typescript
 * { path: 'admin', canActivate: [roleGuard('admin', 'superadmin')] }
 * ```
 */
export function roleGuard(...roles: string[]): CanActivateFn {
  return () => {
    const permissions = inject(PermissionService);
    const router = inject(Router);

    if (roles.some((role) => permissions.roles().includes(role))) {
      return true;
    }

    return router.createUrlTree(['/']);
  };
}
