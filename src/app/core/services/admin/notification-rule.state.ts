import { Injectable, computed, signal } from '@angular/core';
import { NotificationRuleResponse } from '../../models/admin.model';

interface NotificationRuleState {
  items:          NotificationRuleResponse[];
  loading:        boolean;
  error:          string | null;
  saving:         boolean;
  saveError:      string | null;
  schedulerHour:  number | null;
  schedulerSaving: boolean;
}

@Injectable({ providedIn: 'root' })
export class NotificationRuleStateService {

  private readonly _state = signal<NotificationRuleState>({
    items: [], loading: false, error: null,
    saving: false, saveError: null,
    schedulerHour: null, schedulerSaving: false,
  });

  // Exposed computed signals (read-only for components)
  readonly items          = computed(() => this._state().items);
  readonly loading        = computed(() => this._state().loading);
  readonly error          = computed(() => this._state().error);
  readonly saving         = computed(() => this._state().saving);
  readonly saveError      = computed(() => this._state().saveError);
  readonly schedulerHour  = computed(() => this._state().schedulerHour);
  readonly schedulerSaving = computed(() => this._state().schedulerSaving);

  // Setters
  setItems(items: NotificationRuleResponse[]): void         { this._state.update(s => ({ ...s, items })); }
  setLoading(loading: boolean): void                         { this._state.update(s => ({ ...s, loading })); }
  setError(error: string | null): void                       { this._state.update(s => ({ ...s, error })); }
  setSaving(saving: boolean): void                           { this._state.update(s => ({ ...s, saving })); }
  setSaveError(saveError: string | null): void               { this._state.update(s => ({ ...s, saveError })); }
  setSchedulerHour(schedulerHour: number | null): void       { this._state.update(s => ({ ...s, schedulerHour })); }
  setSchedulerSaving(schedulerSaving: boolean): void         { this._state.update(s => ({ ...s, schedulerSaving })); }

  /** Insert or replace a rule by id */
  upsert(rule: NotificationRuleResponse): void {
    this._state.update(s => ({
      ...s,
      items: s.items.some(i => i.id === rule.id)
        ? s.items.map(i => i.id === rule.id ? rule : i)
        : [...s.items, rule],
    }));
  }

  /** Flip active flag locally after a successful toggle */
  flipActive(id: number): void {
    this._state.update(s => ({
      ...s,
      items: s.items.map(i => i.id === id ? { ...i, active: !i.active } : i),
    }));
  }
}
