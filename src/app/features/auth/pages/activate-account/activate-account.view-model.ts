import { Injectable, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { timeout } from 'rxjs';

import { AuthService } from '../../../../core/services/auth/auth';
import { toApiError } from '../../../../core/models/api-error.model';

@Injectable()
export class ActivateAccountViewModel {

  private readonly _authService = inject(AuthService);
  private readonly _router      = inject(Router);
  private readonly _destroyRef  = inject(DestroyRef);

  readonly loading = signal<boolean>(false);
  readonly success = signal<boolean>(false);
  readonly error   = signal<string | null>(null);

  activate(token: string, password: string): void {
    this.loading.set(true);
    this.error.set(null);

    this._authService.activateAccount(token, password)
      .pipe(timeout(10000), takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: () => {
          // Endpoint does not return a JWT — just signal success and redirect
          this.loading.set(false);
          this.success.set(true);
        },
        error: (raw) => {
          const err = toApiError(raw);
          this.loading.set(false);
          if (raw.name === 'TimeoutError') {
            this.error.set('La solicitud tardó demasiado. Intenta nuevamente.');
          } else {
            this.error.set(err.error.message ?? 'Ocurrió un error al activar tu cuenta. Intenta nuevamente.');
          }
        }
      });
  }

  goToLogin(): void {
    this._router.navigate(['/auth/login']);
  }
}
