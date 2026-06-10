import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { CrearPacienteRequest, EjecutivoCitaItem, PacienteSearch } from '../../models/executive.model';
import { ActivateAccountRequest, ActivateAccountResponse } from '../../models/auth.model';

@Injectable({ providedIn: 'root' })
export class ExecutiveService {

  private readonly _http     = inject(HttpClient);
  private readonly _authUrl  = `${environment.apiUrl}/api/auth`;
  private readonly _agendUrl = `${environment.apiUrl}/api/agendamiento`;

  buscarPacientes(q: string): Observable<PacienteSearch[]> {
    return this._http.get<PacienteSearch[]>(`${this._authUrl}/ejecutivo/pacientes`, { params: { q } });
  }

  obtenerPaciente(id: number): Observable<PacienteSearch> {
    return this._http.get<PacienteSearch>(`${this._authUrl}/ejecutivo/pacientes/${id}`);
  }

  crearPaciente(request: CrearPacienteRequest): Observable<PacienteSearch> {
    return this._http.post<PacienteSearch>(`${this._authUrl}/ejecutivo/pacientes`, request);
  }

  getCitasPaciente(pacienteId: number): Observable<EjecutivoCitaItem[]> {
    return this._http.get<EjecutivoCitaItem[]>(`${this._agendUrl}/citas/paciente/${pacienteId}`);
  }

  cancelarCita(citaId: number): Observable<EjecutivoCitaItem> {
    return this._http.put<EjecutivoCitaItem>(`${this._agendUrl}/citas/${citaId}/cancelar-ejecutivo`, {});
  }

  activateAccount(token: string, password: string): Observable<ActivateAccountResponse> {
    const request: ActivateAccountRequest = { token, password };
    return this._http.post<ActivateAccountResponse>(`${this._authUrl}/activate-account`, request);
  }
}
