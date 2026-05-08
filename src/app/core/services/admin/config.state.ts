import { Injectable, computed, signal } from '@angular/core';
import { SystemConfig } from '../../models/admin.model';

interface ConfigState {
  items: SystemConfig[];
  loading: boolean;
  error: string | null;
  saving: boolean;
  saveError: string | null;
}

@Injectable({ providedIn: 'root' })
export class ConfigStateService {
  private readonly _state = signal<ConfigState>({
    items: [],
    loading: false,
    error: null,
    saving: false,
    saveError: null,
  });

  readonly items = computed(() => this._state().items);
  readonly loading = computed(() => this._state().loading);
  readonly error = computed(() => this._state().error);
  readonly saving = computed(() => this._state().saving);
  readonly saveError = computed(() => this._state().saveError);

  setItems(items: SystemConfig[]): void {
    this._state.update((s) => ({ ...s, items }));
  }
  setLoading(loading: boolean): void {
    this._state.update((s) => ({ ...s, loading }));
  }
  setError(error: string | null): void {
    this._state.update((s) => ({ ...s, error }));
  }
  setSaving(saving: boolean): void {
    this._state.update((s) => ({ ...s, saving }));
  }
  setSaveError(saveError: string | null): void {
    this._state.update((s) => ({ ...s, saveError }));
  }

  upsert(config: SystemConfig): void {
    this._state.update((s) => ({
      ...s,
      items: s.items.some((i) => i.id === config.id)
        ? s.items.map((i) => (i.id === config.id ? config : i))
        : [...s.items, config],
    }));
  }

  setActive(id: number, active: boolean): void {
    this._state.update((s) => ({
      ...s,
      items: s.items.map((i) => (i.id === id ? { ...i, active } : i)),
    }));
  }
}
