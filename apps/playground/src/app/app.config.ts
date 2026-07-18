import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAlertConfirm, provideAlerts } from '@fireflyframework/core';
import { provideFfIcons } from '@fireflyframework/design-system';

import { appRoutes } from './app.routes';
import { PLAYGROUND_ICONS } from './shared/icons';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(appRoutes),
    provideFfIcons(PLAYGROUND_ICONS),
    provideAlerts(),
    provideAlertConfirm(),
  ],
};
