import { Injectable, computed, inject, signal } from '@angular/core';
import { ROLE_PRIORITY } from './role-priority.config';
import { UserProfile, UserRole } from './user-context.types';

/**
 * Reactive state container for the current user's identity and roles.
 *
 * Holds:
 * - `user` — profile info
 * - `roles` — array of role strings
 * - `currentRole` — computed highest-priority role
 *
 * This service is pure state — no side effects, no HTTP calls,
 * no knowledge of auth or session lifecycle, no token parsing.
 * The product layer is responsible for mapping its token/API
 * responses to these signals.
 */
@Injectable({ providedIn: 'root' })
export class UserContextService {
  readonly user = signal<UserProfile | null>(null);
  readonly roles = signal<UserRole[]>([]);

  private readonly rolePriority = inject(ROLE_PRIORITY);

  /** Highest-priority role from the current roles list. */
  readonly currentRole = computed<UserRole | null>(() => {
    const current = this.roles();
    if (current.length === 0) {
      return null;
    }
    for (const role of this.rolePriority) {
      if (current.includes(role)) {
        return role;
      }
    }
    // If no priority match (or empty priority list), return first role
    return current[0];
  });

  /** Set user profile (e.g. from a /me API response or decoded token). */
  setUser(profile: UserProfile): void {
    this.user.set(profile);
  }

  /** Set user roles. */
  setRoles(roles: UserRole[]): void {
    this.roles.set(roles);
  }

  /** Reset all signals to their initial empty state. */
  clear(): void {
    this.user.set(null);
    this.roles.set([]);
  }
}
