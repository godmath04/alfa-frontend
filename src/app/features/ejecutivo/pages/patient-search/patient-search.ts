import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';

import { Translate } from '../../../../core/services/translate';
import { ExecutiveService } from '../../../../core/services/ejecutivo/executive.service';
import { PacienteSearch, CrearPacienteRequest } from '../../../../core/models/executive.model';
import { MONTHS_FULL } from '../../../../shared/utils/date-time.utils';

@Component({
  selector: 'app-patient-search',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './patient-search.html',
  styleUrl: './patient-search.scss',
})
export class PatientSearchPage {

  readonly t   = inject(Translate);
  private readonly _svc    = inject(ExecutiveService);
  private readonly _router = inject(Router);

  readonly _query      = signal('');
  readonly _results    = signal<PacienteSearch[]>([]);
  readonly _loading    = signal(false);
  readonly _searched   = signal(false);
  readonly _error      = signal<string | null>(null);

  // ─── Formulario crear paciente ─────────────────────────────────────────────
  readonly _showForm     = signal(false);
  readonly _fFirstName   = signal('');
  readonly _fLastName    = signal('');
  readonly _fEmail       = signal('');
  readonly _fIdType      = signal('cedula');
  readonly _fIdNumber    = signal('');
  readonly _fPhone       = signal('');
  readonly _fBirthDay    = signal('');
  readonly _fBirthMonth  = signal('');
  readonly _fBirthYear   = signal('');
  readonly _fCity        = signal('');
  readonly _fGender      = signal('');
  readonly _fError       = signal<string | null>(null);
  readonly _fSaving      = signal(false);

  readonly months = MONTHS_FULL;
  readonly years  = (() => {
    const cur = new Date().getFullYear();
    return Array.from({ length: 101 }, (_, i) => cur - i);
  })();
  readonly days   = Array.from({ length: 31 }, (_, i) => i + 1);
  readonly cities = ['Ibarra', 'Atuntaqui', 'Otavalo', 'Cotacachi', 'Quito', 'Guayaquil', 'Cuenca'];

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
    this._fFirstName.set('');  this._fLastName.set('');  this._fEmail.set('');
    this._fIdType.set('cedula'); this._fIdNumber.set(''); this._fPhone.set('');
    this._fBirthDay.set('');   this._fBirthMonth.set(''); this._fBirthYear.set('');
    this._fCity.set('');       this._fGender.set('');
    this._fError.set(null);
    this._showForm.set(true);
  }

  _cancelForm(): void { this._showForm.set(false); }

  _savePatient(): void {
    const firstName  = this._fFirstName().trim();
    const lastName   = this._fLastName().trim();
    const email      = this._fEmail().trim();
    const idNumber   = this._fIdNumber().trim();
    const birthDay   = this._fBirthDay();
    const birthMonth = this._fBirthMonth();
    const birthYear  = this._fBirthYear();
    const city       = this._fCity();
    const gender     = this._fGender();

    if (!firstName)  { this._fError.set(this.t.get('ejecutivo.patients.form.error-first'));  return; }
    if (!lastName)   { this._fError.set(this.t.get('ejecutivo.patients.form.error-last'));   return; }
    if (!email)      { this._fError.set(this.t.get('ejecutivo.patients.form.error-email'));  return; }
    if (!idNumber)   { this._fError.set(this.t.get('ejecutivo.patients.form.error-id'));     return; }
    if (!birthDay || !birthMonth || !birthYear) {
      this._fError.set(this.t.get('ejecutivo.patients.form.error-birth')); return;
    }
    if (!city)       { this._fError.set(this.t.get('ejecutivo.patients.form.error-city'));   return; }
    if (!gender)     { this._fError.set(this.t.get('ejecutivo.patients.form.error-gender')); return; }

    const birthDate = `${birthYear}-${birthMonth}-${birthDay.padStart(2, '0')}`;

    const request: CrearPacienteRequest = {
      firstName, lastName, email, idNumber,
      idType:    this._fIdType(),
      phone:     this._fPhone().trim(),
      birthDate, city, gender,
    };

    this._fSaving.set(true);
    this._svc.crearPaciente(request).subscribe({
      next: p => {
        this._fSaving.set(false);
        this._showForm.set(false);
        this._router.navigate(['/ejecutivo/pacientes', p.id]);
      },
      error: (err) => {
        this._fSaving.set(false);
        const msg = err?.error?.message ?? this.t.get('ejecutivo.patients.form.error-save');
        this._fError.set(msg);
      },
    });
  }
}
