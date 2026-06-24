import { Component, inject, signal, DestroyRef } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { Translate } from '../../../../core/services/translate';
import { ExecutiveService } from '../../../../core/services/ejecutivo/executive.service';
import { PacienteSearch, CrearPacienteRequest } from '../../../../core/models/executive.model';
import { MONTHS_FULL } from '../../../../shared/utils/date-time.utils';
import { DocumentValidators } from '../../../../shared/validators/document.validator';
import { PatternValidators } from '../../../../shared/validators/pattern.validator';
import { DateValidators } from '../../../../shared/validators/date.validator';
import { toApiError } from '../../../../core/models/api-error.model';

@Component({
  selector: 'app-patient-search',
  standalone: true,
  imports: [LucideAngularModule, ReactiveFormsModule],
  templateUrl: './patient-search.html',
  styleUrl: './patient-search.scss',
})
export class PatientSearchPage {

  readonly t   = inject(Translate);
  private readonly _svc    = inject(ExecutiveService);
  private readonly _router = inject(Router);
  private readonly _fb     = inject(FormBuilder);
  private readonly _destroyRef = inject(DestroyRef);

  readonly _query      = signal('');
  readonly _results    = signal<PacienteSearch[]>([]);
  readonly _loading    = signal(false);
  readonly _searched   = signal(false);
  readonly _error      = signal<string | null>(null);

  // ─── Formulario crear paciente ─────────────────────────────────────────────
  readonly _showForm     = signal(false);
  readonly _fError       = signal<string | null>(null);
  readonly _fSaving      = signal(false);

  isSubmitted = false;

  readonly months = MONTHS_FULL;
  readonly years  = (() => {
    const cur = new Date().getFullYear();
    return Array.from({ length: 101 }, (_, i) => cur - i);
  })();
  days: number[] = Array.from({ length: 31 }, (_, i) => i + 1);
  readonly cities = ['Ibarra', 'Atuntaqui', 'Otavalo', 'Cotacachi', 'Quito', 'Guayaquil', 'Cuenca'];

  patientForm = this._fb.group({
    firstName:  ['', Validators.required],
    lastName:   ['', Validators.required],
    email:      ['', [Validators.required, Validators.email]],
    phone:      ['', [Validators.required, PatternValidators.phoneEcuador]],
    idType:     ['cedula', Validators.required],
    idNumber:   ['', [Validators.required, DocumentValidators.cedula]],
    birthDay:   ['', Validators.required],
    birthMonth: ['', Validators.required],
    birthYear:  ['', Validators.required],
    city:       ['', Validators.required],
    gender:     ['', Validators.required],
  }, { validators: [DateValidators.ageAtLeast18()] });

  constructor() {
    this.patientForm.get('idType')?.valueChanges
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe((type) => {
        const idControl = this.patientForm.get('idNumber');
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

    this.patientForm.get('birthMonth')?.valueChanges
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe(() => this._updateDaysInMonth());

    this.patientForm.get('birthYear')?.valueChanges
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe(() => this._updateDaysInMonth());
  }

  getFieldError(fieldName: string): string | boolean {
    const control = this.patientForm.get(fieldName);
    if (!this.isSubmitted || !control?.errors) return false;

    const errorTranslations: Record<string, string> = {
      email:                  'common.errors.invalid-email',
      invalidPhonePattern:    'common.errors.invalid-phone',
      invalidCedula:          'auth.register.errors.invalid-cedula',
      invalidPassport:        'auth.register.errors.invalid-passport',
      underage:               'auth.register.errors.underage',
    };

    const firstErrorKey = Object.keys(control.errors)[0];
    if (errorTranslations[firstErrorKey]) {
      return this.t.get(errorTranslations[firstErrorKey]);
    }
    return true;
  }

  _search(): void {
    const q = this._query().trim();
    if (q.length < 2) return;
    this._loading.set(true);
    this._error.set(null);
    this._searched.set(true);
    this._svc.buscarPacientes(q).subscribe({
      next: results => { this._results.set(results); this._loading.set(false); },
      error: ()    => { this._error.set(this.t.get('ejecutivo.patients.search-error')); this._loading.set(false); },
    });
  }

  _openProfile(p: PacienteSearch): void {
    this._router.navigate(['/ejecutivo/pacientes', p.id]);
  }

  _openForm(): void {
    this.isSubmitted = false;
    this.patientForm.reset({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      idType: 'cedula',
      idNumber: '',
      birthDay: '',
      birthMonth: '',
      birthYear: '',
      city: '',
      gender: '',
    });
    this._fError.set(null);
    this._showForm.set(true);
  }

  _cancelForm(): void {
    this._showForm.set(false);
  }

  _savePatient(): void {
    this.isSubmitted = true;
    if (this.patientForm.invalid) {
      this.patientForm.markAllAsTouched();
      return;
    }

    const { firstName, lastName, email, phone, idType, idNumber,
            birthDay, birthMonth, birthYear, city, gender } = this.patientForm.value;

    const birthDate = `${birthYear}-${birthMonth}-${birthDay!.toString().padStart(2, '0')}`;

    const request: CrearPacienteRequest = {
      firstName: firstName!.trim(),
      lastName: lastName!.trim(),
      email: email!.trim(),
      idType: idType!,
      idNumber: idNumber!.trim(),
      phone: phone!.trim(),
      birthDate,
      city: city!,
      gender: gender!,
    };

    this._fSaving.set(true);
    this._fError.set(null);
    this._svc.crearPaciente(request).subscribe({
      next: p => {
        this._fSaving.set(false);
        this._showForm.set(false);
        this._router.navigate(['/ejecutivo/pacientes', p.id]);
      },
      error: (raw) => {
        this._fSaving.set(false);
        const err = toApiError(raw);
        const msg = err.error?.message ?? this.t.get('ejecutivo.patients.form.error-save');
        this._fError.set(msg);
      },
    });
  }

  private _updateDaysInMonth(): void {
    const year  = this.patientForm.get('birthYear')?.value;
    const month = this.patientForm.get('birthMonth')?.value;
    if (year && month) {
      const daysCount = new Date(parseInt(year), parseInt(month), 0).getDate();
      this.days = Array.from({ length: daysCount }, (_, i) => i + 1);
      const currentDay = this.patientForm.get('birthDay')?.value;
      if (currentDay && parseInt(currentDay) > daysCount) {
        this.patientForm.get('birthDay')?.setValue('');
      }
    }
  }
}
