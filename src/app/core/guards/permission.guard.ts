import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

type PermissionMode = 'any' | 'all';

export const permissionGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.hasValidToken()) {
    router.navigate(['/auth/login']);
    return false;
  }
  
  const required = (route.data?.['permissions'] as string[] | undefined) ?? [];
  const mode = (route.data?.['permissionMode'] as PermissionMode | undefined) ?? 'any';

  if (!required.length) return true;

  const ok =
    mode === 'all'
      ? required.every(p => auth.hasPermission(p))
      : auth.hasAnyPermission(required);

  if (ok) return true;

  router.navigate(['/features/unauthorized']); 
  return false;
};
