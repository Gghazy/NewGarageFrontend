import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { APP_ROUTES, PERMISSION_MODE, PermissionMode } from '../constants/app.constants';

export const permissionGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.hasValidToken()) {
    router.navigate([APP_ROUTES.AUTH_LOGIN]);
    return false;
  }

  const required = (route.data?.['permissions'] as string[] | undefined) ?? [];
  const mode = (route.data?.['permissionMode'] as PermissionMode | undefined) ?? PERMISSION_MODE.ANY;

  if (!required.length) return true;

  const ok =
    mode === PERMISSION_MODE.ALL
      ? required.every(p => auth.hasPermission(p))
      : auth.hasAnyPermission(required);

  if (ok) return true;

  router.navigate([APP_ROUTES.UNAUTHORIZED]);
  return false;
};
