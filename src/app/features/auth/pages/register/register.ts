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
        Validators.pattern(/(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])/)
      ]],
      confirmPassword: ['', Validators.required],
      phone: ['', [Validators.required, Validators.minLength(10)]],
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
    });
    this.registerForm.get('birthMonth')?.valueChanges.subscribe(() => {
      this.updateDaysInMonth();
    });
    this.registerForm.get('birthYear')?.valueChanges.subscribe(() => {
      this.updateDaysInMonth();
    })
  }

  //Getter de validación del email en el register form
  get emailError(): string{
    const control = this.registerForm.get('email');
    if (this.isSubmitted && control?.errors) {
      if (control.errors['required']) return this._translate.get('common.errors.required');
      if (control.errors['email']) return this._translate.get('common.errors.invalid-email')
    }
    return "";
  }

  //Getter de validación de nombres
  get firstNameError(): string{
    const control = this.registerForm.get('firstName');
    return (this.isSubmitted && control?.errors?.['required']) ? this._translate.get('common.errors.required') : '';
  }

  get lastNameError(): string{
    const control = this.registerForm.get('lastName');
    return (this.isSubmitted && control?.errors?.['required']) ? this._translate.get('common.errors.required') : '';
  }

  get passwordError(): string {
    const control = this.registerForm.get('password');
    if (this.isSubmitted && control?.errors) {
      if (control.errors['required']) return this._translate.get('common.errors.required');
      if (control.errors['minlength']) return this._translate.get('common.errors.min-password');
      if (control.errors['pattern']) return this._translate.get('common.errors.invalid-password');
    }
    return '';
  }

  get confirmPasswordError(): string {
    const control = this.registerForm.get('confirmPassword');
    return (this.isSubmitted && control?.errors?.['required']) ? this._translate.get('common.errors.required') : '';
  }

  get phoneError(): string {
    const control = this.registerForm.get('phone');
    if (this.isSubmitted && control?.errors) {
      if (control.errors['required']) return this._translate.get('common.errors.required');
      if (control.errors['minlength'] || control.errors['pattern']) return this._translate.get('common.errors.invalid-phone');
    }
    return '';
  }

  get idTypeError(): string {
    const control = this.registerForm.get('idType');
    return (this.isSubmitted && control?.errors?.['required']) ? this._translate.get('common.errors.required') : '';
  }

  get idNumberError(): string {
    const control = this.registerForm.get('idNumber');
    return (this.isSubmitted && control?.errors?.['required']) ? this._translate.get('common.errors.required') : '';
  }

  get genderError(): string {
    const control = this.registerForm.get('gender');
    return (this.isSubmitted && control?.errors?.['required']) ? this._translate.get('common.errors.required') : '';
  }

  get cityError(): string {
    const control = this.registerForm.get('city');
    return (this.isSubmitted && control?.errors?.['required']) ? this._translate.get('common.errors.required') : '';
  }

  get birthDateError(): string {
    const day = this.registerForm.get('birthDay');
    const month = this.registerForm.get('birthMonth');
    const year = this.registerForm.get('birthYear');
    if (this.isSubmitted && (day?.errors || month?.errors || year?.errors)) {
      return this._translate.get('common.errors.required');
    }
    return '';
  }
  
  get acceptTermsError(): string {
    const control = this.registerForm.get('acceptTerms');
    return (this.isSubmitted && control?.errors?.['required']) ? this._translate.get('common.errors.required') : '';
  }

  get acceptDataError(): string {
    const control = this.registerForm.get('acceptData');
    return (this.isSubmitted && control?.errors?.['required']) ? this._translate.get('common.errors.required') : '';
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
