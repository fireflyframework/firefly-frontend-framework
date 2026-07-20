import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAlerts } from '@fireflyframework/core';
import { provideFfIcons, provideFfNoResultsConfig } from '@fireflyframework/design-system';

import { appRoutes } from './app.routes';
import { PLAYGROUND_ICONS } from './shared/icons';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(appRoutes),
    provideFfIcons(PLAYGROUND_ICONS),
    provideAlerts(),
    provideFfNoResultsConfig({
      title: 'No records found',
      description: 'Try adjusting your filters or check back later.',
    }),
  ],
};
