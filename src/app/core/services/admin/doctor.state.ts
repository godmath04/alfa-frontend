import { Injectable, computed, signal } from '@angular/core';
import { DoctorProfile } from '../../models/admin.model';

interface DoctorState {
  items: DoctorProfile[];
  loading: boolean;
  error: string | null;
  saving: boolean;
  saveError: string | null;
}

@Injectable({ providedIn: 'root' })
export class DoctorStateService {
  private readonly _state = signal<DoctorState>({
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

  setItems(items: DoctorProfile[]): void {
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

  upsert(doctor: DoctorProfile): void {
    this._state.update((s) => ({
      ...s,
      items: s.items.some((i) => i.id === doctor.id)
        ? s.items.map((i) => (i.id === doctor.id ? doctor : i))
        : [...s.items, doctor],
    }));
  }

  setActive(id: number, active: boolean): void {
    this._state.update((s) => ({
      ...s,
      items: s.items.map((i) => (i.id === id ? { ...i, active } : i)),
    }));
  }
}
