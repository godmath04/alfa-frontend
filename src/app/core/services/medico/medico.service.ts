import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment } from '../../../../environments/environment';
import { DailyAgenda, DoctorAppointment } from '../../models/medico.model';

interface RawAppointment {
  id:                number;
  pacienteId:        number;
  pacienteNombre:    string;
  especialidad:      string;
  consultorioNumero: number;
  fecha:             string;
  horaInicio:        string;
  horaFin:           string;
  motivo:            string;
  estado:            string;
}

interface RawDailyAgenda {
  fecha: string;
  citas: RawAppointment[];
}

@Injectable({ providedIn: 'root' })
export class MedicoService {

  private readonly _http    = inject(HttpClient);
  private readonly _baseUrl = `${environment.apiUrl}/api/agendamiento`;

  getWeeklyAgenda(date: string): Observable<DailyAgenda[]> {
    const params = new HttpParams().set('fecha', date);
    return this._http
      .get<RawDailyAgenda[]>(`${this._baseUrl}/medico/agenda-semanal`, { params })
      .pipe(map(raw => raw.map(this._mapDailyAgenda)));
  }

  completeAppointment(id: number): Observable<void> {
    return this._http.patch<void>(`${this._baseUrl}/citas/${id}/completar`, {});
  }

  cancelAppointment(id: number): Observable<void> {
    return this._http.put<void>(`${this._baseUrl}/citas/${id}/cancelar`, {});
  }

  private _mapDailyAgenda(raw: RawDailyAgenda): DailyAgenda {
    return {
      date:         raw.fecha,
      appointments: raw.citas.map(c => ({
        id:           c.id,
        patientId:    c.pacienteId,
        patientName:  c.pacienteNombre,
        specialty:    c.especialidad,
        officeNumber: c.consultorioNumero,
        date:         c.fecha,
        startTime:    c.horaInicio,
        endTime:      c.horaFin,
        reason:       c.motivo,
        status:       c.estado as DoctorAppointment['status'],
      })),
    };
  }
}
