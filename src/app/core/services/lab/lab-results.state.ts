import { Injectable, computed, signal } from '@angular/core';
import { LabResult } from '../../models/lab.model';

interface ResultsState {
  list: LabResult[];
  loading: boolean;
  error: string | null;
}

interface DownloadState {
  loadingId: string | null;
  error: string | null;
}

@Injectable({ providedIn: 'root' })
export class LabResultsState {

  private readonly _results  = signal<ResultsState>({ list: [], loading: false, error: null });
  private readonly _download = signal<DownloadState>({ loadingId: null, error: null });

  readonly results        = computed(() => this._results().list);
  readonly loading        = computed(() => this._results().loading);
  readonly error          = computed(() => this._results().error);

  readonly downloadLoading = computed(() => this._download().loadingId);
  readonly downloadError   = computed(() => this._download().error);

  setResults(list: LabResult[]): void     { this._results.update(s => ({ ...s, list })); }
  setLoading(v: boolean): void            { this._results.update(s => ({ ...s, loading: v })); }
  setError(e: string | null): void        { this._results.update(s => ({ ...s, error: e })); }

  setDownloadLoading(id: string | null): void { this._download.update(s => ({ ...s, loadingId: id })); }
  setDownloadError(e: string | null): void    { this._download.update(s => ({ ...s, error: e })); }
}
