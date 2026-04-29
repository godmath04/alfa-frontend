import { Injectable, signal, computed } from '@angular/core';
import { DailyAgenda } from '../../models/medico.model';

export type StatusFilter = 'ALL' | 'PENDIENTE' | 'CONFIRMADA';
export type ActiveView   = 'day' | 'week';

interface AgendaState {
  agenda:       DailyAgenda[];
  loading:      boolean;
  error:        string | null;
  weekStart:    string;
  selectedDate: string;
  searchQuery:  string;
  statusFilter: StatusFilter;
  expandedId:   number | null;
  activeView:   ActiveView;
}

@Injectable({ providedIn: 'root' })
export class AgendaStateService {

  private readonly _state = signal<AgendaState>({
    agenda:       [],
    loading:      false,
    error:        null,
    weekStart:    '',
    selectedDate: new Date().toISOString().slice(0, 10),
    searchQuery:  '',
    statusFilter: 'ALL',
    expandedId:   null,
    activeView:   'day',
  });

  readonly agenda       = computed(() => this._state().agenda);
  readonly loading      = computed(() => this._state().loading);
  readonly error        = computed(() => this._state().error);
  readonly weekStart    = computed(() => this._state().weekStart);
  readonly selectedDate = computed(() => this._state().selectedDate);
  readonly searchQuery  = computed(() => this._state().searchQuery);
  readonly statusFilter = computed(() => this._state().statusFilter);
  readonly expandedId   = computed(() => this._state().expandedId);
  readonly activeView   = computed(() => this._state().activeView);

  setAgenda(agenda: DailyAgenda[]): void              { this._state.update(s => ({ ...s, agenda })); }
  setLoading(loading: boolean): void                  { this._state.update(s => ({ ...s, loading })); }
  setError(error: string | null): void                { this._state.update(s => ({ ...s, error })); }
  setWeekStart(weekStart: string): void               { this._state.update(s => ({ ...s, weekStart })); }
  setSelectedDate(selectedDate: string): void         { this._state.update(s => ({ ...s, selectedDate })); }
  setSearchQuery(searchQuery: string): void           { this._state.update(s => ({ ...s, searchQuery })); }
  setStatusFilter(statusFilter: StatusFilter): void   { this._state.update(s => ({ ...s, statusFilter })); }
  setExpandedId(expandedId: number | null): void      { this._state.update(s => ({ ...s, expandedId })); }
  setActiveView(activeView: ActiveView): void         { this._state.update(s => ({ ...s, activeView })); }
}
