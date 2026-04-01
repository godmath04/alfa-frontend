import { Component, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth } from '../../../../core/services/auth/auth';
import { Translate } from '../../../../core/services/translate';
import { timeout } from 'rxjs';
import { DocumentValidators } from '../../../../shared/validators/document.validator';
import { MatchValidators } from '../../../../shared/validators/match.validator';
import { PatternValidators } from '../../../../shared/validators/pattern.validator';

@Component({
  selector: 'app-register',
  standalone: false,
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register {
  registerForm: FormGroup;
  isLoading: boolean = false;
  isSubmitted: boolean = false;
  success: boolean = false;
  errors: string[] = [];
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;
  translate: Translate;

  //Data for date selector
  days: number[] = Array.from({ length: 31 }, (_, i) => i + 1);
  months: { value: string, name: string }[] = [
    { value: '01', name: 'Enero' }, { value: '02', name: 'Febrero' },
    { value: '03', name: 'Marzo' }, { value: '04', name: 'Abril' },
    { value: '05', name: 'Mayo' }, { value: '06', name: 'Junio' },
    { value: '07', name: 'Julio' }, { value: '08', name: 'Agosto' },
    { value: '09', name: 'Septiembre' }, { value: '10', name: 'Octubre' },
    { value: '11', name: 'Noviembre' }, { value: '12', name: 'Diciembre' }
  ];
  years: number[] = [];


  //List of cities
  cities: string[] = ['Ibarra', 'Atuntaqui', 'Otavalo', 'Cotacachi', 'Quito', 'Guayaquil', 'Cuenca'];

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

    const currentYear = new Date().getFullYear();
    for (let i = currentYear; i >= currentYear - 100; i--) {
      this.years.push(i);
    }

    this.registerForm = this._fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        PatternValidators.strongPassword
      ]],
      confirmPassword: ['', Validators.required],
      phone: ['', [Validators.required, PatternValidators.phoneEcuador]],
      idType: ['', Validators.required],
      idNumber: ['', Validators.required],
      //birthDate: ['', Validators.required],
      birthDay: ['', Validators.required],
      birthMonth: ['', Validators.required],
      birthYear: ['', Validators.required],
      city: ['', Validators.required],
      gender: ['', Validators.required],
      acceptTerms: [false, Validators.requiredTrue],
      acceptData: [false, Validators.requiredTrue],
    }, {
      validators: [MatchValidators.password('password', 'confirmPassword')]
    });
    this.registerForm.get('idType')?.valueChanges.subscribe((type) => {
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

    this.registerForm.get('birthMonth')?.valueChanges.subscribe(() => {
      this.updateDaysInMonth();
    });
    this.registerForm.get('birthYear')?.valueChanges.subscribe(() => {
      this.updateDaysInMonth();
    })
  }

  /**
   * Dynamic method to get the error of any field.
   * Eliminates the need for 13 different "getters".
   */
  getFieldError(fieldName: string): string | boolean {
    const control = this.registerForm.get(fieldName);
    
    // If the form has not been submitted or the control has no errors, do not show visual block
    if (!this.isSubmitted || !control?.errors) {
      return false;
    }

    // The control has errors. We take the first error key found.
    const errorKeys = Object.keys(control.errors);
    const firstErrorKey = errorKeys[0];

    // Translation dictionary mapping ErrorName -> TranslationKey
    const errorTranslations: Record<string, string> = {
      email: 'common.errors.invalid-email',
      minlength: 'common.errors.min-password',
      invalidPasswordPattern: 'common.errors.invalid-password',
      passwordMismatch: 'auth.register.errors.password-mismatch',
      invalidPhonePattern: 'common.errors.invalid-phone',
      invalidCedula: 'auth.register.errors.invalid-cedula',
      invalidPassport: 'auth.register.errors.invalid-passport',
    };

    // If the error (e.g., 'invalidPasswordPattern') is in the dictionary, return its translation
    if (errorTranslations[firstErrorKey]) {
      return this._translate.get(errorTranslations[firstErrorKey]);
    }

    // If it is a generic error like 'required', simply return true 
    // to trigger red borders or visual states in the HTML.
    return true;
  }

  updateDaysInMonth(): void {
    const year = this.registerForm.get('birthYear')?.value;
    const month = this.registerForm.get('birthMonth')?.value;

    // Only calculate if the user has already selected both a month and a year
    if (year && month) {
      // new Date(year, month, 0) returns the last day of the specified month.
      // parseInt() ensures the string value (e.g., '01') is treated as a number.
      const daysCount = new Date(parseInt(year), parseInt(month), 0).getDate();

      // Regenerate the days array with the exact count for that month
      this.days = Array.from({ length: daysCount }, (_, i) => i + 1);

      // Safety check: If the user previously selected day 31 and then switches 
      // to February, 31 becomes invalid. Reset the day field in such cases.
      const currentDay = this.registerForm.get('birthDay')?.value;
      if (currentDay && parseInt(currentDay) > daysCount) {
        this.registerForm.get('birthDay')?.setValue('');
      }
    }
  }


  _togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  _toggleConfirmPassword(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  _onSubmit(): void {
    this.isSubmitted = true;
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
      //birthDate,
      birthDay,
      birthMonth,
      birthYear,
      city,
      gender,
    } = this.registerForm.value;

    if (password !== confirmPassword) {
      this.errors = [this.translate.get('auth.register.errors.password-mismatch')];
      return;
    }

    const formattedDay = birthDay.toString().padStart(2, '0');
    const finalBirthDate = `${birthYear}-${birthMonth}-${formattedDay}`;

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
        birthDate: finalBirthDate,
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
