// src/app/core/services/appointment/appointment.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { SpecialtyCatalog, SpecialtyDoctor, DoctorAvailability } from '../../models/appointment.model';

@Injectable({ providedIn: 'root' })
export class AppointmentService {

  private readonly _http = inject(HttpClient);
  private get baseUrl() { return environment.apiUrl; }

  // Fetches specialties from the API Gateway
  getSpecialties(): Observable<SpecialtyCatalog[]> {
    return this._http.get<SpecialtyCatalog[]>(`${this.baseUrl}/api/agendamiento/especialidades`);
  }

  getDoctorsBySpecialty(specialtyId: number): Observable<SpecialtyDoctor[]> {
    return this._http.get<any[]>(`${this.baseUrl}/api/agendamiento/especialidades/${specialtyId}/medicos`)
      .pipe(
        map(response => response.map(doctor => ({
          id: doctor.id,
          firstName: doctor.nombre,
          lastName: doctor.apellido,
          profilePicture: doctor.fotoPerfil,
          rating: doctor.calificacion,
          yearsOfExperience: doctor.experienciaAnios
        })))
      );
  }

  getAvailability(doctorId: number, date: string): Observable<DoctorAvailability> {
    const params = new HttpParams()
      .set('medicoId', doctorId.toString())
      .set('fecha', date);

    return this._http.get<any>(`${this.baseUrl}/api/agendamiento/disponibilidad`, { params })
      .pipe(
        map(response => ({
          doctorId: response.medicoId,
          doctorName: response.medicoNombre,
          date: response.fecha,
          availableTimes: response.horariosDisponibles
        }))
      );
  }
}
