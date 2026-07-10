import { Pipe, PipeTransform } from '@angular/core';
import { parseUserAgent } from '@fireflyframework/utils/user-agent';

/**
 * Formats a raw User-Agent string into a short `Browser · OS` device label for
 * an active-sessions list (e.g. `Chrome · macOS`). Wraps `parseUserAgent` from
 * `@fireflyframework/utils/user-agent`; pure pipe, memoised per input.
 *
 * @example
 * ```html
 * <span>{{ session.userAgent | ffDeviceLabel }}</span>
 * ```
 */
@Pipe({ name: 'ffDeviceLabel', standalone: true })
export class FfDeviceLabelPipe implements PipeTransform {
  transform(userAgent: string | undefined | null): string {
    const { browser, os } = parseUserAgent(userAgent);
    return `${browser} · ${os}`;
  }
}
