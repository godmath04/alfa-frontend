import { Injectable, inject } from '@angular/core';
import { Observable, catchError, tap, throwError } from 'rxjs';

import { AdminService } from './admin.service';
import { ConfigStateService } from './config.state';
import { SystemConfig, SystemConfigRequest } from '../../models/admin.model';

@Injectable({ providedIn: 'root' })
export class ConfigViewModel {
  private readonly _service = inject(AdminService);
  private readonly _state = inject(ConfigStateService);

  readonly configs = this._state.items;
  readonly loading = this._state.loading;
  readonly error = this._state.error;
  readonly saving = this._state.saving;
  readonly saveError = this._state.saveError;

  loadAll(): void {
    this._state.setLoading(true);
    this._state.setError(null);
    this._service.getConfigs().subscribe({
      next: (items) => {
        this._state.setItems(items);
        this._state.setLoading(false);
      },
      error: () => {
        this._state.setError('admin.config.error');
        this._state.setLoading(false);
      },
    });
  }

  create(request: SystemConfigRequest): Observable<SystemConfig> {
    this._state.setSaving(true);
    this._state.setSaveError(null);
    return this._service.createConfig(request).pipe(
      tap((c) => {
        this._state.upsert(c);
        this._state.setSaving(false);
      }),
      catchError((err) => {
        this._state.setSaveError('admin.config.save-error');
        this._state.setSaving(false);
        return throwError(() => err);
      }),
    );
  }

  update(id: number, request: SystemConfigRequest): Observable<SystemConfig> {
    this._state.setSaving(true);
    this._state.setSaveError(null);
    return this._service.updateConfig(id, request).pipe(
      tap((c) => {
        this._state.upsert(c);
        this._state.setSaving(false);
      }),
      catchError((err) => {
        this._state.setSaveError('admin.config.save-error');
        this._state.setSaving(false);
        return throwError(() => err);
      }),
    );
  }

  deactivate(id: number): void {
    this._service.deactivateConfig(id).subscribe({
      next: () => this._state.setActive(id, false),
      error: () => {},
    });
  }

  reactivate(id: number): void {
    this._service.reactivateConfig(id).subscribe({
      next: () => this._state.setActive(id, true),
      error: () => {},
    });
  }
}
