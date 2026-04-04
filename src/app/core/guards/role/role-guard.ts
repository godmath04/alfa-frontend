import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthStateService } from '../../services/auth/auth.state';

export const roleGuard: CanActivateFn = (route) => {
  const authState = inject(AuthStateService);
  const router    = inject(Router);

  if (!authState.isAuthenticated()) {
    router.navigate(['/auth/login']);
    return false;
  }

  const allowedRoles: string[] = route.data?.['roles'] ?? [];

  if (allowedRoles.length === 0) return true;

  if (allowedRoles.includes(authState.userRole()!)) return true;

  router.navigate(['/auth/login']);
  return false;
};
