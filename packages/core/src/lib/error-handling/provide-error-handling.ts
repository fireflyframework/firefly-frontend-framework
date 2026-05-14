import {
  ErrorHandler,
  EnvironmentProviders,
  makeEnvironmentProviders,
} from '@angular/core';
import type { ErrorHandlingConfig } from './app-error';
import { ERROR_HANDLING_CONFIG } from './error.service';
import { FireflyErrorHandler } from './firefly-error-handler';

/**
 * Configure the error-handling module.
 *
 * Replaces Angular's default `ErrorHandler` with `FireflyErrorHandler`,
 * which captures uncaught errors and records them in `ErrorService`.
 *
 * **Important:** This does NOT register `errorInterceptor`. HTTP error
 * classification requires the interceptor to be added separately:
 *
 * ```ts
 * import { errorInterceptor } from '@fireflyframework/core';
 *
 * export const appConfig: ApplicationConfig = {
 *   providers: [
 *     provideHttpClient(
 *       withInterceptors([authInterceptor, errorInterceptor]),
 *     ),
 *     provideErrorHandling({ maxHistorySize: 100 }),
 *   ],
 * };
 * ```
 *
 * @param config - Optional configuration (maxHistorySize). Defaults apply if omitted.
 * @returns EnvironmentProviders to register in the application config
 */
export function provideErrorHandling(
  config?: ErrorHandlingConfig,
): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: ErrorHandler, useClass: FireflyErrorHandler },
    ...(config ? [{ provide: ERROR_HANDLING_CONFIG, useValue: config }] : []),
  ]);
}
