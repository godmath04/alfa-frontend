import { Component, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth } from '../../../../core/services/auth/auth';
import { Translate } from '../../../../core/services/translate';
import { timeout } from 'rxjs';

@Component({
  selector: 'app-register',
  standalone: false,
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register {
  registerForm: FormGroup;
  isLoading: boolean = false;
  success: boolean = false;
  errors: string[] = [];
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;
  translate: Translate;

  features = [
    {
      icon: 'check-circle-2',
      titleKey: 'auth.register.feature.secure.title',
      descKey: 'auth.register.feature.secure.desc',
    },
    {
      icon: 'check-circle-2',
      titleKey: 'auth.register.feature.access.title',
      descKey: 'auth.register.feature.access.desc',
    },
    {
      icon: 'check-circle-2',
      titleKey: 'auth.register.feature.care.title',
      descKey: 'auth.register.feature.care.desc',
    },
  ];

  constructor(
    private _fb: FormBuilder,
    private _auth: Auth,
    private _router: Router,
    private _translate: Translate,
    private _cdr: ChangeDetectorRef
  ) {
    this.translate = this._translate;
    this.registerForm = this._fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required],
      phone: ['', [Validators.required, Validators.minLength(10)]],
      idType: ['cedula', Validators.required],
      idNumber: ['', Validators.required],
      birthDate: ['', Validators.required],
      city: ['', Validators.required],
      gender: ['', Validators.required],
      acceptTerms: [false, Validators.requiredTrue],
      acceptData: [false, Validators.requiredTrue],
    });
  }

  _togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  _toggleConfirmPassword(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  _onSubmit(): void {
    this.errors = [];

    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    const {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      phone,
      idType,
      idNumber,
      birthDate,
      city,
      gender,
    } = this.registerForm.value;

    if (password !== confirmPassword) {
      this.errors = [this.translate.get('auth.register.errors.password-mismatch')];
      return;
    }

    this.isLoading = true;

    this._auth
      .register({
        firstName,
        lastName,
        email,
        password,
        phone,
        idType,
        idNumber,
        birthDate,
        city,
        gender,
      })
      .pipe(timeout(10000))
      .subscribe({
        next: () => {
          this.isLoading = false;
          this.success = true;
          this._cdr.detectChanges();
          setTimeout(() => this._router.navigate(['/auth/login']), 2000);
        },
        error: (err) => {
          this.isLoading = false;
          if (err.name === 'TimeoutError') {
            this.errors = ['La solicitud tardó demasiado. Intenta nuevamente.'];
          } else {
            this.errors = [err.error?.message || 'Error al crear la cuenta'];
          }
          this._cdr.detectChanges();
        },
      });
  }
}
