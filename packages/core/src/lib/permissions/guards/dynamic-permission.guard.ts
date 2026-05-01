import { inject, isSignal } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';
import { PermissionService } from '../permission.service';
import {
  DynamicPermissionConfig,
  RoutePermissionMap,
} from '../dynamic-permission.types';
import { DYNAMIC_PERMISSION_CONFIG } from '../provide-dynamic-permissions';

/**
 * Resolves the current map value, whether it's a plain object or a Signal.
 */
function resolveMap(
  mapOrSignal: DynamicPermissionConfig['permissionMap'],
): RoutePermissionMap {
  return isSignal(mapOrSignal) ? mapOrSignal() : mapOrSignal;
}

/**
 * Builds the full path for the activated route snapshot.
 */
function buildFullPath(route: ActivatedRouteSnapshot): string {
  const segments: string[] = [];
  let current: ActivatedRouteSnapshot | null = route;
  while (current) {
    const url = current.url.map((s) => s.path).join('/');
    if (url) {
      segments.unshift(url);
    }
    current = current.parent;
  }
  return '/' + segments.join('/');
}

/**
 * Finds the required permission for a given path by consulting the map.
 * Exact match takes priority, then wildcard patterns sorted by specificity
 * (longest prefix first).
 *
 * Returns `undefined` if no matching entry is found.
 */
function findPermission(
  path: string,
  map: RoutePermissionMap,
): string | undefined {
  // 1. Exact match
  if (map[path] !== undefined) {
    return map[path];
  }

  // 2. Wildcard match — sort by specificity (longest prefix first)
  const wildcardEntries = Object.keys(map)
    .filter((pattern) => pattern.endsWith('/*'))
    .sort((a, b) => b.length - a.length);

  for (const pattern of wildcardEntries) {
    const prefix = pattern.slice(0, -1); // '/catalog/*' → '/catalog/'
    if (path.startsWith(prefix) || path === prefix.slice(0, -1)) {
      return map[pattern];
    }
  }

  return undefined;
}

/**
 * Guard that consults a `RoutePermissionMap` to determine the required
 * permission for each route, instead of having permissions hardcoded
 * in the route definition.
 *
 * Complements `permissionGuard()` (compile-time permissions) with
 * runtime-configurable permissions.
 *
 * Usage with provider (recommended):
 * ```typescript
 * // In app.config.ts:
 * provideDynamicPermissions({
 *   permissionMap: { '/admin/*': 'admin.access', '/catalog/*': 'catalog.read' },
 *   fallbackBehavior: 'allow',
 * })
 *
 * // In routes:
 * { path: 'admin', canActivate: [dynamicPermissionGuard()] }
 * ```
 *
 * Usage with inline config:
 * ```typescript
 * { path: 'admin', canActivate: [dynamicPermissionGuard({
 *   permissionMap: { '/admin/*': 'admin.access' },
 * })] }
 * ```
 */
export function dynamicPermissionGuard(
  config?: DynamicPermissionConfig,
): CanActivateFn {
  return (route: ActivatedRouteSnapshot) => {
    const permissions = inject(PermissionService);
    const router = inject(Router);

    // Resolve config: inline > token > default
    let resolvedConfig = config;
    if (!resolvedConfig) {
      resolvedConfig = inject(DYNAMIC_PERMISSION_CONFIG, { optional: true }) ?? undefined;
    }

    const fallback = resolvedConfig?.fallbackBehavior ?? 'deny';
    const redirectTo = resolvedConfig?.redirectTo ?? '/';

    // No config at all → apply fallback
    if (!resolvedConfig) {
      return fallback === 'allow' ? true : router.createUrlTree([redirectTo]);
    }

    const map = resolveMap(resolvedConfig.permissionMap);
    const fullPath = buildFullPath(route);
    const requiredPermission = findPermission(fullPath, map);

    // Route not in map → apply fallback
    if (requiredPermission === undefined) {
      return fallback === 'allow' ? true : router.createUrlTree([redirectTo]);
    }

    // Check permission
    if (permissions.permissions().includes(requiredPermission)) {
      return true;
    }

    return router.createUrlTree([redirectTo]);
  };
}
