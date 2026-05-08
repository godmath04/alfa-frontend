import { Injectable, inject } from '@angular/core';
import { ApiError } from '../models/api-error.model';
import { Translate } from './translate';

@Injectable({ providedIn: 'root' })
export class ErrorMapperService {
  private readonly _translate = inject(Translate);

  /** Maps a typed ApiError to a user-facing message for a given i18n fallback key. */
  map(err: ApiError, fallbackKey: string): string {
    if (err.status === 400 && err.error.message) return err.error.message;
    return this._translate.get(fallbackKey);
  }

  /** Specialised mapper for appointment creation (handles 409 conflict). */
  mapCreateError(err: ApiError): string {
    if (err.status === 409)
      return this._translate.get('paciente.appointments.errors.slot-conflict');
    return this.map(err, 'paciente.appointments.errors.create-failed');
  }

  /** Specialised mapper for availability errors (parses backend message content). */
  mapAvailabilityError(err: ApiError): string {
    if (err.status === 400 && err.error.message) {
      const detail = err.error.message.toLowerCase();
      if (detail.includes('encontrado'))
        return this._translate.get('paciente.appointments.errors.doctor-not-found');
      if (detail.includes('atiende'))
        return this._translate.get('paciente.appointments.errors.doctor-not-available');
      return err.error.message;
    }
    return this._translate.get('paciente.appointments.errors.doctor-not-available');
  }
}
