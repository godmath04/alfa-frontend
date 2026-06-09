import { Component, inject, signal } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { DatePipe } from '@angular/common';

import { Translate } from '../../../../core/services/translate';
import { LabService } from '../../../../core/services/lab/lab.service';
import { LabResult } from '../../../../core/models/lab.model';
import { Spinner } from '../../../../shared/components/spinner/spinner';
import { Button } from '../../../../shared/components/button/button';

@Component({
  selector: 'app-lab-results-search',
  standalone: true,
  imports: [LucideAngularModule, DatePipe, Spinner, Button],
  templateUrl: './lab-results-search.html',
  styleUrl: './lab-results-search.scss',
})
export class LabResultsSearchPage {

  readonly t = inject(Translate);
  private readonly _svc = inject(LabService);

  _email    = signal('');
  _idNumber = signal('');

  readonly results       = signal<LabResult[]>([]);
  readonly loading       = signal(false);
  readonly error         = signal<string | null>(null);
  readonly searched      = signal(false);
  readonly downloading   = signal<string | null>(null);
  readonly downloadError = signal<string | null>(null);

  _onSearch(): void {
    const email    = this._email().trim();
    const idNumber = this._idNumber().trim();
    if (!email && !idNumber) {
      this.error.set(this.t.get('lab.medico.searchRequired'));
      return;
    }
    this.loading.set(true);
    this.error.set(null);
    this.searched.set(true);
    this._svc.buscarResultadosMedico(email || undefined, idNumber || undefined).subscribe({
      next: list => { this.results.set(list); this.loading.set(false); },
      error: () => { this.error.set('lab.medico.searchError'); this.loading.set(false); },
    });
  }

  _download(id: string): void {
    this.downloading.set(id);
    this.downloadError.set(null);
    this._svc.getDownloadUrl(id).subscribe({
      next: ({ downloadUrl }) => { window.open(downloadUrl, '_blank'); this.downloading.set(null); },
      error: () => { this.downloadError.set('lab.errors.downloadFailed'); this.downloading.set(null); },
    });
  }
}
