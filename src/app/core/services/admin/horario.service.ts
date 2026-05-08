import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { Horario, HorarioRequest } from '../../models/admin.model';

@Injectable({ providedIn: 'root' })
export class HorarioService {
  private readonly _http = inject(HttpClient);
  private readonly _baseUrl = `${environment.apiUrl}/api/agendamiento/medico`;

  getByMedico(medicoId: number): Observable<Horario[]> {
    return this._http.get<Horario[]>(`${this._baseUrl}/${medicoId}/horarios`);
  }

  upsert(medicoId: number, request: HorarioRequest): Observable<Horario> {
    return this._http.put<Horario>(`${this._baseUrl}/${medicoId}/horarios`, request);
  }

  delete(medicoId: number, horarioId: number): Observable<void> {
    return this._http.delete<void>(`${this._baseUrl}/${medicoId}/horarios/${horarioId}`);
  }
}
