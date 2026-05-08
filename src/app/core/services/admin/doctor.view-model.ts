import { Injectable, inject } from '@angular/core';
import { Observable, catchError, tap, throwError } from 'rxjs';

import { AdminService } from './admin.service';
import { DoctorStateService } from './doctor.state';
import { DoctorProfile, DoctorProfileRequest } from '../../models/admin.model';

@Injectable({ providedIn: 'root' })
export class DoctorViewModel {
  private readonly _service = inject(AdminService);
  private readonly _state = inject(DoctorStateService);

  readonly doctors = this._state.items;
  readonly loading = this._state.loading;
  readonly error = this._state.error;
  readonly saving = this._state.saving;
  readonly saveError = this._state.saveError;

  loadAll(): void {
    this._state.setLoading(true);
    this._state.setError(null);
    this._service.getDoctors().subscribe({
      next: (items) => {
        this._state.setItems(items);
        this._state.setLoading(false);
      },
      error: () => {
        this._state.setError('admin.doctors.error');
        this._state.setLoading(false);
      },
    });
  }

  create(request: DoctorProfileRequest): Observable<DoctorProfile> {
    this._state.setSaving(true);
    this._state.setSaveError(null);
    return this._service.createDoctor(request).pipe(
      tap((d) => {
        this._state.upsert(d);
        this._state.setSaving(false);
      }),
      catchError((err) => {
        this._state.setSaveError('admin.doctors.save-error');
        this._state.setSaving(false);
        return throwError(() => err);
      }),
    );
  }

  update(id: number, request: DoctorProfileRequest): Observable<DoctorProfile> {
    this._state.setSaving(true);
    this._state.setSaveError(null);
    return this._service.updateDoctor(id, request).pipe(
      tap((d) => {
        this._state.upsert(d);
        this._state.setSaving(false);
      }),
      catchError((err) => {
        this._state.setSaveError('admin.doctors.save-error');
        this._state.setSaving(false);
        return throwError(() => err);
      }),
    );
  }

  deactivate(id: number): void {
    this._service.deactivateDoctor(id).subscribe({
      next: () => this._state.setActive(id, false),
      error: () => {},
    });
  }

  reactivate(id: number): void {
    this._service.reactivateDoctor(id).subscribe({
      next: () => this._state.setActive(id, true),
      error: () => {},
    });
  }
}
