import { Component, inject, signal, computed, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { timer, Subscription, switchMap, catchError, of } from 'rxjs';
import { AnaliticaService } from '../../../../core/services/analitica/analitica';
import { ConsultorioEstado, ConsultorioAgendaItem } from '../../../../core/models/analitica.model';

@Component({
  selector: 'app-consultorios',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './consultorios.html',
  styleUrl: './consultorios.scss',
})
export class Consultorios implements OnDestroy {
  private readonly _service = inject(AnaliticaService);

  readonly consultorios    = signal<ConsultorioEstado[]>([]);
  readonly loading         = signal(true);
  readonly lastUpdated     = signal<Date | null>(null);
  readonly pollError       = signal(false);

  readonly selectedConsultorio = signal<ConsultorioEstado | null>(null);
  readonly agendaItems         = signal<ConsultorioAgendaItem[]>([]);
  readonly agendaLoading       = signal(false);
  readonly weekOffset          = signal(0); // 0 = semana actual, máx 4

  private _pollSub: Subscription;

  constructor() {
    // Polling: carga inmediata y luego cada 60 segundos
    this._pollSub = timer(0, 60_000).pipe(
      switchMap(() =>
        this._service.getConsultoriosEstado().pipe(
          catchError(() => {
            this.pollError.set(true);
            return of(this.consultorios()); // mantiene datos anteriores
          })
        )
      )
    ).subscribe(data => {
      this.consultorios.set(data);
      this.loading.set(false);
      if (data.length > 0) {
        this.pollError.set(false);
        this.lastUpdated.set(new Date());
      }
    });
  }

  ngOnDestroy(): void {
    this._pollSub?.unsubscribe();
  }

  // ── Conteos para el header ──────────────────────────────────────
  readonly totalOcupados = computed(() =>
    this.consultorios().filter(c => c.estado === 'OCUPADO').length
  );
  readonly totalDisponibles = computed(() =>
    this.consultorios().filter(c => c.estado === 'DISPONIBLE').length
  );
  readonly totalLimpieza = computed(() =>
    this.consultorios().filter(c => c.estado === 'LIMPIEZA').length
  );

  // ── Semana calculada ─────────────────────────────────────────────
  readonly weekDays = computed(() => {
    const today = new Date();
    // Ir al lunes de la semana actual
    const mon = new Date(today);
    const dayOfWeek = (today.getDay() + 6) % 7; // 0=Lun
    mon.setDate(today.getDate() - dayOfWeek + this.weekOffset() * 7);

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

  readonly weekLabel = computed(() => {
    const days = this.weekDays();
    if (!days.length) return '';
    const from = days[0].date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
    const to   = days[6].date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
    return `${from} – ${to}`;
  });

  readonly canGoBack = computed(() => this.weekOffset() > 0);
  readonly canGoNext = computed(() => this.weekOffset() < 4);

  // ── Selección de consultorio y carga de agenda ───────────────────
  openDrawer(consultorio: ConsultorioEstado): void {
    this.selectedConsultorio.set(consultorio);
    this.weekOffset.set(0);
    this._loadAgenda(consultorio.consultorioId);
  }

  closeDrawer(): void {
    this.selectedConsultorio.set(null);
    this.agendaItems.set([]);
    this.weekOffset.set(0);
  }

  prevWeek(): void {
    if (this.canGoBack()) {
      this.weekOffset.update(w => w - 1);
      this._loadAgendaCurrentWeek();
    }
  }

  nextWeek(): void {
    if (this.canGoNext()) {
      this.weekOffset.update(w => w + 1);
      this._loadAgendaCurrentWeek();
    }
  }

  private _loadAgendaCurrentWeek(): void {
    const sel = this.selectedConsultorio();
    if (sel) this._loadAgenda(sel.consultorioId);
  }

  private _loadAgenda(officeId: number): void {
    const days = this.weekDays();
    if (!days.length) return;
    const desde = days[0].iso;
    const hasta  = days[6].iso;

    this.agendaLoading.set(true);
    this._service.getConsultorioAgenda(officeId, desde, hasta).pipe(
      catchError(() => of([]))
    ).subscribe(items => {
      this.agendaItems.set(items);
      this.agendaLoading.set(false);
    });
  }

  // ── Helpers de vista ─────────────────────────────────────────────
  getItemsForDay(isoDate: string): ConsultorioAgendaItem[] {
    return this.agendaItems().filter(item => item.fecha === isoDate);
  }

  isToday(isoDate: string): boolean {
    return isoDate === new Date().toISOString().split('T')[0];
  }

  badgeClass(estado: string): string {
    switch (estado) {
      case 'OCUPADO':    return 'badge-ocupado';
      case 'DISPONIBLE': return 'badge-disponible';
      case 'LIMPIEZA':   return 'badge-limpieza';
      default:           return 'badge-disponible';
    }
  }

  cardBorder(estado: string): string {
    switch (estado) {
      case 'OCUPADO':    return 'border-ocupado';
      case 'LIMPIEZA':   return 'border-limpieza';
      default:           return 'border-disponible';
    }
  }

  formatTime(t: string | undefined): string {
    return t ?? '—';
  }
}
