import { Component, afterNextRender, inject, signal } from '@angular/core';
// COMENTADO TEMPORALMENTE - Router ya no es necesario: el ejecutivo no navega a subir-resultado
// import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';

import { Translate } from '../../../../core/services/translate';
import { LabService } from '../../../../core/services/lab/lab.service';
import { StaffLabCitaItem } from '../../../../core/models/lab.model';
import { formatToAmPm } from '../../../../shared/utils/date-time.utils';
import { Button } from '../../../../shared/components/button/button';

@Component({
  selector: 'app-lab-management',
  standalone: true,
  imports: [LucideAngularModule, DatePipe, Button],
  templateUrl: './lab-management.html',
  styleUrl: './lab-management.scss',
})
export class LabManagementPage {

  readonly t = inject(Translate);
  private readonly _svc    = inject(LabService);
  // COMENTADO TEMPORALMENTE - Ejecutivo ya no sube PDFs, ahora es responsabilidad de TECNICO_LAB
  // private readonly _router = inject(Router);

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
    }).subscribe({
      next: r => {
        this._citas.set(r.content);
        this._totalPages.set(r.totalPages);
        this._totalElements.set(Number(r.totalElements));
        this._loading.set(false);
      },
      error: () => {
        this._error.set(this.t.get('ejecutivo.labManagement.errorLoading'));
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

  // COMENTADO TEMPORALMENTE - Ejecutivo ya no sube PDFs, ahora es responsabilidad de TECNICO_LAB
  // _upload(citaId: number): void {
  //   this._router.navigate(['/ejecutivo/subir-resultado', citaId]);
  // }

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
}
