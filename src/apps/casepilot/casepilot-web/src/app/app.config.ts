import { provideBrowserGlobalErrorListeners, provideZonelessChangeDetection, type ApplicationConfig } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { providePilotThemes } from '@casepilot/pilot-ui-kit';
import { CASEPILOT_THEMES } from '../theme/casepilot.theme';
import { APP_ROUTES } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(APP_ROUTES, withInMemoryScrolling({ anchorScrolling: 'enabled' })),
    providePilotThemes({ themes: CASEPILOT_THEMES, initialTheme: 'default' }),
  ],
};
