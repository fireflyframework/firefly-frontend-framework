/**
 * User profile information.
 * Maps to Flutter: UserModelBO (subset of fields relevant to frontend context)
 */
export interface UserProfile {
  userId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
}

/**
 * User role type. Generic string to allow products to define their own roles.
 * Products should define specific role unions (e.g. 'agent' | 'admin' | 'distributor').
 */
export type UserRole = string;

/**
 * Decoded JWT token payload.
 * Used by UserContextService.setFromToken() to populate user context signals.
 * Product-specific claims (e.g. distributorId) are accessible via index signature.
 */
export interface DecodedToken {
  sub: string;
  roles: string[];
  exp: number;
  iat: number;
  [key: string]: unknown;
}
