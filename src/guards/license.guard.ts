import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { SoftwareLicenseService } from '../services/software-license.service';

export const licenseGuard: CanActivateFn = () => {
  const licenseService = inject(SoftwareLicenseService);
  const router = inject(Router);

  if (licenseService.isLicenseActive()) {
    return true;
  }

  return router.createUrlTree(['/support']);
};
