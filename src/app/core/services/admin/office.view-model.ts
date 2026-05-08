import { Injectable, inject } from '@angular/core';
import { Observable, catchError, tap, throwError } from 'rxjs';

import { AdminService } from './admin.service';
import { OfficeStateService } from './office.state';
import { Office, OfficeRequest } from '../../models/admin.model';

@Injectable({ providedIn: 'root' })
export class OfficeViewModel {
  private readonly _service = inject(AdminService);
  private readonly _state = inject(OfficeStateService);

  readonly offices = this._state.items;
  readonly loading = this._state.loading;
  readonly error = this._state.error;
  readonly saving = this._state.saving;
  readonly saveError = this._state.saveError;

  loadAll(): void {
    this._state.setLoading(true);
    this._state.setError(null);
    this._service.getOffices().subscribe({
      next: (items) => {
        this._state.setItems(items);
        this._state.setLoading(false);
      },
      error: () => {
        this._state.setError('admin.offices.error');
        this._state.setLoading(false);
      },
    });
  }

  create(request: OfficeRequest): Observable<Office> {
    this._state.setSaving(true);
    this._state.setSaveError(null);
    return this._service.createOffice(request).pipe(
      tap((office) => {
        this._state.upsert(office);
        this._state.setSaving(false);
      }),
      catchError((err) => {
        this._state.setSaveError('admin.offices.save-error');
        this._state.setSaving(false);
        return throwError(() => err);
      }),
    );
  }

  update(id: number, request: OfficeRequest): Observable<Office> {
    this._state.setSaving(true);
    this._state.setSaveError(null);
    return this._service.updateOffice(id, request).pipe(
      tap((office) => {
        this._state.upsert(office);
        this._state.setSaving(false);
      }),
      catchError((err) => {
        this._state.setSaveError('admin.offices.save-error');
        this._state.setSaving(false);
        return throwError(() => err);
      }),
    );
  }

  deactivate(id: number): void {
    this._service.deactivateOffice(id).subscribe({
      next: () => this._state.setActive(id, false),
      error: () => {},
    });
  }

  reactivate(id: number): void {
    this._service.reactivateOffice(id).subscribe({
      next: () => this._state.setActive(id, true),
      error: () => {},
    });
  }
}
