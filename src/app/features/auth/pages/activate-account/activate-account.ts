import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';

import { Translate } from '../../../../core/services/translate';
import { AuthService } from '../../../../core/services/auth/auth';
import { AuthStateService } from '../../../../core/services/auth/auth.state';

@Component({
  selector: 'app-activate-account',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './activate-account.html',
  styleUrl: './activate-account.scss',
})
export class ActivateAccountPage {

  readonly t = inject(Translate);
  private readonly _auth      = inject(AuthService);
  private readonly _authState = inject(AuthStateService);
  private readonly _router    = inject(Router);
  private readonly _route     = inject(ActivatedRoute);

  readonly _email    = signal(this._route.snapshot.queryParamMap.get('email') ?? '');
  readonly _password = signal('');
  readonly _confirm  = signal('');
  readonly _showPass = signal(false);
  readonly _loading  = signal(false);
  readonly _error    = signal<string | null>(null);

  _togglePass(): void { this._showPass.update(v => !v); }

  _submit(): void {
    const password = this._password().trim();
    const confirm  = this._confirm().trim();

    if (password.length < 6) {
      this._error.set(this.t.get('auth.activate.error-length')); return;
    }
    if (password !== confirm) {
      this._error.set(this.t.get('auth.activate.error-match')); return;
    }

    this._loading.set(true);
    this._error.set(null);

    this._auth.activateAccount(this._email(), password).subscribe({
      next: response => {
        this._authState.setSession(response.token, response.role);
        this._loading.set(false);
        this._router.navigate(['/paciente']);
      },
      error: () => {
        this._loading.set(false);
        this._error.set(this.t.get('auth.activate.error-generic'));
      },
    });
  }
}
