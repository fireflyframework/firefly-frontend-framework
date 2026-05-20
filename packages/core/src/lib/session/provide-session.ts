import { makeEnvironmentProviders, EnvironmentProviders } from '@angular/core';
import { SessionService } from './session.service';
import { SESSION_TIMEOUT_CONFIG } from './session-timeout.config';
import type { SessionTimeoutConfig } from './session.types';

export function provideSession(
  config?: SessionTimeoutConfig,
): EnvironmentProviders {
  return makeEnvironmentProviders([
    SessionService,
    ...(config
      ? [{ provide: SESSION_TIMEOUT_CONFIG, useValue: config }]
      : []),
  ]);
}
