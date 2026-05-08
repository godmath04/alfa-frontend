import { Injectable, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { timeout } from 'rxjs';

import { AuthService } from '../../../../core/services/auth/auth';

@Injectable()
export class ForgotPasswordViewModel {
  private readonly _authService = inject(AuthService);
  private readonly _destroyRef = inject(DestroyRef);

  readonly loading = signal<boolean>(false);
  readonly submitted = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  sendLink(email: string): void {
    this.loading.set(true);
    this.error.set(null);

    this._authService
      .forgotPassword(email)
      .pipe(timeout(10000), takeUntilDestroyed(this._destroyRef))
      .subscribe({
        // Always show success for security (don't reveal if email exists)
        next: () => {
          this.loading.set(false);
          this.submitted.set(true);
        },
        error: (raw) => {
          this.loading.set(false);
          if (raw.name === 'TimeoutError') {
            this.error.set('auth.forgotPassword.errorMessage');
          } else {
            // Still show success for 404/400 (email not found) — security best practice
            // Only show error for network failures (status 0 or 5xx)
            if (raw.status === 0 || raw.status >= 500) {
              this.error.set('auth.forgotPassword.errorMessage');
            } else {
              this.submitted.set(true);
            }
          }
        },
      });
  }
}
