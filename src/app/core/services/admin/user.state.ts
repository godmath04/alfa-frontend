import { Injectable, computed, signal } from '@angular/core';
import { UserProfile } from '../../models/admin.model';

interface UserState {
  items:   UserProfile[];
  loading: boolean;
  error:   string | null;
  saving:  boolean;
}

@Injectable({ providedIn: 'root' })
export class UserStateService {

  private readonly _state = signal<UserState>({
    items: [], loading: false, error: null, saving: false,
  });

  readonly items   = computed(() => this._state().items);
  readonly loading = computed(() => this._state().loading);
  readonly error   = computed(() => this._state().error);
  readonly saving  = computed(() => this._state().saving);

  setItems(items: UserProfile[]):   void { this._state.update(s => ({ ...s, items })); }
  setLoading(loading: boolean):     void { this._state.update(s => ({ ...s, loading })); }
  setError(error: string | null):   void { this._state.update(s => ({ ...s, error })); }
  setSaving(saving: boolean):       void { this._state.update(s => ({ ...s, saving })); }

  updateRole(id: number, role: string): void {
    this._state.update(s => ({
      ...s,
      items: s.items.map(u => u.id === id ? { ...u, role } : u),
    }));
  }
}
