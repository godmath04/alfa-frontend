import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { Auth } from '../../services/auth/auth';

export const roleGuard: CanActivateFn = (route, state) => {
  const auth = inject(Auth);
  const router = inject(Router);

  if (!auth.isAuthenticated()) {
    router.navigate(['/auth/login']);
    return false;
  }

  const allowedRoles: string[] = route.data?.['roles'] ?? [];

  if (allowedRoles.length === 0) {
    return true;
  }

  const userRole = auth.getUserRole();

  if (userRole && allowedRoles.includes(userRole)) {
    return true;
  }

  router.navigate(['/auth/login']);
  return false;
};