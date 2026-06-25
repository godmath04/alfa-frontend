import { inject, Injectable, DestroyRef, computed, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AnaliticaService } from './analitica';
import { AnaliticaDashboardState } from './analitica-dashboard.state';

@Injectable({ providedIn: 'root' })
export class AnaliticaDashboardViewModel {
  private readonly _service = inject(AnaliticaService);
  private readonly _state = inject(AnaliticaDashboardState);
  private readonly _destroyRef = inject(DestroyRef);

  // Expose signals to the view
  readonly loading = this._state.loading.asReadonly();
  readonly error = this._state.error.asReadonly();
  readonly headerKpis = this._state.headerKpis.asReadonly();
  readonly citasPorEstado = this._state.citasPorEstado.asReadonly();
  readonly citasPorEspecialidad = this._state.citasPorEspecialidad.asReadonly();
  readonly medicosPorEspecialidad = this._state.medicosPorEspecialidad.asReadonly();
  readonly labEstudiosTop = this._state.labEstudiosTop.asReadonly();
  readonly labTurnaround = this._state.labTurnaround.asReadonly();
  readonly notificacionesResumen = this._state.notificacionesResumen.asReadonly();
  readonly chatbotResumen = this._state.chatbotResumen.asReadonly();
  readonly topMedicos = this._state.topMedicos.asReadonly();

  // State signals for granularity filter
  readonly selectedMonths = signal<number>(6);
  readonly selectedGroupBy = signal<'MONTH' | 'DAY'>('MONTH');

  readonly especialidadViewMode = signal<'CITAS' | 'MEDICOS'>('CITAS');

  readonly activeEspecialidadData = computed(() => {
    return this.especialidadViewMode() === 'CITAS'
      ? this.citasPorEspecialidad()
      : this.medicosPorEspecialidad();
  });

  readonly maxCitasValue = computed(() => {
    const data = this.citasPorEstado();
    if (!data || data.length === 0) return 1;
    const maxVal = Math.max(...data.map(d => d.completadas + d.pendientes + d.canceladas));
    return maxVal > 0 ? maxVal : 1;
  });

  changeCitasFilter(months: number, groupBy: 'MONTH' | 'DAY'): void {
    this.selectedMonths.set(months);
    this.selectedGroupBy.set(groupBy);
    this._service.getCitasPorEstado(months, groupBy).subscribe({
      next: (res) => {
        this._state.citasPorEstado.set(res);
      },
      error: (err) => {
        console.error('Error updating citasPorEstado', err);
      }
    });
  }

  // Computed signal to calculate donut background safely on view-model, not template.
  readonly donutBackground = computed(() => {
    const data = this.activeEspecialidadData();
    if (!data || !data.categorias || data.categorias.length === 0) {
      return 'conic-gradient(#D1D5DB 0% 100%)';
    }
    const cat0 = data.categorias[0]?.pct ?? 0;
    const cat1 = data.categorias[1]?.pct ?? 0;
    const limit1 = cat0;
    const limit2 = cat0 + cat1;
    return `conic-gradient(#023059 0% ${limit1}%, #369AD9 ${limit1}% ${limit2}%, #D1D5DB ${limit2}% 100%)`;
  });

  readonly donutSlices = computed(() => {
    const data = this.activeEspecialidadData();
    if (!data || !data.categorias || data.categorias.length === 0) return [];
    
    let accumulatedPct = 0;
    const colors = ['#023059', '#63beff', '#006494', '#eeeeee'];
    
    return data.categorias.map((cat, index) => {
      const pct = cat.pct;
      const strokeDashoffset = 251.2 - (pct / 100) * 251.2;
      const rotation = -90 + (accumulatedPct / 100) * 360;
      accumulatedPct += pct;
      
      return {
        ...cat,
        color: colors[index % colors.length] || '#eeeeee',
        dashoffset: strokeDashoffset.toFixed(1),
        transform: `rotate(${rotation} 50 50)`
      };
    });
  });

  readonly notificationsDonut = computed(() => {
    const data = this.notificacionesResumen();
    if (!data) return null;
    
    const successPct = data.deliveryRatePct;
    const failPct = 100 - successPct;
    
    const successOffset = 251.2 - (successPct / 100) * 251.2;
    const failOffset = 251.2 - (failPct / 100) * 251.2;
    
    return {
      total: data.total,
      successOffset: successOffset.toFixed(1),
      failOffset: failOffset.toFixed(1),
      successTransform: 'rotate(-90 50 50)',
      failTransform: `rotate(${-90 + (successPct / 100) * 360} 50 50)`
    };
  });

  readonly labGaugeRotation = computed(() => {
    const labT = this.labTurnaround();
    if (!labT) return 0;
    const hours = labT.promedioHoras;
    let deg = 0;
    if (hours <= 24) {
      deg = (hours / 24) * 90;
    } else if (hours <= 72) {
      deg = 90 + ((hours - 24) / 48) * 45;
    } else {
      const extra = hours - 72;
      deg = 135 + (extra / 24) * 45;
    }
    return Math.min(Math.max(deg, 0), 180);
  });

  getSparklinePath(sparkline: number[] | undefined): string {
    if (!sparkline || sparkline.length === 0) return '';
    const min = Math.min(...sparkline);
    const max = Math.max(...sparkline);
    const range = max - min || 1;
    const width = 100;
    const height = 30;
    const step = width / (sparkline.length - 1);
    
    return sparkline.map((val, idx) => {
      const x = idx * step;
      const y = height - ((val - min) / range) * (height - 4) - 2;
      return `${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    }).join(' ');
  }

  constructor() {
    // Note: takeUntilDestroyed must be used within an injection context 
    // unless a DestroyRef is passed. Calling it here is safe.
  }

  loadDashboard(): void {
    this._state.setLoading(true);
    this._state.setError(null);

    // Using forkJoin to load all parallel requests, with individual error catchers so backend errors don't break the whole dashboard.
    forkJoin({
      headerKpis: this._service.getHeaderKpis().pipe(
        catchError(err => {
          console.error('Error loading headerKpis', err);
          return of(null);
        })
      ),
      citasPorEstado: this._service.getCitasPorEstado().pipe(
        catchError(err => {
          console.error('Error loading citasPorEstado', err);
          return of([]);
        })
      ),
      citasPorEspecialidad: this._service.getCitasPorEspecialidad().pipe(
        catchError(err => {
          console.error('Error loading citasPorEspecialidad', err);
          return of(null);
        })
      ),
      medicosPorEspecialidad: this._service.getMedicosPorEspecialidad().pipe(
        catchError(err => {
          console.error('Error loading medicosPorEspecialidad', err);
          return of(null);
        })
      ),
      labEstudiosTop: this._service.getLabEstudiosTop().pipe(
        catchError(err => {
          console.error('Error loading labEstudiosTop', err);
          return of(null);
        })
      ),
      labTurnaround: this._service.getLabTurnaround().pipe(
        catchError(err => {
          console.error('Error loading labTurnaround', err);
          return of(null);
        })
      ),
      notificacionesResumen: this._service.getNotificacionesResumen().pipe(
        catchError(err => {
          console.error('Error loading notificacionesResumen', err);
          return of(null);
        })
      ),
      chatbotResumen: this._service.getChatbotResumen().pipe(
        catchError(err => {
          console.error('Error loading chatbotResumen', err);
          return of(null);
        })
      ),
      topMedicos: this._service.getTopMedicos().pipe(
        catchError(err => {
          console.error('Error loading topMedicos', err);
          return of(null);
        })
      )
    })
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: (res) => {
          // Type assertion to ensure typings match (since we allow nulls inside the catchError)
          this._state.setDashboardData(res as any);
          this._state.setLoading(false);
        },
        error: (err) => {
          console.error('Error loading dashboard data', err);
          this._state.setError('Ocurrió un error al cargar la información del dashboard.');
          this._state.setLoading(false);
        }
      });
  }

  clear(): void {
    this._state.clearDashboard();
  }

  exportReport(): void {
    window.print();
  }
}
