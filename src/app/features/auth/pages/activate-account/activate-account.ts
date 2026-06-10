import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';

import { Translate } from '../../../../core/services/translate';
import { MatchValidators } from '../../../../shared/validators/match.validator';
import { PatternValidators } from '../../../../shared/validators/pattern.validator';
import { ActivateAccountViewModel } from './activate-account.view-model';

@Component({
  selector: 'app-activate-account',
  standalone: true,
  imports: [ReactiveFormsModule, LucideAngularModule],
  providers: [ActivateAccountViewModel],
  templateUrl: './activate-account.html',
  styleUrl: './activate-account.scss',
})
export class ActivateAccountPage implements OnInit {

  readonly vm = inject(ActivateAccountViewModel);
  readonly t  = inject(Translate);

  private readonly _fb    = inject(FormBuilder);
  private readonly _route = inject(ActivatedRoute);

  // Presentation-only signals
  readonly _token    = signal<string | null>(null);
  readonly _showPass = signal(false);

  // Reactive form — same validators as register & reset-password
  readonly activateForm = this._fb.group({
    password:        ['', [Validators.required, Validators.minLength(8), PatternValidators.strongPassword]],
    confirmPassword: ['', [Validators.required]],
  }, { validators: [MatchValidators.password('password', 'confirmPassword')] });

  ngOnInit(): void {
    const token = this._route.snapshot.queryParamMap.get('token');
    this._token.set(token);

    // No token in URL — invalid link, redirect immediately
    if (!token) {
      this.vm.goToLogin();
    }
  }

  _togglePass(): void { this._showPass.update(v => !v); }

  /** Returns the translated error string for the password field, or empty string */
  get passwordError(): string {
    const ctrl = this.activateForm.get('password');
    if (!ctrl?.touched || !ctrl.errors) return '';
    if (ctrl.errors['required'])              return this.t.get('common.errors.required');
    if (ctrl.errors['minlength'])             return this.t.get('common.errors.min-password');
    if (ctrl.errors['invalidPasswordPattern']) return this.t.get('common.errors.invalid-password');
    return '';
  }

  /** Returns the translated error string for the confirm-password field, or empty string */
  get confirmError(): string {
    const ctrl = this.activateForm.get('confirmPassword');
    if (!ctrl?.touched || !ctrl.errors) return '';
    if (ctrl.errors['required'])         return this.t.get('common.errors.required');
    if (ctrl.errors['passwordMismatch']) return this.t.get('auth.activate.error-match');
    return '';
  }

  _submit(): void {
    if (this.activateForm.invalid) {
      this.activateForm.markAllAsTouched();
      return;
    }

    const token    = this._token();
    const password = this.activateForm.value.password!;

    if (!token) return; // guard — already handled in ngOnInit

    this.vm.activate(token, password);
  }
}
