import { makeEnvironmentProviders, EnvironmentProviders } from '@angular/core';
import { AuthService } from './auth.service';

export function provideAuth(): EnvironmentProviders {
  return makeEnvironmentProviders([AuthService]);
}
