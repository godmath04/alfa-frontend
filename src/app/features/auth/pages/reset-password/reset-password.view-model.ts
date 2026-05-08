import { Injectable, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';
import { timeout } from 'rxjs';

import { AuthService } from '../../../../core/services/auth/auth';

@Injectable()
export class ResetPasswordViewModel {
  private readonly _authService = inject(AuthService);
  private readonly _destroyRef = inject(DestroyRef);

  readonly loading = signal<boolean>(false);
  readonly success = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  reset(token: string, newPassword: string): void {
    this.loading.set(true);
    this.error.set(null);

    this._authService
      .resetPassword(token, newPassword)
      .pipe(timeout(10000), takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: () => {
          this.loading.set(false);
          this.success.set(true);
        },
        error: (raw) => {
          this.loading.set(false);
          if (raw.name === 'TimeoutError') {
            this.error.set('auth.resetPassword.errorGeneric');
          } else if (raw instanceof HttpErrorResponse && raw.status === 400) {
            this.error.set('auth.resetPassword.errorExpired');
          } else {
            this.error.set('auth.resetPassword.errorGeneric');
          }
        },
      });
  }
}
