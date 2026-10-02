import {
  ApplicationConfig,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
  inject,
} from '@angular/core';

import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { OwnerProfileService } from '../services/owner.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),

    provideAppInitializer(() => {
      const ownerService = inject(OwnerProfileService);

      return ownerService.loadProfile();
    }),
  ],
};
