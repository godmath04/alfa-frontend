import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth } from '../../../../core/services/auth/auth';
import { Translate } from '../../../../core/services/translate';
import { timeout } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  loginForm: FormGroup;
  isLoading: boolean = false;
  errorMessage: string = '';
  showPassword: boolean = false;
  translate: Translate;

  features = [
    {
      icon: 'user',
      titleKey: 'auth.login.feature.patient.title',
      descKey: 'auth.login.feature.patient.desc',
    },
    {
      icon: 'stethoscope',
      titleKey: 'auth.login.feature.doctor.title',
      descKey: 'auth.login.feature.doctor.desc',
    },
    {
      icon: 'bar-chart-3',
      titleKey: 'auth.login.feature.admin.title',
      descKey: 'auth.login.feature.admin.desc',
    },
  ];

  constructor(
    private _fb: FormBuilder,
    private _auth: Auth,
    private _router: Router,
    private _translate: Translate,
  ) {
    this.translate = this._translate;
    this.loginForm = this._fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      rememberMe: [false],
    });
  }

  get emailError(): string {
    const control = this.loginForm.get('email');
    if (control?.touched && control?.errors) {
      if (control.errors['required']) return this._translate.get('common.errors.required');
      if (control.errors['email']) return this._translate.get('common.errors.invalid-email');
    }
    return '';
  }

  get passwordError(): string {
    const control = this.loginForm.get('password');
    if (control?.touched && control?.errors) {
      if (control.errors['required']) return this._translate.get('common.errors.required');
      if (control.errors['minlength']) return this._translate.get('common.errors.min-password');
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

    this.isLoading = true;
    this.errorMessage = '';

    const { email, password } = this.loginForm.value;

    this._auth
      .login(email, password)
      .pipe(timeout(10000))
      .subscribe({
        next: () => {
          this.isLoading = false;
          this._redirectByRole(this._auth.getUserRole());
        },
        error: (err) => {
          this.isLoading = false;
          if (err.name === 'TimeoutError') {
            this.errorMessage = 'La solicitud tardó demasiado. Intenta nuevamente.';
          } else {
            this.errorMessage = err.error?.message || 'Error al iniciar sesión';
          }
        },
      });
  }

  private _redirectByRole(role: string | null): void {
    switch (role) {
      case 'PACIENTE':
        this._router.navigate(['/paciente']);
        break;
      case 'MEDICO':
        this._router.navigate(['/medico']);
        break;
      case 'EJECUTIVO':
        this._router.navigate(['/ejecutivo']);
        break;
      case 'ADMINISTRADOR':
        this._router.navigate(['/admin']);
        break;
      case 'GERENCIA':
        this._router.navigate(['/gerencia']);
        break;
      default:
        this._router.navigate(['/auth/login']);
        break;
    }
  }
}
