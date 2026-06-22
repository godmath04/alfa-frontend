import { Component, OnInit, inject, effect, DestroyRef } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LucideAngularModule } from 'lucide-angular';

import { ProfileViewModel } from '../../profile.view-model';
import { Translate } from '../../../../core/services/translate';
import { Button } from '../../../../shared/components/button/button';
import { Spinner } from '../../../../shared/components/spinner/spinner';
import { PatternValidators } from '../../../../shared/validators/pattern.validator';
import { MONTHS_FULL } from '../../../../shared/utils/date-time.utils';

/** Group-level validator: assembled birth date must be today or in the past. */
function birthDateNotFutureValidator(group: AbstractControl): ValidationErrors | null {
  const day   = group.get('birthDay')?.value;
  const month = group.get('birthMonth')?.value;
  const year  = group.get('birthYear')?.value;
  if (!day || !month || !year) return null;
  const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date <= today ? null : { birthDateFuture: true };
}

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [ReactiveFormsModule, LucideAngularModule, Button, Spinner],
  templateUrl: './profile-page.html',
  styleUrl: './profile-page.scss'
})
export class ProfilePage implements OnInit {
  private readonly _fb         = inject(FormBuilder);
  private readonly _destroyRef = inject(DestroyRef);
  readonly vm        = inject(ProfileViewModel);
  readonly translate = inject(Translate);

  // ── Form state ────────────────────────────────────────────────────────────
  isSubmitted = false;
  days: number[] = Array.from({ length: 31 }, (_, i) => i + 1);
  readonly months = MONTHS_FULL;
  years: number[] = (() => {
    const current = new Date().getFullYear();
    return Array.from({ length: 101 }, (_, i) => current - i);
  })();

  cities = ['Ibarra', 'Atuntaqui', 'Otavalo', 'Cotacachi', 'Quito', 'Guayaquil', 'Cuenca'];

  // ── Form definition ────────────────────────────────────────────────────────
  readonly profileForm = this._fb.group({
    // Read-only fields (disabled — not submitted)
    email:    [{ value: '', disabled: true }],
    idType:   [{ value: '', disabled: true }],
    idNumber: [{ value: '', disabled: true }],

    // Editable required fields
    firstName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
    lastName:  ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
    phone:     ['', [Validators.required, PatternValidators.phoneEcuador]],
    gender:    ['', Validators.required],
    city:      ['', Validators.required],

    // Birth date as three separate selects (same UX as register)
    birthDay:   ['', Validators.required],
    birthMonth: ['', Validators.required],
    birthYear:  ['', Validators.required],
  }, { validators: [birthDateNotFutureValidator] });

  constructor() {
    // Sync days-in-month when month/year change
    this.profileForm.get('birthMonth')?.valueChanges
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe(() => this._updateDaysInMonth());

    this.profileForm.get('birthYear')?.valueChanges
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe(() => this._updateDaysInMonth());

    // Populate form when profile data arrives from the ViewModel
    effect(() => {
      const profile = this.vm.profile();
      if (!profile) return;

      // Parse 'YYYY-MM-DD' or 'DD/MM/YYYY' from backend
      let day = '', month = '', year = '';
      if (profile.birthDate) {
        // Support both ISO (YYYY-MM-DD) and display (DD/MM/YYYY) formats
        const iso = profile.birthDate.includes('-')
          ? profile.birthDate
          : profile.birthDate.split('/').reverse().join('-');
        const parts = iso.split('-');
        if (parts.length === 3) {
          year  = parts[0];
          month = parts[1].padStart(2, '0');
          day   = String(parseInt(parts[2], 10)); // remove leading zero for select match
        }
      }

      this.profileForm.patchValue({
        email:      profile.email,
        idType:     profile.idType,
        idNumber:   profile.idNumber,
        firstName:  profile.firstName,
        lastName:   profile.lastName,
        phone:      profile.phone,
        gender:     profile.gender,
        city:       profile.city,
        birthYear:  year,
        birthMonth: month,
        birthDay:   day,
      });
    });
  }

  ngOnInit(): void {
    this.vm.loadProfile();
  }

  // ── Error helper (same pattern as register) ────────────────────────────────
  getFieldError(fieldName: string): string | boolean {
    const control = this.profileForm.get(fieldName);
    // Show errors only after first submit attempt (same UX as register)
    if (!this.isSubmitted || !control?.errors) return false;

    const errorMap: Record<string, string> = {
      required:           'common.errors.required',
      minlength:          'common.errors.min-length',
      maxlength:          'common.errors.max-length',
      invalidPhonePattern:'common.errors.invalid-phone',
      notPastDate:        'profile.errors.notPastDate',
    };

    const firstKey = Object.keys(control.errors)[0];
    return errorMap[firstKey]
      ? this.translate.get(errorMap[firstKey])
      : true;
  }

  get idTypeLabel(): string {
    const val = this.profileForm.get('idType')?.value;
    if (val === 'cedula') return 'Cédula';
    if (val === 'passport') return 'Pasaporte';
    return val ?? '';
  }

  /** Returns error for the birth date section (required fields OR future date). */
  get birthDateError(): string | boolean {
    if (!this.isSubmitted) return false;
    // First check individual required errors
    const required =
      this.getFieldError('birthDay') ||
      this.getFieldError('birthMonth') ||
      this.getFieldError('birthYear');
    if (required) return required;
    // Then check the group-level future-date error
    if (this.profileForm.errors?.['birthDateFuture']) {
      return this.translate.get('profile.errors.notPastDate');
    }
    return false;
  }

  // ── Actions ────────────────────────────────────────────────────────────────
  _onSubmit(): void {
    this.isSubmitted = true;           // Reveal all validation errors
    this.profileForm.markAllAsTouched();
    if (this.profileForm.invalid) return;

    const v = this.profileForm.value;
    const birthDate = `${v.birthYear}-${v.birthMonth}-${v.birthDay!.toString().padStart(2, '0')}`;
    this.vm.updateProfile(
      {
        firstName: v.firstName!,
        lastName:  v.lastName!,
        phone:     v.phone!,
        city:      v.city!,
        gender:    v.gender!,
        birthDate
      },
      () => alert(this.translate.get('profile.successMessage')),
      () => alert(this.translate.get('profile.errorMessage'))
    );
  }

  _onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.vm.uploadPhoto(input.files[0]);
    }
  }

  _triggerFileInput(): void {
    document.getElementById('photoInput')?.click();
  }

  private _updateDaysInMonth(): void {
    const year  = this.profileForm.get('birthYear')?.value;
    const month = this.profileForm.get('birthMonth')?.value;
    if (year && month) {
      const daysCount = new Date(parseInt(year), parseInt(month), 0).getDate();
      this.days = Array.from({ length: daysCount }, (_, i) => i + 1);
      const currentDay = this.profileForm.get('birthDay')?.value;
      if (currentDay && parseInt(currentDay) > daysCount) {
        this.profileForm.get('birthDay')?.setValue('');
      }
    }
  }
}
