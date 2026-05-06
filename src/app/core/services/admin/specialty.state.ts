import { Injectable, computed, signal } from '@angular/core';
import { Specialty } from '../../models/admin.model';

interface SpecialtyState {
  items:     Specialty[];
  loading:   boolean;
  error:     string | null;
  saving:    boolean;
  saveError: string | null;
}

@Injectable({ providedIn: 'root' })
export class SpecialtyStateService {

  private readonly _state = signal<SpecialtyState>({
    items:     [],
    loading:   false,
    error:     null,
    saving:    false,
    saveError: null,
  });

  readonly items     = computed(() => this._state().items);
  readonly loading   = computed(() => this._state().loading);
  readonly error     = computed(() => this._state().error);
  readonly saving    = computed(() => this._state().saving);
  readonly saveError = computed(() => this._state().saveError);

  setItems(items: Specialty[]):         void { this._state.update(s => ({ ...s, items })); }
  setLoading(loading: boolean):         void { this._state.update(s => ({ ...s, loading })); }
  setError(error: string | null):       void { this._state.update(s => ({ ...s, error })); }
  setSaving(saving: boolean):           void { this._state.update(s => ({ ...s, saving })); }
  setSaveError(saveError: string | null): void { this._state.update(s => ({ ...s, saveError })); }

  upsert(specialty: Specialty): void {
    this._state.update(s => ({
      ...s,
      items: s.items.some(i => i.id === specialty.id)
        ? s.items.map(i => i.id === specialty.id ? specialty : i)
        : [...s.items, specialty],
    }));
  }

  setActive(id: number, active: boolean): void {
    this._state.update(s => ({
      ...s,
      items: s.items.map(i => i.id === id ? { ...i, active } : i),
    }));
  }
}
