import { Injectable, inject, DestroyRef, computed } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { MedicoService }              from './medico.service';
import { AgendaStateService, StatusFilter, ActiveView } from './agenda.state';
import { toApiError }                 from '../../models/api-error.model';
import { formatDateToISO }            from '../../../shared/utils/date-time.utils';
import { DoctorAppointment }          from '../../models/medico.model';

@Injectable({ providedIn: 'root' })
export class AgendaViewModel {

  private readonly _service    = inject(MedicoService);
  private readonly _state      = inject(AgendaStateService);
  private readonly _destroyRef = inject(DestroyRef);

  readonly agenda       = this._state.agenda;
  readonly loading      = this._state.loading;
  readonly error        = this._state.error;
  readonly weekStart    = this._state.weekStart;
  readonly selectedDate = this._state.selectedDate;
  readonly searchQuery  = this._state.searchQuery;
  readonly statusFilter = this._state.statusFilter;
  readonly expandedId   = this._state.expandedId;
  readonly activeView   = this._state.activeView;

  readonly isEmpty = computed(() => !this._state.loading() && this._state.agenda().length === 0);

  readonly weekEnd = computed(() => {
    const start = this._state.weekStart();
    if (!start) return '';
    const d = new Date(start + 'T00:00:00');
    d.setDate(d.getDate() + 6);
    return formatDateToISO(d);
  });

  readonly dayAppointments = computed<DoctorAppointment[]>(() => {
    const day = this._state.agenda().find(d => d.date === this._state.selectedDate());
    return day?.appointments ?? [];
  });

  readonly filteredAppointments = computed<DoctorAppointment[]>(() => {
    const query  = this._state.searchQuery().toLowerCase().trim();
    const filter = this._state.statusFilter();
    return this.dayAppointments().filter(apt => {
      const matchesSearch = !query || apt.patientName.toLowerCase().includes(query);
      const matchesStatus = filter === 'ALL' || apt.status === filter;
      return matchesSearch && matchesStatus;
    });
  });

  readonly dayStats = computed(() => {
    const apts      = this.dayAppointments();
    const confirmed = apts.filter(a => a.status === 'CONFIRMADA').length;
    const pending   = apts.filter(a => a.status === 'PENDIENTE').length;
    const nextTime  = [...apts].sort((a, b) => a.startTime.localeCompare(b.startTime))[0]?.startTime ?? null;
    return { total: apts.length, confirmed, pending, nextTime };
  });

  loadWeek(date: Date = new Date()): void {
    const monday  = this._getMondayOf(date);
    const dateStr = formatDateToISO(monday);

    this._state.setWeekStart(dateStr);
    this._state.setLoading(true);
    this._state.setError(null);

    this._service.getWeeklyAgenda(dateStr)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: (agenda) => {
          this._state.setAgenda(agenda);
          this._state.setLoading(false);
        },
        error: (raw) => {
          const err = toApiError(raw);
          const msg = err.status === 404
            ? 'No se encontró perfil médico para este usuario.'
            : 'No se pudo cargar la agenda. Intenta de nuevo.';
          this._state.setError(msg);
          this._state.setLoading(false);
        },
      });
  }

  nextWeek(): void {
    const current = new Date(this._state.weekStart() + 'T00:00:00');
    current.setDate(current.getDate() + 7);
    this.loadWeek(current);
  }

  prevWeek(): void {
    const current = new Date(this._state.weekStart() + 'T00:00:00');
    current.setDate(current.getDate() - 7);
    this.loadWeek(current);
  }

  navigateDate(delta: number): void {
    const current = new Date(this._state.selectedDate() + 'T00:00:00');
    current.setDate(current.getDate() + delta);
    const newDate = formatDateToISO(current);
    this._state.setSelectedDate(newDate);
    if (formatDateToISO(this._getMondayOf(current)) !== this._state.weekStart()) {
      this.loadWeek(current);
    }
  }

  selectDate(date: string): void {
    this._state.setSelectedDate(date);
  }

  goToToday(): void {
    const today  = new Date();
    const monday = this._getMondayOf(today);
    this._state.setSelectedDate(formatDateToISO(today));
    if (formatDateToISO(monday) !== this._state.weekStart()) {
      this.loadWeek(today);
    }
  }

  setSearchQuery(q: string): void          { this._state.setSearchQuery(q); }
  setStatusFilter(f: StatusFilter): void   { this._state.setStatusFilter(f); }
  setView(view: ActiveView): void          { this._state.setActiveView(view); }

  toggleExpanded(id: number): void {
    this._state.setExpandedId(this._state.expandedId() === id ? null : id);
  }

  private _getMondayOf(date: Date): Date {
    const d   = new Date(date);
    const day = d.getDay();
    d.setDate(d.getDate() + (day === 0 ? -6 : 1 - day));
    d.setHours(0, 0, 0, 0);
    return d;
  }
}
