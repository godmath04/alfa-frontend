import { Injectable, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { timeout } from 'rxjs';

import { AuthService } from './auth';
import { AuthStateService } from './auth.state';
import { RegisterRequest } from '../../models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthViewModel {

  private readonly _authService = inject(AuthService);
  private readonly _authState   = inject(AuthStateService);
  private readonly _router      = inject(Router);
  private readonly _destroyRef  = inject(DestroyRef);

  readonly loading         = signal<boolean>(false);
  readonly loginError      = signal<string | null>(null);
  readonly registerErrors  = signal<string[]>([]);
  readonly registerSuccess = signal<boolean>(false);

  login(email: string, password: string): void {
    this.loading.set(true);
    this.loginError.set(null);

    this._authService.login(email, password)
      .pipe(timeout(10000), takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: (response) => {
          this._authState.setSession(response.token, response.role);
          this.loading.set(false);
          this._redirectByRole(response.role);
        },
        error: (err) => {
          this.loading.set(false);
          if (err.name === 'TimeoutError') {
            this.loginError.set('La solicitud tardó demasiado. Intenta nuevamente.');
          } else {
            this.loginError.set(err.error?.message || 'Error al iniciar sesión');
          }
        }
      });
  }

  register(data: RegisterRequest): void {
    this.loading.set(true);
    this.registerErrors.set([]);

    this._authService.register(data)
      .pipe(timeout(10000), takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: () => {
          this.loading.set(false);
          this.registerSuccess.set(true);
          setTimeout(() => this._router.navigate(['/auth/login']), 2000);
        },
        error: (err) => {
          this.loading.set(false);
          if (err.name === 'TimeoutError') {
            this.registerErrors.set(['La solicitud tardó demasiado. Intenta nuevamente.']);
          } else {
            this.registerErrors.set([err.error?.message || 'Error al crear la cuenta']);
          }
        }
      });
  }

  logout(): void {
    this._authService.logout()
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next:  () => this._authState.clearSession(),
        error: () => this._authState.clearSession()
      });
    this._router.navigate(['/auth/login']);
  }

  private _redirectByRole(role: string): void {
    switch (role) {
      case 'PACIENTE':      this._router.navigate(['/paciente']);   break;
      case 'MEDICO':        this._router.navigate(['/medico']);     break;
      case 'EJECUTIVO':     this._router.navigate(['/ejecutivo']); break;
      case 'ADMINISTRADOR': this._router.navigate(['/admin']);     break;
      case 'GERENCIA':      this._router.navigate(['/gerencia']);  break;
      default:              this._router.navigate(['/auth/login']); break;
    }
  }
}
