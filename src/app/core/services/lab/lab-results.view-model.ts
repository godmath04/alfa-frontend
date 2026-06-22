import { Injectable, inject } from '@angular/core';

import { LabResultsState } from './lab-results.state';
import { LabService } from './lab.service';

@Injectable({ providedIn: 'root' })
export class LabResultsViewModel {

  private readonly _state = inject(LabResultsState);
  private readonly _svc   = inject(LabService);

  readonly results         = this._state.results;
  readonly loading         = this._state.loading;
  readonly error           = this._state.error;
  readonly downloadLoading = this._state.downloadLoading;
  readonly downloadError   = this._state.downloadError;

  loadMisResultados(): void {
    this._state.setLoading(true);
    this._state.setError(null);
    this._svc.getMisResultados().subscribe({
      next:  list => { this._state.setResults(list); this._state.setLoading(false); },
      error: ()   => { this._state.setError('lab.errors.loadResults'); this._state.setLoading(false); },
    });
  }

  view(id: string): void {
    this._state.setDownloadLoading(id);
    this._state.setDownloadError(null);
    this._svc.getDownloadUrl(id).subscribe({
      next: ({ downloadUrl }) => {
        window.open(downloadUrl, '_blank');
        this._state.setDownloadLoading(null);
      },
      error: () => {
        this._state.setDownloadError('lab.errors.downloadFailed');
        this._state.setDownloadLoading(null);
      },
    });
  }

  download(id: string): void {
    this._state.setDownloadLoading(id);
    this._state.setDownloadError(null);
    this._svc.getDownloadUrl(id).subscribe({
      next: ({ downloadUrl }) => {
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = `Resultado_${id}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        this._state.setDownloadLoading(null);
      },
      error: () => {
        this._state.setDownloadError('lab.errors.downloadFailed');
        this._state.setDownloadLoading(null);
      },
    });
  }
}
