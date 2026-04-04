import { Component, DestroyRef, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LucideAngularModule } from 'lucide-angular';

import { AuthViewModel } from '../../../../core/services/auth/auth.view-model';
import { Translate } from '../../../../core/services/translate';
import { DocumentValidators } from '../../../../shared/validators/document.validator';
import { MatchValidators } from '../../../../shared/validators/match.validator';
import { PatternValidators } from '../../../../shared/validators/pattern.validator';
import { Button } from '../../../../shared/components/button/button';
import { Spinner } from '../../../../shared/components/spinner/spinner';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, LucideAngularModule, Button, Spinner],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register {

  readonly vm        = inject(AuthViewModel);
  readonly translate = inject(Translate);

  private readonly _fb         = inject(FormBuilder);
  private readonly _destroyRef = inject(DestroyRef);

  isSubmitted = false;
  showPassword = false;
  showConfirmPassword = false;

  days: number[] = Array.from({ length: 31 }, (_, i) => i + 1);
  months = [
    { value: '01', name: 'Enero' },  { value: '02', name: 'Febrero' },
    { value: '03', name: 'Marzo' },  { value: '04', name: 'Abril' },
    { value: '05', name: 'Mayo' },   { value: '06', name: 'Junio' },
    { value: '07', name: 'Julio' },  { value: '08', name: 'Agosto' },
    { value: '09', name: 'Septiembre' }, { value: '10', name: 'Octubre' },
    { value: '11', name: 'Noviembre' },  { value: '12', name: 'Diciembre' },
  ];
  years: number[] = (() => {
    const current = new Date().getFullYear();
    return Array.from({ length: 101 }, (_, i) => current - i);
  })();

  cities = ['Ibarra', 'Atuntaqui', 'Otavalo', 'Cotacachi', 'Quito', 'Guayaquil', 'Cuenca'];

  features = [
    { icon: 'check-circle-2', titleKey: 'auth.register.feature.secure.title', descKey: 'auth.register.feature.secure.desc' },
    { icon: 'check-circle-2', titleKey: 'auth.register.feature.access.title', descKey: 'auth.register.feature.access.desc' },
    { icon: 'check-circle-2', titleKey: 'auth.register.feature.care.title',   descKey: 'auth.register.feature.care.desc'   },
  ];

  registerForm = this._fb.group({
    firstName:       ['', Validators.required],
    lastName:        ['', Validators.required],
    email:           ['', [Validators.required, Validators.email]],
    password:        ['', [Validators.required, Validators.minLength(8), PatternValidators.strongPassword]],
    confirmPassword: ['', Validators.required],
    phone:           ['', [Validators.required, PatternValidators.phoneEcuador]],
    idType:          ['', Validators.required],
    idNumber:        ['', Validators.required],
    birthDay:        ['', Validators.required],
    birthMonth:      ['', Validators.required],
    birthYear:       ['', Validators.required],
    city:            ['', Validators.required],
    gender:          ['', Validators.required],
    acceptTerms:     [false, Validators.requiredTrue],
    acceptData:      [false, Validators.requiredTrue],
  }, { validators: [MatchValidators.password('password', 'confirmPassword')] });

  constructor() {
    this.registerForm.get('idType')?.valueChanges
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe((type) => {
        const idControl = this.registerForm.get('idNumber');
        idControl?.setValue('');
        idControl?.markAsUntouched();
        if (type === 'cedula') {
          idControl?.setValidators([Validators.required, DocumentValidators.cedula]);
        } else if (type === 'passport') {
          idControl?.setValidators([Validators.required, DocumentValidators.pasaporte]);
        } else {
          idControl?.setValidators([Validators.required]);
        }
        idControl?.updateValueAndValidity();
      });

    this.registerForm.get('birthMonth')?.valueChanges
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe(() => this._updateDaysInMonth());

    this.registerForm.get('birthYear')?.valueChanges
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe(() => this._updateDaysInMonth());
  }

  getFieldError(fieldName: string): string | boolean {
    const control = this.registerForm.get(fieldName);
    if (!this.isSubmitted || !control?.errors) return false;

    const errorTranslations: Record<string, string> = {
      email:                  'common.errors.invalid-email',
      minlength:              'common.errors.min-password',
      invalidPasswordPattern: 'common.errors.invalid-password',
      passwordMismatch:       'auth.register.errors.password-mismatch',
      invalidPhonePattern:    'common.errors.invalid-phone',
      invalidCedula:          'auth.register.errors.invalid-cedula',
      invalidPassport:        'auth.register.errors.invalid-passport',
    };

    const firstErrorKey = Object.keys(control.errors)[0];
    if (errorTranslations[firstErrorKey]) {
      return this.translate.get(errorTranslations[firstErrorKey]);
    }
    return true;
  }

  _togglePassword(): void        { this.showPassword = !this.showPassword; }
  _toggleConfirmPassword(): void { this.showConfirmPassword = !this.showConfirmPassword; }

  _onSubmit(): void {
    this.isSubmitted = true;
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    const { firstName, lastName, email, password, phone, idType, idNumber,
            birthDay, birthMonth, birthYear, city, gender } = this.registerForm.value;

    const birthDate = `${birthYear}-${birthMonth}-${birthDay!.toString().padStart(2, '0')}`;

    this.vm.register({
      firstName: firstName!, lastName: lastName!, email: email!,
      password: password!, phone: phone!, idType: idType!,
      idNumber: idNumber!, birthDate, city: city!, gender: gender!,
    });
  }

  private _updateDaysInMonth(): void {
    const year  = this.registerForm.get('birthYear')?.value;
    const month = this.registerForm.get('birthMonth')?.value;
    if (year && month) {
      const daysCount = new Date(parseInt(year), parseInt(month), 0).getDate();
      this.days = Array.from({ length: daysCount }, (_, i) => i + 1);
      const currentDay = this.registerForm.get('birthDay')?.value;
      if (currentDay && parseInt(currentDay) > daysCount) {
        this.registerForm.get('birthDay')?.setValue('');
      }
    }
  }
}
