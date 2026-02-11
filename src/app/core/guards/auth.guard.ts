import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (_route, state) => {
  const platformId = inject(PLATFORM_ID);
  if (!isPlatformBrowser(platformId)) return true;

  const auth = inject(AuthService);
  if (auth.hasValidToken()) return true;

  const router = inject(Router);
  const returnUrl = state?.url ?? '/features';
  return router.createUrlTree(['/auth/login'], { queryParams: { returnUrl } });
};
