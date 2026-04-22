import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';

import { ResetPasswordViewModel } from './reset-password.view-model';
import { Translate } from '../../../../core/services/translate';
import { MatchValidators } from '../../../../shared/validators/match.validator';
import { PatternValidators } from '../../../../shared/validators/pattern.validator';
import { Button } from '../../../../shared/components/button/button';
import { Spinner } from '../../../../shared/components/spinner/spinner';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, LucideAngularModule, Button, Spinner],
  providers: [ResetPasswordViewModel],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.scss',
})
export class ResetPassword implements OnInit {

  readonly vm        = inject(ResetPasswordViewModel);
  readonly translate = inject(Translate);

  private readonly _fb     = inject(FormBuilder);
  private readonly _route  = inject(ActivatedRoute);
  private readonly _router = inject(Router);

  /** Token read from query params — null if missing */
  _token: string | null = null;

  showPassword        = false;
  showConfirmPassword = false;

  resetForm = this._fb.group({
    newPassword:     ['', [Validators.required, Validators.minLength(8), PatternValidators.strongPassword]],
    confirmPassword: ['', [Validators.required]],
  }, { validators: [MatchValidators.password('newPassword', 'confirmPassword')] });

  ngOnInit(): void {
    this._token = this._route.snapshot.queryParamMap.get('token');
  }

  get newPasswordError(): string {
    const control = this.resetForm.get('newPassword');
    if (control?.touched && control?.errors) {
      if (control.errors['required'])              return this.translate.get('common.errors.required');
      if (control.errors['minlength'])             return this.translate.get('auth.resetPassword.errorMinLength');
      if (control.errors['invalidPasswordPattern']) return this.translate.get('common.errors.invalid-password');
    }
    return '';
  }

  get confirmPasswordError(): string {
    const control = this.resetForm.get('confirmPassword');
    if (control?.touched && control?.errors) {
      if (control.errors['required'])         return this.translate.get('common.errors.required');
      if (control.errors['passwordMismatch']) return this.translate.get('auth.resetPassword.errorMismatch');
    }
    return '';
  }

  _togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  _toggleConfirmPassword(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  _onSubmit(): void {
    if (this.resetForm.invalid) {
      this.resetForm.markAllAsTouched();
      return;
    }
    const { newPassword } = this.resetForm.value;
    this.vm.reset(this._token!, newPassword!);
  }

  _navigateToLogin(): void {
    this._router.navigate(['/auth/login']);
  }
}
