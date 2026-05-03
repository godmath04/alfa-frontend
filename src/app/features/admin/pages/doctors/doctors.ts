import { Component, afterNextRender, inject, signal } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';

import { Translate } from '../../../../core/services/translate';
import { DoctorViewModel } from '../../../../core/services/admin/doctor.view-model';
import { SpecialtyViewModel } from '../../../../core/services/admin/specialty.view-model';
import { UserViewModel } from '../../../../core/services/admin/user.view-model';
import { DoctorProfile, DoctorProfileRequest } from '../../../../core/models/admin.model';

@Component({
  selector: 'app-doctors',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './doctors.html',
  styleUrl: './doctors.scss',
})
export class DoctorsPage {

  readonly t           = inject(Translate);
  readonly doctorVm    = inject(DoctorViewModel);
  readonly specialtyVm = inject(SpecialtyViewModel);
  readonly userVm      = inject(UserViewModel);

  readonly _formVisible = signal(false);
  readonly _editingId   = signal<number | null>(null);
  readonly _formError   = signal<string | null>(null);

  readonly _fUserId      = signal<number | null>(null);
  readonly _fFirstName   = signal('');
  readonly _fLastName    = signal('');
  readonly _fIdNumber    = signal('');
  readonly _fPhoto       = signal('');
  readonly _fSpecialties = signal<number[]>([]);

  constructor() {
    afterNextRender(() => {
      this.doctorVm.loadAll();
      this.specialtyVm.loadAll();
      this.userVm.loadAll();
    });
  }

  _openCreate(): void {
    this._editingId.set(null);
    this._fUserId.set(null);
    this._fFirstName.set('');
    this._fLastName.set('');
    this._fIdNumber.set('');
    this._fPhoto.set('');
    this._fSpecialties.set([]);
    this._formError.set(null);
    this._formVisible.set(true);
  }

  _openEdit(d: DoctorProfile): void {
    this._editingId.set(d.id);
    this._fUserId.set(d.userId);
    this._fFirstName.set(d.firstName);
    this._fLastName.set(d.lastName);
    this._fIdNumber.set(d.idNumber);
    this._fPhoto.set(d.profilePhoto ?? '');
    this._fSpecialties.set(d.specialties.map(s => s.id));
    this._formError.set(null);
    this._formVisible.set(true);
  }

  _cancel(): void {
    this._formVisible.set(false);
    this._editingId.set(null);
    this._formError.set(null);
  }

  _save(): void {
    const userId = this._fUserId();
    const firstName = this._fFirstName().trim();
    const lastName  = this._fLastName().trim();
    const idNumber  = this._fIdNumber().trim();

    if (!userId)    { this._formError.set(this.t.get('admin.doctors.validation.user-required'));  return; }
    if (!firstName) { this._formError.set(this.t.get('admin.doctors.validation.first-required')); return; }
    if (!lastName)  { this._formError.set(this.t.get('admin.doctors.validation.last-required'));  return; }
    if (!idNumber)  { this._formError.set(this.t.get('admin.doctors.validation.id-required'));    return; }

    const request: DoctorProfileRequest = {
      userId,
      firstName,
      lastName,
      idNumber,
      profilePhoto:  this._fPhoto().trim() || undefined,
      specialtyIds:  this._fSpecialties(),
    };

    const id = this._editingId();
    const action$ = id !== null
      ? this.doctorVm.update(id, request)
      : this.doctorVm.create(request);

    action$.subscribe({
      next:  () => this._cancel(),
      error: () => this._formError.set(this.t.get('admin.doctors.save-error')),
    });
  }

  _toggleSpecialty(id: number): void {
    const current = this._fSpecialties();
    this._fSpecialties.set(
      current.includes(id) ? current.filter(x => x !== id) : [...current, id]
    );
  }

  _isSpecialtySelected(id: number): boolean {
    return this._fSpecialties().includes(id);
  }

  _isEditing(): boolean {
    return this._editingId() !== null;
  }
}
