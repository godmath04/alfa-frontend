import { Injectable, inject } from '@angular/core';
import { Observable, catchError, tap, throwError } from 'rxjs';

import { AdminService } from './admin.service';
import { SpecialtyStateService } from './specialty.state';
import { Specialty, SpecialtyRequest } from '../../models/admin.model';

@Injectable({ providedIn: 'root' })
export class SpecialtyViewModel {
  private readonly _service = inject(AdminService);
  private readonly _state = inject(SpecialtyStateService);

  readonly specialties = this._state.items;
  readonly loading = this._state.loading;
  readonly error = this._state.error;
  readonly saving = this._state.saving;
  readonly saveError = this._state.saveError;

  loadAll(): void {
    this._state.setLoading(true);
    this._state.setError(null);
    this._service.getSpecialties().subscribe({
      next: (items) => {
        this._state.setItems(items);
        this._state.setLoading(false);
      },
      error: () => {
        this._state.setError('admin.specialties.error');
        this._state.setLoading(false);
      },
    });
  }

  create(request: SpecialtyRequest): Observable<Specialty> {
    this._state.setSaving(true);
    this._state.setSaveError(null);
    return this._service.createSpecialty(request).pipe(
      tap((specialty) => {
        this._state.upsert(specialty);
        this._state.setSaving(false);
      }),
      catchError((err) => {
        this._state.setSaveError('admin.specialties.save-error');
        this._state.setSaving(false);
        return throwError(() => err);
      }),
    );
  }

  update(id: number, request: SpecialtyRequest): Observable<Specialty> {
    this._state.setSaving(true);
    this._state.setSaveError(null);
    return this._service.updateSpecialty(id, request).pipe(
      tap((specialty) => {
        this._state.upsert(specialty);
        this._state.setSaving(false);
      }),
      catchError((err) => {
        this._state.setSaveError('admin.specialties.save-error');
        this._state.setSaving(false);
        return throwError(() => err);
      }),
    );
  }

  deactivate(id: number): void {
    this._service.deactivateSpecialty(id).subscribe({
      next: () => this._state.setActive(id, false),
      error: () => {},
    });
  }

  reactivate(id: number): void {
    this._service.reactivateSpecialty(id).subscribe({
      next: () => this._state.setActive(id, true),
      error: () => {},
    });
  }
}
