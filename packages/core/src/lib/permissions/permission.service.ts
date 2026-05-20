import { Injectable, Signal, computed, signal } from '@angular/core';
import { PermissionSnapshot } from './permission.types';

/**
 * Generic permission and role management service.
 *
 * Provides the **mechanics** of permissions: store, query, and react.
 * The **semantics** (which roles/permissions exist, what they mean)
 * are defined by the product layer.
 *
 * Usage: after login, the product calls `setPermissions()` with the
 * resolved permissions and roles. On logout, the product calls `clear()`.
 *
 * All queries return reactive signals — UI updates automatically
 * when permissions change.
 */
@Injectable()
export class PermissionService {
  private readonly _permissions = signal<string[]>([]);
  private readonly _roles = signal<string[]>([]);

  /** Current permissions (read-only). */
  readonly permissions = this._permissions.asReadonly();

  /** Current roles (read-only). */
  readonly roles = this._roles.asReadonly();

  /**
   * Set permissions and roles. Called by the product's auth flow after login.
   * Replaces any previously stored values.
   *
   * @param permissions - Array of permission keys (e.g. `['catalog.read', 'admin.users']`)
   * @param roles - Array of role identifiers (e.g. `['admin', 'agent']`)
   */
  setPermissions(permissions: string[], roles: string[]): void {
    this._permissions.set(permissions);
    this._roles.set(roles);
  }

  /**
   * Check if a specific permission is present.
   *
   * @param key - Permission key to check
   * @returns Reactive signal that emits `true` when the permission is granted
   */
  hasPermission(key: string): Signal<boolean> {
    return computed(() => this._permissions().includes(key));
  }

  /**
   * Check if a specific role is present.
   *
   * @param role - Role identifier to check
   * @returns Reactive signal that emits `true` when the role is assigned
   */
  hasRole(role: string): Signal<boolean> {
    return computed(() => this._roles().includes(role));
  }

  /**
   * Check if at least one of the given roles is present.
   *
   * @param roles - Role identifiers to check (at least one must match)
   * @returns Reactive signal that emits `true` when any role matches
   */
  hasAnyRole(...roles: string[]): Signal<boolean> {
    return computed(() => roles.some((r) => this._roles().includes(r)));
  }

  /**
   * Check if all of the given permissions are present.
   *
   * @param keys - Permission keys that must all be granted
   * @returns Reactive signal that emits `true` when every key is present
   */
  hasAllPermissions(...keys: string[]): Signal<boolean> {
    return computed(() => keys.every((k) => this._permissions().includes(k)));
  }

  /**
   * Return a snapshot of the current state.
   *
   * @returns Plain object with current permissions and roles arrays
   */
  snapshot(): PermissionSnapshot {
    return {
      permissions: this._permissions(),
      roles: this._roles(),
    };
  }

  /** Clear all permissions and roles. Typically called on logout. */
  clear(): void {
    this._permissions.set([]);
    this._roles.set([]);
  }
}
