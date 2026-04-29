/**
 * Read-only snapshot of the current permission state.
 * Useful for debugging, serialization, and testing.
 */
export interface PermissionSnapshot {
  readonly permissions: readonly string[];
  readonly roles: readonly string[];
}
