import { Component, afterNextRender, inject, signal } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';

import { Translate } from '../../../../core/services/translate';
import { SpecialtyViewModel } from '../../../../core/services/admin/specialty.view-model';
import { Specialty, SpecialtyRequest } from '../../../../core/models/admin.model';

@Component({
  selector: 'app-specialties',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './specialties.html',
  styleUrl: './specialties.scss',
})
export class SpecialtiesPage {

  readonly t  = inject(Translate);
  readonly vm = inject(SpecialtyViewModel);

  readonly _formVisible = signal(false);
  readonly _editingId   = signal<number | null>(null);
  readonly _fName        = signal('');
  readonly _fIcon        = signal('');
  readonly _fDescription = signal('');
  readonly _fDuration    = signal<number | null>(null);
  readonly _fError       = signal<string | null>(null);

  constructor() {
    afterNextRender(() => this.vm.loadAll());
  }

  _openCreate(): void {
    this._editingId.set(null);
    this._fName.set('');
    this._fIcon.set('');
    this._fDescription.set('');
    this._fDuration.set(null);
    this._fError.set(null);
    this._formVisible.set(true);
  }

  _openEdit(specialty: Specialty): void {
    this._editingId.set(specialty.id);
    this._fName.set(specialty.name);
    this._fIcon.set(specialty.icon ?? '');
    this._fDescription.set(specialty.description ?? '');
    this._fDuration.set(specialty.appointmentDuration);
    this._fError.set(null);
    this._formVisible.set(true);
  }

  _cancel(): void {
    this._formVisible.set(false);
    this._editingId.set(null);
  }

  _save(): void {
    const name     = this._fName().trim();
    const duration = this._fDuration();

    if (!name) { this._fError.set(this.t.get('admin.specialties.validation.name-required')); return; }
    if (!duration || duration < 5) { this._fError.set(this.t.get('admin.specialties.validation.duration-required')); return; }

    const request: SpecialtyRequest = {
      name,
      icon:                this._fIcon().trim() || undefined,
      description:         this._fDescription().trim() || undefined,
      appointmentDuration: duration,
    };

    const id = this._editingId();
    const action$ = id !== null
      ? this.vm.update(id, request)
      : this.vm.create(request);

    action$.subscribe({
      next:  () => this._cancel(),
      error: () => this._fError.set(this.t.get('admin.specialties.save-error')),
    });
  }
}
