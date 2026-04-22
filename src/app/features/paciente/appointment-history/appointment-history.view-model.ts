import { Injectable, inject, DestroyRef, signal, computed, Signal } from '@angular/core';
import { Subject, EMPTY } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AppointmentService } from '../../../core/services/appointment/appointment';
import { MisCitaItem, MisCitasFiltros, PageResponse } from '../../../core/models/appointment.model';

@Injectable()
export class AppointmentHistoryViewModel {
  private readonly _service    = inject(AppointmentService);
  private readonly _destroyRef = inject(DestroyRef);

  // ── Private state signals ───────────────────────────────────────────────
  private readonly _loading      = signal<boolean>(false);
  private readonly _error        = signal<boolean>(false);
  private readonly _citas        = signal<MisCitaItem[]>([]);
  private readonly _totalElements = signal<number>(0);
  private readonly _totalPages   = signal<number>(0);
  private readonly _isLastPage   = signal<boolean>(false);
  private readonly _estado       = signal<string>('');
  private readonly _fechaDesde   = signal<string>('');
  private readonly _fechaHasta   = signal<string>('');
  private readonly _page         = signal<number>(0);
  private readonly _size         = signal<number>(20);

  // ── Public read-only signals ────────────────────────────────────────────
  readonly loading:       Signal<boolean>      = computed(() => this._loading());
  readonly error:         Signal<boolean>      = computed(() => this._error());
  readonly citas:         Signal<MisCitaItem[]>= computed(() => this._citas());
  readonly totalElements: Signal<number>       = computed(() => this._totalElements());
  readonly totalPages:    Signal<number>       = computed(() => this._totalPages());
  readonly isLastPage:    Signal<boolean>      = computed(() => this._isLastPage());
  readonly page:          Signal<number>       = computed(() => this._page());

  // ── Search trigger (Subject + switchMap = automatic cancellation) ───────
  // Must be in the constructor (injection context) so takeUntilDestroyed works
  private readonly _search$ = new Subject<MisCitasFiltros>();

  constructor() {
    this._search$
      .pipe(
        switchMap(filtros => {
          this._loading.set(true);
          this._error.set(false);
          return this._service.getMisCitas(filtros).pipe(
            // catchError returns EMPTY so the outer pipeline stays alive
            catchError(() => {
              this._error.set(true);
              this._loading.set(false);
              return EMPTY;
            })
          );
        }),
        takeUntilDestroyed(this._destroyRef)
      )
      .subscribe({
        next: (response: PageResponse<MisCitaItem>) => {
          this._citas.set(response.content);
          this._page.set(response.page);
          this._totalElements.set(response.totalElements);
          this._totalPages.set(response.totalPages);
          this._isLastPage.set(response.last);
          this._loading.set(false);
        }
      });
  }

  // ── Actions ─────────────────────────────────────────────────────────────

  loadMisCitas(): void {
    const filtros: MisCitasFiltros = { page: this._page(), size: this._size() };
    if (this._estado())    filtros.estado     = this._estado();
    if (this._fechaDesde()) filtros.fechaDesde = this._fechaDesde();
    if (this._fechaHasta()) filtros.fechaHasta = this._fechaHasta();
    this._search$.next(filtros);
  }

  setFilters(estado: string, fechaDesde: string, fechaHasta: string): void {
    this._estado.set(estado);
    this._fechaDesde.set(fechaDesde);
    this._fechaHasta.set(fechaHasta);
    this._page.set(0);
    this.loadMisCitas();
  }

  setPage(page: number): void {
    const total = this._totalPages();
    if (page < 0 || (total > 0 && page >= total)) return;
    this._page.set(page);
    this.loadMisCitas();
  }

  clearFilters(): void {
    this._estado.set('');
    this._fechaDesde.set('');
    this._fechaHasta.set('');
    this._page.set(0);
    this.loadMisCitas();
  }
}
