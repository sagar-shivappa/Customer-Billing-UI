import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthorizationService } from '../services/authorization.service';

export const ownerAuthGuard: CanActivateFn = () => {
  const authorizationService = inject(AuthorizationService);
  const router = inject(Router);

  if (authorizationService.authorized()) {
    return true;
  }

  return router.createUrlTree(['/']);
};
