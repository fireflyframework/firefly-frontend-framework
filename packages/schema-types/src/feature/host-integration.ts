/**
 * Host integration configuration for embedded archetype products.
 *
 * Defines how the micro-frontend communicates with its host application
 * regarding authentication, theming, and event exchange.
 *
 * Required when `archetype.mode` is `'embedded'`.
 *
 * @example
 * ```yaml
 * hostIntegration:
 *   auth: delegated
 *   events: [session:expired, navigation:change]
 *   theme: external
 *   communication: postMessage
 * ```
 */
export interface HostIntegration {
  /** Authentication strategy — `delegated` defers to the host, `standard` handles its own. */
  auth: 'delegated' | 'standard';

  /** Event names exchanged between host and micro-frontend. */
  events: string[];

  /** Theming source — `external` inherits from host CSS, `api` fetches from backend. */
  theme: 'external' | 'api';

  /** Communication channel with the host application. */
  communication?: 'postMessage' | 'customEvent';
}
