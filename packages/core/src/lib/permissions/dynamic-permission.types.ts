import { Signal } from '@angular/core';

/**
 * Map of route patterns to required permissions.
 *
 * Keys are route patterns (exact or wildcard with `*`).
 * Values are the permission key required to access that route.
 *
 * Examples:
 * ```typescript
 * const map: RoutePermissionMap = {
 *   '/admin/users': 'admin.users',
 *   '/catalog/*': 'catalog.read',
 * };
 * ```
 *
 * Matching order: exact match first, then wildcard from most to least specific.
 */
export interface RoutePermissionMap {
  [routePattern: string]: string;
}

/**
 * Configuration for the dynamic permission guard.
 */
export interface DynamicPermissionConfig {
  /** Route-to-permission map. Can be static or reactive (Signal). */
  permissionMap: Signal<RoutePermissionMap> | RoutePermissionMap;
  /** Behavior when the route is not found in the map. Default: 'deny'. */
  fallbackBehavior?: 'allow' | 'deny';
  /** Redirect target when access is denied. Default: '/'. */
  redirectTo?: string;
}
