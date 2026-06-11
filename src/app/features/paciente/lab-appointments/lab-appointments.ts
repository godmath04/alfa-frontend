import { Component, afterNextRender, inject, signal, computed } from '@angular/core';
import { DatePipe } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { lastValueFrom } from 'rxjs';

import { Translate } from '../../../core/services/translate';
import { LabService } from '../../../core/services/lab/lab.service';
import { MisLabCitasItem, LabResult } from '../../../core/models/lab.model';
import { formatToAmPm } from '../../../shared/utils/date-time.utils';

@Component({
  selector: 'app-lab-appointments',
  standalone: true,
  imports: [LucideAngularModule, DatePipe],
  templateUrl: './lab-appointments.html',
  styleUrl: './lab-appointments.scss',
})
export class LabAppointmentsComponent {

  readonly t = inject(Translate);
  private readonly _svc = inject(LabService);

  readonly _citas         = signal<MisLabCitasItem[]>([]);
  readonly _loading       = signal(true);
  readonly _error         = signal<string | null>(null);
  readonly _page          = signal(0);
  readonly _totalPages    = signal(0);
  readonly _cancellingId  = signal<number | null>(null);
  readonly _cancelError   = signal<string | null>(null);

  // Map to store lab results by appointment ID for O(1) lookup
  readonly _resultsMap    = signal<Map<number, LabResult>>(new Map());
  // Active filter state
  readonly _filter        = signal<'TODAS' | 'COMPLETADA' | 'PENDIENTE' | 'CANCELADA'>('TODAS');

  readonly _upcoming = computed(() =>
    this._citas().filter(c => c.estado === 'PENDIENTE' && (this._filter() === 'TODAS' || this._filter() === 'PENDIENTE')));
  readonly _past = computed(() =>
    this._citas().filter(c => (c.estado === 'COMPLETADA' || c.estado === 'CANCELADA') && (this._filter() === 'TODAS' || this._filter() === c.estado)));

  readonly formatToAmPm = formatToAmPm;

  constructor() {
    afterNextRender(() => this._load());
  }

  _setFilter(filter: 'TODAS' | 'COMPLETADA' | 'PENDIENTE' | 'CANCELADA'): void {
    this._filter.set(filter);
  }

  _prevPage(): void {
    if (this._page() > 0) { this._page.update(p => p - 1); this._load(); }
  }

  _nextPage(): void {
    if (this._page() < this._totalPages() - 1) { this._page.update(p => p + 1); this._load(); }
  }

  private async _load(): Promise<void> {
    this._loading.set(true);
    this._error.set(null);
    try {
      // Load both appointments and lab results in parallel using lastValueFrom
      const [pageCitas, resultados] = await Promise.all([
        lastValueFrom(this._svc.getMisLabCitas(undefined, undefined, undefined, this._page(), 10)),
        lastValueFrom(this._svc.getMisResultados())
      ]);

      const map = new Map<number, LabResult>();
      for (const res of resultados) {
        if (res.citaId) {
          map.set(res.citaId, res);
        }
      }
      this._resultsMap.set(map);

      this._citas.set(pageCitas.content);
      this._totalPages.set(pageCitas.totalPages);
    } catch (err) {
      this._error.set(this.t.get('lab.appointments.errorLoading'));
    } finally {
      this._loading.set(false);
    }
  }

  async _viewPdf(citaId: number): Promise<void> {
    const result = this._resultsMap().get(citaId);
    if (!result?.id) return;
    try {
      const res = await lastValueFrom(this._svc.getDownloadUrl(result.id));
      window.open(res.downloadUrl, '_blank');
    } catch (err) {
      console.error('Error opening PDF', err);
    }
  }

  async _downloadPdf(citaId: number): Promise<void> {
    const result = this._resultsMap().get(citaId);
    if (!result?.id) return;
    try {
      const res = await lastValueFrom(this._svc.getDownloadUrl(result.id));
      const a = document.createElement('a');
      a.href = res.downloadUrl;
      a.download = `Resultado_${citaId}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error downloading PDF', err);
    }
  }

  _cancel(citaId: number): void {
    this._cancellingId.set(citaId);
    this._cancelError.set(null);
    this._svc.cancelarMiLabCita(citaId).subscribe({
      next: () => {
        this._cancellingId.set(null);
        this._citas.update(list =>
          list.map(c => c.citaId === citaId ? { ...c, estado: 'CANCELADA' } : c));
      },
      error: () => {
        this._cancellingId.set(null);
        this._cancelError.set(this.t.get('lab.appointments.cancelError'));
      },
    });
  }
}
