import { makeEnvironmentProviders, EnvironmentProviders } from '@angular/core';
import { BreadcrumbService } from './breadcrumb.service';

export function provideBreadcrumb(): EnvironmentProviders {
  return makeEnvironmentProviders([BreadcrumbService]);
}
