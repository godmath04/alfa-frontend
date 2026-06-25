import { Component, inject, signal, computed, OnDestroy } from '@angular/core';
import { DatePipe } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { timer, Subscription, switchMap, catchError, of } from 'rxjs';
import { AnaliticaService } from '../../../../core/services/analitica/analitica';
import { ConsultorioEstado, ConsultorioAgendaItem } from '../../../../core/models/analitica.model';

@Component({
  selector: 'app-consultorios',
  standalone: true,
  imports: [DatePipe, LucideAngularModule],
  templateUrl: './consultorios.html',
  styleUrl: './consultorios.scss',
})
export class Consultorios implements OnDestroy {
  private readonly _service = inject(AnaliticaService);

  readonly _consultorios    = signal<ConsultorioEstado[]>([]);
  readonly _loading         = signal(true);
  readonly _lastUpdated     = signal<Date | null>(null);
  readonly _pollError       = signal(false);

  readonly _selectedConsultorio = signal<ConsultorioEstado | null>(null);
  readonly _agendaItems         = signal<ConsultorioAgendaItem[]>([]);
  readonly _agendaLoading       = signal(false);
  readonly _weekOffset          = signal(0);

  private _pollSub: Subscription;

  constructor() {
    this._pollSub = timer(0, 60_000).pipe(
      switchMap(() =>
        this._service.getConsultoriosEstado().pipe(
          catchError(() => {
            this._pollError.set(true);
            return of(this._consultorios());
          })
        )
      )
    ).subscribe(data => {
      this._consultorios.set(data);
      this._loading.set(false);
      if (data.length > 0) {
        this._pollError.set(false);
        this._lastUpdated.set(new Date());
      }
    });
  }

  ngOnDestroy(): void {
    this._pollSub?.unsubscribe();
  }

  readonly _totalOcupados    = computed(() => this._consultorios().filter(c => c.estado === 'OCUPADO').length);
  readonly _totalDisponibles = computed(() => this._consultorios().filter(c => c.estado === 'DISPONIBLE').length);
  readonly _totalLimpieza    = computed(() => this._consultorios().filter(c => c.estado === 'LIMPIEZA').length);

  readonly _weekDays = computed(() => {
    const today = new Date();
    const mon = new Date(today);
    const dayOfWeek = (today.getDay() + 6) % 7;
    mon.setDate(today.getDate() - dayOfWeek + this._weekOffset() * 7);

    const days: { date: Date; label: string; iso: string }[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(mon);
      d.setDate(mon.getDate() + i);
      days.push({
        date: d,
        label: d.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' }),
        iso: d.toISOString().split('T')[0]
      });
    }
    return days;
  });

  readonly _weekLabel = computed(() => {
    const days = this._weekDays();
    if (!days.length) return '';
    const from = days[0].date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
    const to   = days[6].date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
    return `${from} – ${to}`;
  });

  readonly _canGoBack = computed(() => this._weekOffset() > 0);
  readonly _canGoNext = computed(() => this._weekOffset() < 4);

  _openDrawer(consultorio: ConsultorioEstado): void {
    this._selectedConsultorio.set(consultorio);
    this._weekOffset.set(0);
    this._loadAgenda(consultorio.consultorioId);
  }

  _closeDrawer(): void {
    this._selectedConsultorio.set(null);
    this._agendaItems.set([]);
    this._weekOffset.set(0);
  }

  _prevWeek(): void {
    if (this._canGoBack()) {
      this._weekOffset.update(w => w - 1);
      this._loadAgendaCurrentWeek();
    }
  }

  _nextWeek(): void {
    if (this._canGoNext()) {
      this._weekOffset.update(w => w + 1);
      this._loadAgendaCurrentWeek();
    }
  }

  private _loadAgendaCurrentWeek(): void {
    const sel = this._selectedConsultorio();
    if (sel) this._loadAgenda(sel.consultorioId);
  }

  private _loadAgenda(officeId: number): void {
    const days = this._weekDays();
    if (!days.length) return;
    const desde = days[0].iso;
    const hasta  = days[6].iso;

    this._agendaLoading.set(true);
    this._service.getConsultorioAgenda(officeId, desde, hasta).pipe(
      catchError(() => of([]))
    ).subscribe(items => {
      this._agendaItems.set(items);
      this._agendaLoading.set(false);
    });
  }

  _getItemsForDay(isoDate: string): ConsultorioAgendaItem[] {
    return this._agendaItems().filter(item => item.fecha === isoDate);
  }

  _isToday(isoDate: string): boolean {
    return isoDate === new Date().toISOString().split('T')[0];
  }

  _badgeClass(estado: string): string {
    switch (estado) {
      case 'OCUPADO':    return 'badge-ocupado';
      case 'DISPONIBLE': return 'badge-disponible';
      case 'LIMPIEZA':   return 'badge-limpieza';
      default:           return 'badge-disponible';
    }
  }

  _cardBorder(estado: string): string {
    switch (estado) {
      case 'OCUPADO':  return 'border-ocupado';
      case 'LIMPIEZA': return 'border-limpieza';
      default:         return 'border-disponible';
    }
  }

  _formatTime(t: string | undefined): string {
    return t ?? '—';
  }
}
