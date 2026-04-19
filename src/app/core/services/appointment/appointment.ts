import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import { environment } from '../../../../environments/environment';
import {
  SpecialtyCatalog,
  SpecialtyDoctor,
  DoctorAvailability,
  CreateAppointmentRequest,
  AppointmentResponse,
  QuickProposalResponse,
  ConfirmQuickRequest
} from '../../models/appointment.model';

// Backend response types for internal mapping (not exported)
interface MedicoResponse {
  id: number;
  nombre: string;
  apellido: string;
  fotoPerfil: string | null;
  calificacion: number;
  experienciaAnios: number;
  tipoAtencion: 'INTERNO' | 'EXTERNO';
  consultorioIdAsignado: number | null;
  consultorioNumeroAsignado: number | null;
}

interface DisponibilidadResponse {
  medicoId: number;
  medicoNombre: string;
  fecha: string;
  duracionSlotMinutos: number;
  horariosDisponibles: string[];
}

interface CitaResponse {
  id: number;
  pacienteId: number;
  pacienteNombre: string;
  medicoNombre: string;
  especialidad: string;
  consultorioNumero: number;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  motivo: string;
  estado: 'PENDIENTE' | 'CONFIRMADA' | 'CANCELADA' | 'COMPLETADA';
}

interface PropuestaResponse {
  reservaId: string;
  medicoId: number;
  medicoNombre: string;
  especialidadId: number;
  especialidadNombre: string;
  consultorioId: number;
  consultorioNumero: number;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  expiraEnSegundos: number;
  mensaje: string;
}

@Injectable({ providedIn: 'root' })
export class AppointmentService {

  private readonly _http = inject(HttpClient);
  private get baseUrl() { return environment.apiUrl; }

  // ─── Catalog ───────────────────────────────────────

  // Fetches specialties from the API Gateway
  getSpecialties(): Observable<SpecialtyCatalog[]> {
    return this._http.get<SpecialtyCatalog[]>(`${this.baseUrl}/api/agendamiento/especialidades`);
  }

  getDoctorsBySpecialty(specialtyId: number): Observable<SpecialtyDoctor[]> {
    return this._http.get<MedicoResponse[]>(`${this.baseUrl}/api/agendamiento/especialidades/${specialtyId}/medicos`)
      .pipe(
        map(response => response.map(doctor => ({
          id: doctor.id,
          firstName: doctor.nombre,
          lastName: doctor.apellido,
          profilePicture: doctor.fotoPerfil,
          rating: doctor.calificacion,
          yearsOfExperience: doctor.experienciaAnios,
          careType: doctor.tipoAtencion,
          assignedOfficeId: doctor.consultorioIdAsignado,
          assignedOfficeNumber: doctor.consultorioNumeroAsignado
        })))
      );
  }

  // ─── Availability ──────────────────────────────────

  getAvailability(doctorId: number, date: string): Observable<DoctorAvailability> {
    const params = new HttpParams()
      .set('medicoId', doctorId.toString())
      .set('fecha', date);

    return this._http.get<DisponibilidadResponse>(`${this.baseUrl}/api/agendamiento/disponibilidad`, { params })
      .pipe(
        map(response => ({
          doctorId: response.medicoId,
          doctorName: response.medicoNombre,
          date: response.fecha,
          availableTimes: response.horariosDisponibles,
          slotDurationMinutes: response.duracionSlotMinutos
        }))
      );
  }

  // ─── Manual appointment ────────────────────────────

  createAppointment(request: CreateAppointmentRequest): Observable<AppointmentResponse> {
    return this._http.post<CitaResponse>(`${this.baseUrl}/api/agendamiento/citas`, request)
      .pipe(map(r => this._mapCitaResponse(r)));
  }

  // ─── Quick appointment ─────────────────────────────

  getQuickProposal(specialtyId: number, date: string): Observable<QuickProposalResponse> {
    const params = new HttpParams()
      .set('especialidadId', specialtyId.toString())
      .set('fecha', date);

    return this._http.get<PropuestaResponse>(`${this.baseUrl}/api/agendamiento/citas/rapida/propuesta`, { params })
      .pipe(
        map(r => ({
          reservationId: r.reservaId,
          doctorId: r.medicoId,
          doctorName: r.medicoNombre,
          specialtyId: r.especialidadId,
          specialtyName: r.especialidadNombre,
          officeId: r.consultorioId,
          officeNumber: r.consultorioNumero,
          date: r.fecha,
          startTime: r.horaInicio,
          endTime: r.horaFin,
          expiresInSeconds: r.expiraEnSegundos,
          message: r.mensaje
        }))
      );
  }

  confirmQuickAppointment(request: ConfirmQuickRequest): Observable<AppointmentResponse> {
    return this._http.post<CitaResponse>(`${this.baseUrl}/api/agendamiento/citas/rapida/confirmar`, request)
      .pipe(map(r => this._mapCitaResponse(r)));
  }

  cancelQuickProposal(): Observable<void> {
    return this._http.delete<void>(`${this.baseUrl}/api/agendamiento/citas/rapida/propuesta`);
  }

  // ─── Shared mapping helper ─────────────────────────

  private _mapCitaResponse(r: CitaResponse): AppointmentResponse {
    return {
      id: r.id,
      patientId: r.pacienteId,
      patientName: r.pacienteNombre,
      doctorName: r.medicoNombre,
      specialty: r.especialidad,
      officeNumber: r.consultorioNumero,
      date: r.fecha,
      startTime: r.horaInicio,
      endTime: r.horaFin,
      reason: r.motivo,
      status: r.estado
    };
  }
}
