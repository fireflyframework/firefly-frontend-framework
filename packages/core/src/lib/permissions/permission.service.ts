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
@Injectable({ providedIn: 'root' })
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
   */
  setPermissions(permissions: string[], roles: string[]): void {
    this._permissions.set(permissions);
    this._roles.set(roles);
  }

  /** Check if a specific permission is present. */
  hasPermission(key: string): Signal<boolean> {
    return computed(() => this._permissions().includes(key));
  }

  /** Check if a specific role is present. */
  hasRole(role: string): Signal<boolean> {
    return computed(() => this._roles().includes(role));
  }

  /** Check if at least one of the given roles is present. */
  hasAnyRole(...roles: string[]): Signal<boolean> {
    return computed(() => roles.some((r) => this._roles().includes(r)));
  }

  /** Check if all of the given permissions are present. */
  hasAllPermissions(...keys: string[]): Signal<boolean> {
    return computed(() => keys.every((k) => this._permissions().includes(k)));
  }

  /** Return a snapshot of the current state. */
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
