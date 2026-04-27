import { InjectionToken } from '@angular/core';
import { UserRole } from './user-context.types';

/**
 * Injection token for role priority configuration.
 * Defines the order in which roles are evaluated — first match wins.
 * Override via providers to customize per product.
 *
 * ```typescript
 * providers: [
 *   { provide: ROLE_PRIORITY, useValue: ['admin', 'supervisor', 'distributor', 'agent'] }
 * ]
 * ```
 *
 * Default: empty array (first role in the user's roles list is used).
 */
export const ROLE_PRIORITY = new InjectionToken<UserRole[]>(
  'ROLE_PRIORITY',
  { factory: () => [] },
);
