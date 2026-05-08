import { Injectable, inject, DestroyRef, computed, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { interval } from 'rxjs';

import { MedicoService } from './medico.service';
import { AgendaStateService, StatusFilter, ActiveView } from './agenda.state';
import { toApiError } from '../../models/api-error.model';
import { formatDateToISO } from '../../../shared/utils/date-time.utils';
import { DailyAgenda, DoctorAppointment } from '../../models/medico.model';

@Injectable({ providedIn: 'root' })
export class AgendaViewModel {
  private readonly _service = inject(MedicoService);
  private readonly _state = inject(AgendaStateService);
  private readonly _destroyRef = inject(DestroyRef);

  // Independent data source for the next-appointment card.
  // Always holds the current/upcoming week — never changes when the
  // doctor navigates to past/future weeks in the calendar.
  private readonly _upcomingData = signal<DailyAgenda[]>([]);

  constructor() {
    this._loadUpcomingData();

    interval(60_000)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe(() => {
        const current = this._state.agenda();
        if (current.length) this._autoCompleteExpired(current);
        this._loadUpcomingData();
      });
  }

  readonly agenda = this._state.agenda;
  readonly loading = this._state.loading;
  readonly error = this._state.error;
  readonly weekStart = this._state.weekStart;
  readonly selectedDate = this._state.selectedDate;
  readonly searchQuery = this._state.searchQuery;
  readonly statusFilter = this._state.statusFilter;
  readonly expandedId = this._state.expandedId;
  readonly activeView = this._state.activeView;

  readonly isEmpty = computed(() => !this._state.loading() && this._state.agenda().length === 0);

  readonly weekEnd = computed(() => {
    const start = this._state.weekStart();
    if (!start) return '';
    const d = new Date(start + 'T00:00:00');
    d.setDate(d.getDate() + 6);
    return formatDateToISO(d);
  });

  readonly dayAppointments = computed<DoctorAppointment[]>(() => {
    const day = this._state.agenda().find((d) => d.date === this._state.selectedDate());
    return day?.appointments ?? [];
  });

  readonly filteredAppointments = computed<DoctorAppointment[]>(() => {
    const query = this._state.searchQuery().toLowerCase().trim();
    const filter = this._state.statusFilter();
    return this.dayAppointments().filter((apt) => {
      const matchesSearch = !query || apt.patientName.toLowerCase().includes(query);
      const matchesStatus = filter === 'ALL' || apt.status === filter;
      return matchesSearch && matchesStatus;
    });
  });

  readonly dayStats = computed(() => {
    const now = new Date();
    const apts = this.dayAppointments();

    const effective = (apt: { status: string; date: string; endTime: string }) => {
      if (
        (apt.status === 'PENDIENTE' || apt.status === 'CONFIRMADA') &&
        new Date(`${apt.date}T${apt.endTime}`) < now
      )
        return 'COMPLETADA';
      return apt.status;
    };

    return {
      total: apts.length,
      confirmed: apts.filter((a) => effective(a) === 'CONFIRMADA').length,
      pending: apts.filter((a) => effective(a) === 'PENDIENTE').length,
      completed: apts.filter((a) => effective(a) === 'COMPLETADA').length,
      cancelled: apts.filter((a) => effective(a) === 'CANCELADA').length,
    };
  });

  readonly globalNextAppointment = computed(() => {
    const now = new Date();
    return (
      this._upcomingData()
        .flatMap((day) => day.appointments)
        .filter((apt) => {
          if (apt.status !== 'PENDIENTE' && apt.status !== 'CONFIRMADA') return false;
          const end = new Date(`${apt.date}T${apt.endTime}`);
          return end > now;
        })
        .sort((a, b) => `${a.date}T${a.startTime}`.localeCompare(`${b.date}T${b.startTime}`))[0] ??
      null
    );
  });

  loadWeek(date: Date = new Date()): void {
    const monday = this._getMondayOf(date);
    const dateStr = formatDateToISO(monday);

    this._state.setWeekStart(dateStr);
    this._state.setLoading(true);
    this._state.setError(null);

    this._service
      .getWeeklyAgenda(dateStr)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: (agenda) => {
          this._state.setAgenda(agenda);
          this._state.setLoading(false);
          this._autoCompleteExpired(agenda);
        },
        error: (raw) => {
          const err = toApiError(raw);
          const msg =
            err.status === 404
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

  goToDate(date: string): void {
    const d = new Date(date + 'T00:00:00');
    const monday = this._getMondayOf(d);
    this._state.setSelectedDate(date);
    if (formatDateToISO(monday) !== this._state.weekStart()) {
      this.loadWeek(d);
    }
  }

  goToToday(): void {
    const today = new Date();
    const monday = this._getMondayOf(today);
    this._state.setSelectedDate(formatDateToISO(today));
    if (formatDateToISO(monday) !== this._state.weekStart()) {
      this.loadWeek(today);
    }
  }

  setSearchQuery(q: string): void {
    this._state.setSearchQuery(q);
  }
  setStatusFilter(f: StatusFilter): void {
    this._state.setStatusFilter(f);
  }
  setView(view: ActiveView): void {
    this._state.setActiveView(view);
  }

  markAbsent(appointmentId: number): void {
    this._service
      .cancelAppointment(appointmentId)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: () => {
          this._state.setAgenda(
            this._state.agenda().map((day) => ({
              ...day,
              appointments: day.appointments.map((apt) =>
                apt.id === appointmentId ? { ...apt, status: 'CANCELADA' as const } : apt,
              ),
            })),
          );
        },
        error: () => {},
      });
  }

  toggleExpanded(id: number): void {
    this._state.setExpandedId(this._state.expandedId() === id ? null : id);
  }

  private _loadUpcomingData(): void {
    const monday = formatDateToISO(this._getMondayOf(new Date()));
    this._service
      .getWeeklyAgenda(monday)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: (data) => this._upcomingData.set(data),
        error: () => {},
      });
  }

  private _autoCompleteExpired(agenda: DailyAgenda[]): void {
    const now = new Date();
    const expired = agenda
      .flatMap((day) => day.appointments)
      .filter(
        (apt) =>
          (apt.status === 'PENDIENTE' || apt.status === 'CONFIRMADA') &&
          new Date(`${apt.date}T${apt.endTime}`) < now,
      );

    expired.forEach((apt) => {
      this._service
        .completeAppointment(apt.id)
        .pipe(takeUntilDestroyed(this._destroyRef))
        .subscribe({
          next: () => {
            this._state.setAgenda(
              this._state.agenda().map((day) => ({
                ...day,
                appointments: day.appointments.map((a) =>
                  a.id === apt.id ? { ...a, status: 'COMPLETADA' as const } : a,
                ),
              })),
            );
          },
          error: () => {
            /* silent — UI already shows effective status */
          },
        });
    });
  }

  private _getMondayOf(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    d.setDate(d.getDate() + (day === 0 ? -6 : 1 - day));
    d.setHours(0, 0, 0, 0);
    return d;
  }
}
