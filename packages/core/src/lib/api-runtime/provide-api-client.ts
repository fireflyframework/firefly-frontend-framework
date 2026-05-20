import { makeEnvironmentProviders, EnvironmentProviders } from '@angular/core';
import { ApiClient } from './api-client.service';

export function provideApiClient(): EnvironmentProviders {
  return makeEnvironmentProviders([ApiClient]);
}
