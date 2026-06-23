import { Component, afterNextRender, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { switchMap, map, of, catchError } from 'rxjs';

import { Translate } from '../../../../core/services/translate';
import { LabService } from '../../../../core/services/lab/lab.service';
import { StaffLabCitaItem } from '../../../../core/models/lab.model';
import { formatToAmPm } from '../../../../shared/utils/date-time.utils';
import { Button } from '../../../../shared/components/button/button';

@Component({
  selector: 'app-tecnico-lab-dashboard',
  standalone: true,
  imports: [LucideAngularModule, DatePipe, Button],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class TecnicoLabDashboard {

  readonly t = inject(Translate);
  private readonly _svc    = inject(LabService);
  private readonly _router = inject(Router);

  readonly _citas         = signal<StaffLabCitaItem[]>([]);
  readonly _loading       = signal(false);
  readonly _error         = signal<string | null>(null);
  readonly _page          = signal(0);
  readonly _totalPages    = signal(0);
  readonly _totalElements = signal(0);

  readonly _estadoFilter = signal('');
  readonly _fechaDesde   = signal('');
  readonly _fechaHasta   = signal('');

  readonly _actionLoading   = signal<number | null>(null);
  readonly _downloadLoading = signal<number | null>(null);
  readonly _resendLoading   = signal<number | null>(null);

  readonly formatToAmPm = formatToAmPm;

  constructor() {
    afterNextRender(() => this._load());
  }

  _applyFilters(): void {
    this._page.set(0);
    this._load();
  }

  _prevPage(): void {
    if (this._page() > 0) { this._page.update(p => p - 1); this._load(); }
  }

  _nextPage(): void {
    if (this._page() < this._totalPages() - 1) { this._page.update(p => p + 1); this._load(); }
  }

  private _load(): void {
    this._loading.set(true);
    this._error.set(null);
    this._svc.getLabCitasStaff({
      estado:     this._estadoFilter() || undefined,
      fechaDesde: this._fechaDesde()   || undefined,
      fechaHasta: this._fechaHasta()   || undefined,
      page:       this._page(),
      size:       20,
    }).pipe(
      switchMap(r => {
        const completedIds = r.content.filter(c => c.estado === 'COMPLETADA').map(c => c.citaId);
        if (completedIds.length === 0) {
          return of({ page: r, statusMap: {} as Record<number, boolean> });
        }
        return this._svc.getResultsBatchStatus(completedIds).pipe(
          map(statusMap => ({ page: r, statusMap })),
          catchError(() => of({ page: r, statusMap: {} as Record<number, boolean> }))
        );
      })
    ).subscribe({
      next: ({ page, statusMap }) => {
        const enhancedCitas = page.content.map(c => {
          if (statusMap[c.citaId]) {
            return { ...c, originalFileName: 'uploaded.pdf' };
          }
          return c;
        });
        this._citas.set(enhancedCitas);
        this._totalPages.set(page.totalPages);
        this._totalElements.set(Number(page.totalElements));
        this._loading.set(false);
      },
      error: () => {
        this._error.set('Error al cargar las citas de laboratorio.');
        this._loading.set(false);
      },
    });
  }

  _completar(citaId: number): void {
    this._actionLoading.set(citaId);
    this._svc.completarLabCita(citaId).subscribe({
      next: () => {
        this._actionLoading.set(null);
        this._citas.update(list =>
          list.map(c => c.citaId === citaId ? { ...c, estado: 'COMPLETADA' } : c));
      },
      error: () => this._actionLoading.set(null),
    });
  }

  _cancelar(citaId: number): void {
    if (!confirm('¿Estás seguro de cancelar esta cita?')) return;
    this._actionLoading.set(citaId);
    this._svc.cancelarLabCitaEjecutivo(citaId).subscribe({
      next: () => {
        this._actionLoading.set(null);
        this._citas.update(list =>
          list.map(c => c.citaId === citaId ? { ...c, estado: 'CANCELADA' } : c));
      },
      error: () => this._actionLoading.set(null),
    });
  }

  // Navigate to the dedicated upload-result page (replaces the inline modal)
  _openUploadModal(citaId: number): void {
    this._router.navigate(['/tecnico-lab/subir-resultados', citaId]);
  }

  _downloadResult(citaId: number): void {
    this._downloadLoading.set(citaId);
    this._svc.getDownloadUrlByCitaId(citaId).subscribe({
      next: ({ downloadUrl }) => {
        window.open(downloadUrl, '_blank');
        this._downloadLoading.set(null);
      },
      error: () => this._downloadLoading.set(null),
    });
  }

  _resendToken(citaId: number): void {
    this._resendLoading.set(citaId);
    this._svc.reenviarToken(citaId).subscribe({
      next: () => {
        this._resendLoading.set(null);
        alert('Código de acceso reenviado con éxito al paciente.');
      },
      error: () => {
        this._resendLoading.set(null);
        alert('Error al reenviar el código de acceso.');
      },
    });
  }
}
