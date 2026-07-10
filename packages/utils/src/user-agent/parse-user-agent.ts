/** Browser + OS + coarse device type parsed from a raw User-Agent string. */
export interface ParsedUserAgent {
  /** Browser family (e.g. `Chrome`, `Edge`, `Safari`, `Firefox`) or `Unknown`. */
  readonly browser: string;
  /** OS family (e.g. `Windows`, `macOS`, `iOS`, `Android`, `Linux`) or `Unknown`. */
  readonly os: string;
  /** Coarse device class derived from the OS / mobile hints. */
  readonly deviceType: 'mobile' | 'desktop';
}

/**
 * Best-effort parse of a raw User-Agent into a human-readable
 * {@link ParsedUserAgent}. Heuristic only — it covers the common browser/OS
 * families needed by an active-sessions list and degrades to `Unknown` rather
 * than throwing on an unfamiliar string.
 *
 * @example
 * parseUserAgent('Mozilla/5.0 (Macintosh; …) Chrome/122 Safari/537');
 * // => { browser: 'Chrome', os: 'macOS', deviceType: 'desktop' }
 */
export function parseUserAgent(userAgent: string | undefined | null): ParsedUserAgent {
  const ua = userAgent ?? '';

  const os = ((): string => {
    if (/windows/i.test(ua)) return 'Windows';
    if (/iphone|ipad|ipod/i.test(ua)) return 'iOS';
    if (/mac os x|macintosh/i.test(ua)) return 'macOS';
    if (/android/i.test(ua)) return 'Android';
    if (/linux/i.test(ua)) return 'Linux';
    return 'Unknown';
  })();

  const browser = ((): string => {
    if (/edg\//i.test(ua)) return 'Edge';
    if (/opr\/|opera/i.test(ua)) return 'Opera';
    if (/firefox|fxios/i.test(ua)) return 'Firefox';
    if (/chrome|crios/i.test(ua)) return 'Chrome';
    if (/safari/i.test(ua)) return 'Safari';
    return 'Unknown';
  })();

  const deviceType: ParsedUserAgent['deviceType'] = /mobile|iphone|ipod|android/i.test(ua)
    ? 'mobile'
    : 'desktop';

  return { browser, os, deviceType };
}
