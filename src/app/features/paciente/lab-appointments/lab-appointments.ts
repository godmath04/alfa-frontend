import { Component, afterNextRender, inject, signal, computed } from '@angular/core';
import { DatePipe } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';

import { Translate } from '../../../core/services/translate';
import { LabService } from '../../../core/services/lab/lab.service';
import { MisLabCitasItem } from '../../../core/models/lab.model';
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

  readonly _upcoming = computed(() =>
    this._citas().filter(c => c.estado === 'PENDIENTE'));
  readonly _past = computed(() =>
    this._citas().filter(c => c.estado === 'COMPLETADA' || c.estado === 'CANCELADA'));

  readonly formatToAmPm = formatToAmPm;

  constructor() {
    afterNextRender(() => this._load());
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
    this._svc.getMisLabCitas(undefined, undefined, undefined, this._page(), 10).subscribe({
      next: r => {
        this._citas.set(r.content);
        this._totalPages.set(r.totalPages);
        this._loading.set(false);
      },
      error: () => {
        this._error.set(this.t.get('lab.appointments.errorLoading'));
        this._loading.set(false);
      },
    });
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
