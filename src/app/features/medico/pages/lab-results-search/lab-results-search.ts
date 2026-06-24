import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { DatePipe } from '@angular/common';

import { LabService } from '../../../../core/services/lab/lab.service';
import { LabResult } from '../../../../core/models/lab.model';

@Component({
  selector: 'app-lab-results-search',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './lab-results-search.html',
  styleUrl: './lab-results-search.scss',
})
export class LabResultsSearchPage implements OnInit {

  private readonly _svc = inject(LabService);

  readonly results       = signal<LabResult[]>([]);
  readonly loading       = signal(false);
  readonly error         = signal<string | null>(null);
  readonly searched      = signal(false);
  readonly downloading   = signal<string | null>(null);
  readonly downloadError = signal<string | null>(null);

  readonly _email    = signal('');
  readonly _idNumber = signal('');

  readonly _canSearch = computed(() =>
    this._email().trim().length > 0 || this._idNumber().trim().length > 0
  );

  readonly _hasAnyFilter = computed(() =>
    this._email().trim().length > 0 || this._idNumber().trim().length > 0
  );

  ngOnInit(): void {
  }

  _onSearch(): void {
    if (!this._canSearch()) return;
    this.loading.set(true);
    this.error.set(null);
    this.searched.set(true);
    const email    = this._email().trim();
    const idNumber = this._idNumber().trim();

    this._svc.buscarResultadosMedico(email || undefined, idNumber || undefined).subscribe({
      next:  list => { this.results.set(list); this.loading.set(false); },
      error: ()   => { this.error.set('error'); this.loading.set(false); },
    });
  }

  _loadAll(): void {
    this.loading.set(true);
    this.error.set(null);
    this.searched.set(true);
    this._svc.buscarResultadosMedico(undefined, undefined).subscribe({
      next:  list => { this.results.set(list); this.loading.set(false); },
      error: ()   => { this.error.set('error'); this.loading.set(false); },
    });
  }

  _clearSearch(): void {
    this._email.set('');
    this._idNumber.set('');
    this.results.set([]);
    this.searched.set(false);
    this.error.set(null);
  }

  _view(id: string): void {
    this.downloading.set(id);
    this.downloadError.set(null);
    this._svc.getDownloadUrl(id, true).subscribe({
      next:  ({ downloadUrl }) => { window.open(downloadUrl, '_blank'); this.downloading.set(null); },
      error: ()                => { this.downloadError.set('error'); this.downloading.set(null); },
    });
  }

  _download(id: string): void {
    this.downloading.set(id);
    this.downloadError.set(null);
    this._svc.getDownloadUrl(id).subscribe({
      next: ({ downloadUrl }) => {
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = `Resultado_${id}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        this.downloading.set(null);
      },
      error: () => { this.downloadError.set('error'); this.downloading.set(null); },
    });
  }
}
