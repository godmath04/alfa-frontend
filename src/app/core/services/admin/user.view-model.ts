import { Injectable, computed, inject } from '@angular/core';

import { AdminService } from './admin.service';
import { UserStateService } from './user.state';

@Injectable({ providedIn: 'root' })
export class UserViewModel {
  private readonly _service = inject(AdminService);
  private readonly _state = inject(UserStateService);

  readonly users = this._state.items;
  readonly medicos = computed(() => this._state.items().filter((u) => u.role === 'MEDICO'));
  readonly loading = this._state.loading;
  readonly error = this._state.error;
  readonly saving = this._state.saving;

  loadAll(): void {
    this._state.setLoading(true);
    this._state.setError(null);
    this._service.getUsers().subscribe({
      next: (items) => {
        this._state.setItems(items);
        this._state.setLoading(false);
      },
      error: () => {
        this._state.setError('admin.users.error');
        this._state.setLoading(false);
      },
    });
  }

  changeRole(id: number, role: string): void {
    this._state.setSaving(true);
    this._service.changeUserRole(id, role).subscribe({
      next: () => {
        this._state.updateRole(id, role);
        this._state.setSaving(false);
      },
      error: () => {
        this._state.setSaving(false);
      },
    });
  }
}
