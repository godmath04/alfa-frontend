import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  AnaliticaHealthResponse,
  HeaderKpisResponse,
  CitasPorEstadoResponse,
  CitasPorEspecialidadResponse,
  LabEstudiosTopResponse,
  LabTurnaroundResponse,
  NotificacionesResumenResponse,
  ChatbotResumenResponse,
  TopMedicosResponse,
  TendenciaInasistenciaResponse,
  AnaliticaLaboratorioResponse,
  ConsultorioEstado,
  ConsultorioAgendaItem
} from '../../models/analitica.model';

@Injectable({ providedIn: 'root' })
export class AnaliticaService {
  private readonly _http = inject(HttpClient);
  // Volvemos a usar el API Gateway (8080) que maneja el CORS y los Headers
  private readonly _apiUrl = `${environment.apiUrl}/api/analitica`;

  checkHealth(): Observable<AnaliticaHealthResponse> {
    // El Gateway inyecta automáticamente el X-User-Role validando tu JWT
    return this._http.get<AnaliticaHealthResponse>(`${this._apiUrl}/health`);
  }

  getHeaderKpis(): Observable<HeaderKpisResponse> {
    return this._http.get<HeaderKpisResponse>(`${this._apiUrl}/dashboard/header-kpis`);
  }

  getCitasPorEstado(months: number = 6, groupBy: string = 'MONTH'): Observable<CitasPorEstadoResponse[]> {
    return this._http.get<CitasPorEstadoResponse[]>(`${this._apiUrl}/dashboard/citas-por-estado`, { params: { months, groupBy } });
  }

  getCitasPorEspecialidad(months: number = 1): Observable<CitasPorEspecialidadResponse> {
    return this._http.get<CitasPorEspecialidadResponse>(`${this._apiUrl}/dashboard/citas-por-especialidad`, { params: { months } });
  }

  getLabEstudiosTop(limit: number = 5): Observable<LabEstudiosTopResponse> {
    return this._http.get<LabEstudiosTopResponse>(`${this._apiUrl}/dashboard/lab-estudios-top`, { params: { limit } });
  }

  getLabTurnaround(): Observable<LabTurnaroundResponse> {
    return this._http.get<LabTurnaroundResponse>(`${this._apiUrl}/dashboard/lab-turnaround`);
  }

  getNotificacionesResumen(): Observable<NotificacionesResumenResponse> {
    return this._http.get<NotificacionesResumenResponse>(`${this._apiUrl}/dashboard/notificaciones-resumen`);
  }

  getChatbotResumen(): Observable<ChatbotResumenResponse> {
    return this._http.get<ChatbotResumenResponse>(`${this._apiUrl}/dashboard/chatbot-resumen`);
  }

  getTopMedicos(limit: number = 5): Observable<TopMedicosResponse> {
    return this._http.get<TopMedicosResponse>(`${this._apiUrl}/dashboard/top-medicos`, { params: { limit } });
  }

  getMedicosPorEspecialidad(): Observable<CitasPorEspecialidadResponse> {
    return this._http.get<CitasPorEspecialidadResponse>(`${this._apiUrl}/dashboard/medicos-por-especialidad`);
  }

  getTendenciaInasistencia(months: number = 6, groupBy: string = 'WEEK'): Observable<TendenciaInasistenciaResponse[]> {
    return this._http.get<TendenciaInasistenciaResponse[]>(`${this._apiUrl}/dashboard/inasistencia`, { params: { months, groupBy } });
  }

  getAnaliticaLaboratorio(months: number = 6): Observable<AnaliticaLaboratorioResponse> {
    return this._http.get<AnaliticaLaboratorioResponse>(`${this._apiUrl}/dashboard/laboratorio`, { params: { months } });
  }

  getConsultoriosEstado(): Observable<ConsultorioEstado[]> {
    return this._http.get<ConsultorioEstado[]>(`${this._apiUrl}/consultorios/estado`);
  }

  getConsultorioAgenda(officeId: number, desde: string, hasta: string): Observable<ConsultorioAgendaItem[]> {
    return this._http.get<ConsultorioAgendaItem[]>(`${this._apiUrl}/consultorios/${officeId}/agenda`, {
      params: { desde, hasta }
    });
  }
}
