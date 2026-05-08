import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import {
  AttentionSchedule,
  AttentionScheduleRequest,
  DoctorProfile,
  DoctorProfileRequest,
  Office,
  OfficeRequest,
  Specialty,
  SpecialtyRequest,
  SystemConfig,
  SystemConfigRequest,
  UserProfile,
} from '../../models/admin.model';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly _http = inject(HttpClient);
  private readonly _baseUrl = `${environment.apiUrl}/api/admin`;

  // ─── Specialties ───────────────────────────────────────────────────────────

  getSpecialties(): Observable<Specialty[]> {
    return this._http.get<Specialty[]>(`${this._baseUrl}/specialties/all`);
  }

  createSpecialty(request: SpecialtyRequest): Observable<Specialty> {
    return this._http.post<Specialty>(`${this._baseUrl}/specialties`, request);
  }

  updateSpecialty(id: number, request: SpecialtyRequest): Observable<Specialty> {
    return this._http.put<Specialty>(`${this._baseUrl}/specialties/${id}`, request);
  }

  deactivateSpecialty(id: number): Observable<void> {
    return this._http.patch<void>(`${this._baseUrl}/specialties/${id}/deactivate`, {});
  }

  reactivateSpecialty(id: number): Observable<void> {
    return this._http.patch<void>(`${this._baseUrl}/specialties/${id}/reactivate`, {});
  }

  // ─── Offices ───────────────────────────────────────────────────────────────

  getOffices(): Observable<Office[]> {
    return this._http.get<Office[]>(`${this._baseUrl}/offices/all`);
  }

  createOffice(request: OfficeRequest): Observable<Office> {
    return this._http.post<Office>(`${this._baseUrl}/offices`, request);
  }

  updateOffice(id: number, request: OfficeRequest): Observable<Office> {
    return this._http.put<Office>(`${this._baseUrl}/offices/${id}`, request);
  }

  deactivateOffice(id: number): Observable<void> {
    return this._http.patch<void>(`${this._baseUrl}/offices/${id}/deactivate`, {});
  }

  reactivateOffice(id: number): Observable<void> {
    return this._http.patch<void>(`${this._baseUrl}/offices/${id}/reactivate`, {});
  }

  // ─── Attention schedules ───────────────────────────────────────────────────

  getSchedules(): Observable<AttentionSchedule[]> {
    return this._http.get<AttentionSchedule[]>(`${this._baseUrl}/schedules/all`);
  }

  createSchedule(request: AttentionScheduleRequest): Observable<AttentionSchedule> {
    return this._http.post<AttentionSchedule>(`${this._baseUrl}/schedules`, request);
  }

  updateSchedule(id: number, request: AttentionScheduleRequest): Observable<AttentionSchedule> {
    return this._http.put<AttentionSchedule>(`${this._baseUrl}/schedules/${id}`, request);
  }

  deactivateSchedule(id: number): Observable<void> {
    return this._http.patch<void>(`${this._baseUrl}/schedules/${id}/deactivate`, {});
  }

  reactivateSchedule(id: number): Observable<void> {
    return this._http.patch<void>(`${this._baseUrl}/schedules/${id}/reactivate`, {});
  }

  // ─── Doctor profiles ───────────────────────────────────────────────────────

  getDoctors(): Observable<DoctorProfile[]> {
    return this._http.get<DoctorProfile[]>(`${this._baseUrl}/doctors/all`);
  }

  createDoctor(request: DoctorProfileRequest): Observable<DoctorProfile> {
    return this._http.post<DoctorProfile>(`${this._baseUrl}/doctors`, request);
  }

  updateDoctor(id: number, request: DoctorProfileRequest): Observable<DoctorProfile> {
    return this._http.put<DoctorProfile>(`${this._baseUrl}/doctors/${id}`, request);
  }

  deactivateDoctor(id: number): Observable<void> {
    return this._http.patch<void>(`${this._baseUrl}/doctors/${id}/deactivate`, {});
  }

  reactivateDoctor(id: number): Observable<void> {
    return this._http.patch<void>(`${this._baseUrl}/doctors/${id}/reactivate`, {});
  }

  // ─── Users ─────────────────────────────────────────────────────────────────

  getUsers(): Observable<UserProfile[]> {
    return this._http.get<UserProfile[]>(`${this._baseUrl}/users`);
  }

  changeUserRole(id: number, role: string): Observable<UserProfile> {
    return this._http.patch<UserProfile>(`${this._baseUrl}/users/${id}/role`, null, {
      params: { role },
    });
  }

  // ─── System configuration ─────────────────────────────────────────────────

  getConfigs(): Observable<SystemConfig[]> {
    return this._http.get<SystemConfig[]>(`${this._baseUrl}/config/all`);
  }

  createConfig(request: SystemConfigRequest): Observable<SystemConfig> {
    return this._http.post<SystemConfig>(`${this._baseUrl}/config`, request);
  }

  updateConfig(id: number, request: SystemConfigRequest): Observable<SystemConfig> {
    return this._http.put<SystemConfig>(`${this._baseUrl}/config/${id}`, request);
  }

  deactivateConfig(id: number): Observable<void> {
    return this._http.patch<void>(`${this._baseUrl}/config/${id}/deactivate`, {});
  }

  reactivateConfig(id: number): Observable<void> {
    return this._http.patch<void>(`${this._baseUrl}/config/${id}/reactivate`, {});
  }
}
