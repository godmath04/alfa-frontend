import { Injectable, signal } from '@angular/core';
import {
  HeaderKpisResponse,
  CitasPorEstadoResponse,
  CitasPorEspecialidadResponse,
  LabEstudiosTopResponse,
  LabTurnaroundResponse,
  NotificacionesResumenResponse,
  ChatbotResumenResponse,
  TopMedicosResponse
} from '../../models/analitica.model';

@Injectable({ providedIn: 'root' })
export class AnaliticaDashboardState {
  readonly loading = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  readonly headerKpis = signal<HeaderKpisResponse | null>(null);
  readonly citasPorEstado = signal<CitasPorEstadoResponse[] | null>(null);
  readonly citasPorEspecialidad = signal<CitasPorEspecialidadResponse | null>(null);
  readonly labEstudiosTop = signal<LabEstudiosTopResponse | null>(null);
  readonly labTurnaround = signal<LabTurnaroundResponse | null>(null);
  readonly notificacionesResumen = signal<NotificacionesResumenResponse | null>(null);
  readonly chatbotResumen = signal<ChatbotResumenResponse | null>(null);
  readonly topMedicos = signal<TopMedicosResponse | null>(null);

  setLoading(val: boolean): void {
    this.loading.set(val);
  }

  setError(val: string | null): void {
    this.error.set(val);
  }

  setDashboardData(data: {
    headerKpis: HeaderKpisResponse;
    citasPorEstado: CitasPorEstadoResponse[];
    citasPorEspecialidad: CitasPorEspecialidadResponse;
    labEstudiosTop: LabEstudiosTopResponse;
    labTurnaround: LabTurnaroundResponse;
    notificacionesResumen: NotificacionesResumenResponse;
    chatbotResumen: ChatbotResumenResponse;
    topMedicos: TopMedicosResponse;
  }): void {
    this.headerKpis.set(data.headerKpis);
    this.citasPorEstado.set(data.citasPorEstado);
    this.citasPorEspecialidad.set(data.citasPorEspecialidad);
    this.labEstudiosTop.set(data.labEstudiosTop);
    this.labTurnaround.set(data.labTurnaround);
    this.notificacionesResumen.set(data.notificacionesResumen);
    this.chatbotResumen.set(data.chatbotResumen);
    this.topMedicos.set(data.topMedicos);
  }

  clearDashboard(): void {
    this.headerKpis.set(null);
    this.citasPorEstado.set(null);
    this.citasPorEspecialidad.set(null);
    this.labEstudiosTop.set(null);
    this.labTurnaround.set(null);
    this.notificacionesResumen.set(null);
    this.chatbotResumen.set(null);
    this.topMedicos.set(null);
    this.error.set(null);
    this.loading.set(false);
  }
}
