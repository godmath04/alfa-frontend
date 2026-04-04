import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthStateService } from '../../services/auth/auth.state';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(AuthStateService).getToken();

  if (token) {
    return next(req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    }));
  }

  return next(req);
};
