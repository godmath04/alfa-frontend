import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import {
  LabCatalog, LabDisponibilidad, LabCitaRequest, LabCitaResponse,
  MisLabCitasItem, StaffLabCitaItem, LabResult, GuestResult,
  StudyType, InsuranceType, Laboratory,
  LaboratoryRequest, LaboratoryScheduleRequest, LabSchedule,
  StudyTypeRequest, InsuranceTypeRequest,
} from '../../models/lab.model';
import { PageResponse } from '../../models/appointment.model';

@Injectable({ providedIn: 'root' })
export class LabService {

  private readonly _http = inject(HttpClient);
  private get api() { return environment.apiUrl; }

  // ─── Agendamiento: lab catalog ────────────────────────────────────────────

  getLabs(): Observable<LabCatalog[]> {
    return this._http.get<LabCatalog[]>(`${this.api}/api/agendamiento/labs`);
  }

  getLabDisponibilidad(labId: number, fecha: string): Observable<LabDisponibilidad> {
    const params = new HttpParams().set('fecha', fecha);
    return this._http.get<LabDisponibilidad>(
      `${this.api}/api/agendamiento/labs/${labId}/disponibilidad`, { params });
  }

  // ─── Agendamiento: booking ────────────────────────────────────────────────

  crearLabCita(request: LabCitaRequest): Observable<LabCitaResponse> {
    return this._http.post<LabCitaResponse>(`${this.api}/api/agendamiento/lab-citas`, request);
  }

  getMisLabCitas(
    estado?: string, fechaDesde?: string, fechaHasta?: string,
    page = 0, size = 10
  ): Observable<PageResponse<MisLabCitasItem>> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (estado)     params = params.set('estado', estado);
    if (fechaDesde) params = params.set('fechaDesde', fechaDesde);
    if (fechaHasta) params = params.set('fechaHasta', fechaHasta);
    return this._http.get<PageResponse<MisLabCitasItem>>(
      `${this.api}/api/agendamiento/lab-citas/mis-citas`, { params });
  }

  cancelarMiLabCita(citaId: number): Observable<unknown> {
    return this._http.put(`${this.api}/api/agendamiento/lab-citas/${citaId}/cancelar`, {});
  }

  cancelarLabCitaEjecutivo(citaId: number): Observable<unknown> {
    return this._http.put(`${this.api}/api/agendamiento/lab-citas/${citaId}/cancelar-ejecutivo`, {});
  }

  completarLabCita(citaId: number): Observable<unknown> {
    return this._http.patch(`${this.api}/api/agendamiento/lab-citas/${citaId}/completar`, {});
  }

  getLabCitasStaff(params: {
    estado?: string;
    fechaDesde?: string;
    fechaHasta?: string;
    page?: number;
    size?: number;
  }): Observable<PageResponse<StaffLabCitaItem>> {
    let p = new HttpParams()
      .set('page', params.page ?? 0)
      .set('size', params.size ?? 20);
    if (params.estado)     p = p.set('estado', params.estado);
    if (params.fechaDesde) p = p.set('fechaDesde', params.fechaDesde);
    if (params.fechaHasta) p = p.set('fechaHasta', params.fechaHasta);
    return this._http.get<PageResponse<StaffLabCitaItem>>(
      `${this.api}/api/agendamiento/lab-citas`, { params: p });
  }

  // ─── Laboratorio: patient results ─────────────────────────────────────────

  getMisResultados(): Observable<LabResult[]> {
    return this._http.get<LabResult[]>(`${this.api}/api/laboratorio/mis-resultados`);
  }

  getResultado(id: string): Observable<LabResult> {
    return this._http.get<LabResult>(`${this.api}/api/laboratorio/resultados/${id}`);
  }

  getDownloadUrl(id: string): Observable<{ downloadUrl: string }> {
    return this._http.get<{ downloadUrl: string }>(
      `${this.api}/api/laboratorio/resultados/${id}/descargar`);
  }

  // ─── Laboratorio: guest ───────────────────────────────────────────────────

  getGuestResultado(token: string): Observable<GuestResult> {
    const params = new HttpParams().set('token', token);
    return this._http.get<GuestResult>(`${this.api}/api/laboratorio/guest/resultado`, { params });
  }

  getGuestDownloadUrl(token: string): Observable<{ downloadUrl: string }> {
    const params = new HttpParams().set('token', token);
    return this._http.get<{ downloadUrl: string }>(
      `${this.api}/api/laboratorio/guest/resultado/descargar`, { params });
  }

  // ─── Laboratorio: staff ───────────────────────────────────────────────────

  subirResultado(citaId: number, file: File): Observable<LabResult> {
    const fd = new FormData();
    fd.append('archivo', file);
    return this._http.post<LabResult>(
      `${this.api}/api/laboratorio/resultados/${citaId}/subir`, fd);
  }

  getDownloadUrlByCitaId(citaId: number): Observable<{ downloadUrl: string }> {
    return this._http.get<{ downloadUrl: string }>(
      `${this.api}/api/laboratorio/resultados/cita/${citaId}/descargar`);
  }

  reenviarToken(citaId: number): Observable<GuestResult> {
    return this._http.post<GuestResult>(
      `${this.api}/api/laboratorio/resultados/${citaId}/reenviar-token`, {});
  }

  // ─── Laboratorio: médico ──────────────────────────────────────────────────

  buscarResultadosMedico(
    pacienteEmail?: string, pacienteIdNumber?: string
  ): Observable<LabResult[]> {
    let params = new HttpParams();
    if (pacienteEmail)    params = params.set('pacienteEmail', pacienteEmail);
    if (pacienteIdNumber) params = params.set('pacienteIdNumber', pacienteIdNumber);
    return this._http.get<LabResult[]>(
      `${this.api}/api/laboratorio/resultados/medico/buscar`, { params });
  }

  // ─── Admin: study types ───────────────────────────────────────────────────

  getStudyTypes(): Observable<StudyType[]> {
    return this._http.get<StudyType[]>(`${this.api}/api/admin/study-types`);
  }

  getAllStudyTypes(): Observable<StudyType[]> {
    return this._http.get<StudyType[]>(`${this.api}/api/admin/study-types/all`);
  }

  createStudyType(req: StudyTypeRequest): Observable<StudyType> {
    return this._http.post<StudyType>(`${this.api}/api/admin/study-types`, req);
  }

  updateStudyType(id: number, req: StudyTypeRequest): Observable<StudyType> {
    return this._http.put<StudyType>(`${this.api}/api/admin/study-types/${id}`, req);
  }

  deactivateStudyType(id: number): Observable<void> {
    return this._http.patch<void>(`${this.api}/api/admin/study-types/${id}/deactivate`, {});
  }

  reactivateStudyType(id: number): Observable<StudyType> {
    return this._http.patch<StudyType>(`${this.api}/api/admin/study-types/${id}/reactivate`, {});
  }

  // ─── Admin: insurance types ───────────────────────────────────────────────

  getInsuranceTypes(): Observable<InsuranceType[]> {
    return this._http.get<InsuranceType[]>(`${this.api}/api/admin/insurance-types`);
  }

  getAllInsuranceTypes(): Observable<InsuranceType[]> {
    return this._http.get<InsuranceType[]>(`${this.api}/api/admin/insurance-types/all`);
  }

  createInsuranceType(req: InsuranceTypeRequest): Observable<InsuranceType> {
    return this._http.post<InsuranceType>(`${this.api}/api/admin/insurance-types`, req);
  }

  updateInsuranceType(id: number, req: InsuranceTypeRequest): Observable<InsuranceType> {
    return this._http.put<InsuranceType>(`${this.api}/api/admin/insurance-types/${id}`, req);
  }

  deactivateInsuranceType(id: number): Observable<void> {
    return this._http.patch<void>(`${this.api}/api/admin/insurance-types/${id}/deactivate`, {});
  }

  reactivateInsuranceType(id: number): Observable<InsuranceType> {
    return this._http.patch<InsuranceType>(`${this.api}/api/admin/insurance-types/${id}/reactivate`, {});
  }

  // ─── Admin: laboratories ──────────────────────────────────────────────────

  getAllLaboratories(): Observable<Laboratory[]> {
    return this._http.get<Laboratory[]>(`${this.api}/api/admin/laboratories/all`);
  }

  createLaboratory(req: LaboratoryRequest): Observable<Laboratory> {
    return this._http.post<Laboratory>(`${this.api}/api/admin/laboratories`, req);
  }

  updateLaboratory(id: number, req: LaboratoryRequest): Observable<Laboratory> {
    return this._http.put<Laboratory>(`${this.api}/api/admin/laboratories/${id}`, req);
  }

  deactivateLaboratory(id: number): Observable<void> {
    return this._http.patch<void>(`${this.api}/api/admin/laboratories/${id}/deactivate`, {});
  }

  reactivateLaboratory(id: number): Observable<Laboratory> {
    return this._http.patch<Laboratory>(`${this.api}/api/admin/laboratories/${id}/reactivate`, {});
  }

  upsertLabSchedule(labId: number, req: LaboratoryScheduleRequest): Observable<LabSchedule> {
    return this._http.put<LabSchedule>(`${this.api}/api/admin/laboratories/${labId}/schedules`, req);
  }

  deleteLabSchedule(labId: number, scheduleId: number): Observable<void> {
    return this._http.delete<void>(
      `${this.api}/api/admin/laboratories/${labId}/schedules/${scheduleId}`);
  }
}
