import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';

import { AuthViewModel } from '../../../../core/services/auth/auth.view-model';
import { Translate } from '../../../../core/services/translate';
import { Button } from '../../../../shared/components/button/button';
import { Spinner } from '../../../../shared/components/spinner/spinner';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, LucideAngularModule, Button, Spinner],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {

  readonly vm        = inject(AuthViewModel);
  readonly translate = inject(Translate);

  private readonly _fb = inject(FormBuilder);

  loginForm = this._fb.group({
    email:      ['', [Validators.required, Validators.email]],
    password:   ['', [Validators.required, Validators.minLength(8)]],
    rememberMe: [false],
  });

  showPassword = false;

  features = [
    { icon: 'user',        titleKey: 'auth.login.feature.patient.title', descKey: 'auth.login.feature.patient.desc' },
    { icon: 'stethoscope', titleKey: 'auth.login.feature.doctor.title',  descKey: 'auth.login.feature.doctor.desc'  },
    { icon: 'bar-chart-3', titleKey: 'auth.login.feature.admin.title',   descKey: 'auth.login.feature.admin.desc'   },
  ];

  get emailError(): string {
    const control = this.loginForm.get('email');
    if (control?.touched && control?.errors) {
      if (control.errors['required']) return this.translate.get('common.errors.required');
      if (control.errors['email'])    return this.translate.get('common.errors.invalid-email');
    }
    return '';
  }

  get passwordError(): string {
    const control = this.loginForm.get('password');
    if (control?.touched && control?.errors) {
      if (control.errors['required'])  return this.translate.get('common.errors.required');
      if (control.errors['minlength']) return this.translate.get('common.errors.min-password');
    }
    return '';
  }

  _togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  _onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    const { email, password } = this.loginForm.value;
    this.vm.login(email!, password!);
  }
}
