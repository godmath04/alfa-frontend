import { Injectable, computed, signal } from '@angular/core';
import { StaffLabCitaItem } from '../../models/lab.model';
import { formatDateToISO } from '../../../shared/utils/date-time.utils';

interface CalendarioStateData {
  citas: StaffLabCitaItem[];
  loading: boolean;
  error: string | null;
  fecha: string;
  actionLoading: number | null;
  downloadLoading: number | null;
}

@Injectable({ providedIn: 'root' })
export class LabCalendarioState {

  private readonly _state = signal<CalendarioStateData>({
    citas: [],
    loading: false,
    error: null,
    fecha: formatDateToISO(new Date()),
    actionLoading: null,
    downloadLoading: null,
  });

  readonly citas           = computed(() => this._state().citas);
  readonly loading         = computed(() => this._state().loading);
  readonly error           = computed(() => this._state().error);
  readonly fecha           = computed(() => this._state().fecha);
  readonly actionLoading   = computed(() => this._state().actionLoading);
  readonly downloadLoading = computed(() => this._state().downloadLoading);

  setCitas(citas: StaffLabCitaItem[]): void {
    this._state.update(s => ({ ...s, citas }));
  }

  setLoading(loading: boolean): void {
    this._state.update(s => ({ ...s, loading }));
  }

  setError(error: string | null): void {
    this._state.update(s => ({ ...s, error }));
  }

  setFecha(fecha: string): void {
    this._state.update(s => ({ ...s, fecha }));
  }

  setActionLoading(id: number | null): void {
    this._state.update(s => ({ ...s, actionLoading: id }));
  }

  setDownloadLoading(id: number | null): void {
    this._state.update(s => ({ ...s, downloadLoading: id }));
  }
}
