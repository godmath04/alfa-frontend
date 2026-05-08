import { Injectable, inject } from '@angular/core';
import { Observable, catchError, tap, throwError } from 'rxjs';

import { AdminService } from './admin.service';
import { ScheduleStateService } from './schedule.state';
import { AttentionSchedule, AttentionScheduleRequest } from '../../models/admin.model';

@Injectable({ providedIn: 'root' })
export class ScheduleViewModel {
  private readonly _service = inject(AdminService);
  private readonly _state = inject(ScheduleStateService);

  readonly schedules = this._state.items;
  readonly loading = this._state.loading;
  readonly error = this._state.error;
  readonly saving = this._state.saving;
  readonly saveError = this._state.saveError;

  loadAll(): void {
    this._state.setLoading(true);
    this._state.setError(null);
    this._service.getSchedules().subscribe({
      next: (items) => {
        this._state.setItems(items);
        this._state.setLoading(false);
      },
      error: () => {
        this._state.setError('admin.schedules.error');
        this._state.setLoading(false);
      },
    });
  }

  create(request: AttentionScheduleRequest): Observable<AttentionSchedule> {
    this._state.setSaving(true);
    this._state.setSaveError(null);
    return this._service.createSchedule(request).pipe(
      tap((s) => {
        this._state.upsert(s);
        this._state.setSaving(false);
      }),
      catchError((err) => {
        this._state.setSaveError('admin.schedules.save-error');
        this._state.setSaving(false);
        return throwError(() => err);
      }),
    );
  }

  update(id: number, request: AttentionScheduleRequest): Observable<AttentionSchedule> {
    this._state.setSaving(true);
    this._state.setSaveError(null);
    return this._service.updateSchedule(id, request).pipe(
      tap((s) => {
        this._state.upsert(s);
        this._state.setSaving(false);
      }),
      catchError((err) => {
        this._state.setSaveError('admin.schedules.save-error');
        this._state.setSaving(false);
        return throwError(() => err);
      }),
    );
  }

  deactivate(id: number): void {
    this._service.deactivateSchedule(id).subscribe({
      next: () => this._state.setActive(id, false),
      error: () => {},
    });
  }

  reactivate(id: number): void {
    this._service.reactivateSchedule(id).subscribe({
      next: () => this._state.setActive(id, true),
      error: () => {},
    });
  }
}
