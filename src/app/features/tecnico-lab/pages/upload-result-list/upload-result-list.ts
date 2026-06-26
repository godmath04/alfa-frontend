import { Component, afterNextRender, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';

import { LabService } from '../../../../core/services/lab/lab.service';
import { StaffLabCitaItem } from '../../../../core/models/lab.model';
import { formatToAmPm } from '../../../../shared/utils/date-time.utils';
import { Button } from '../../../../shared/components/button/button';

@Component({
  selector: 'app-tl-upload-result-list',
  standalone: true,
  imports: [LucideAngularModule, DatePipe, Button],
  templateUrl: './upload-result-list.html',
  styleUrl: './upload-result-list.scss',
})
export class TlUploadResultListPage {

  private readonly _svc    = inject(LabService);
  private readonly _router = inject(Router);

  // Pre-filtered to COMPLETADA — only completed citas can have a PDF uploaded
  readonly _citas         = signal<StaffLabCitaItem[]>([]);
  readonly _loading       = signal(false);
  readonly _error         = signal<string | null>(null);
  readonly _page          = signal(0);
  readonly _totalPages    = signal(0);

  readonly _fechaDesde = signal('');
  readonly _fechaHasta = signal('');

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
      estado:     'COMPLETADA',              // always filter to completed only
      fechaDesde: this._fechaDesde() || undefined,
      fechaHasta: this._fechaHasta() || undefined,
      page:       this._page(),
      size:       20,
    }).subscribe({
      next: r => {
        this._citas.set(r.content);
        this._totalPages.set(r.totalPages);
        this._loading.set(false);
      },
      error: () => {
        this._error.set('Error al cargar las citas completadas.');
        this._loading.set(false);
      },
    });
  }

  _goUpload(citaId: number): void {
    this._router.navigate(['/tecnico-lab/subir-resultados', citaId]);
  }
}
