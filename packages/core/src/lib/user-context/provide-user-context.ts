import { makeEnvironmentProviders, EnvironmentProviders } from '@angular/core';
import { UserContextService } from './user-context.service';

export function provideUserContext(): EnvironmentProviders {
  return makeEnvironmentProviders([UserContextService]);
}
