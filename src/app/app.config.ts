import {
  ApplicationConfig,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
  inject,
} from '@angular/core';
import { provideNativeDateAdapter } from '@angular/material/core';

import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { OwnerProfileService } from '../services/owner.service';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { apiInterceptor } from '../interceptors/api.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideNativeDateAdapter(),

    provideHttpClient(withInterceptors([apiInterceptor])),

    provideAppInitializer(() => {
      const ownerService = inject(OwnerProfileService);

      return ownerService.loadProfile();
    }),
  ],
};
