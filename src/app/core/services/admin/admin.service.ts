import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { Specialty, SpecialtyRequest } from '../../models/admin.model';

@Injectable({ providedIn: 'root' })
export class AdminService {

  private readonly _http    = inject(HttpClient);
  private readonly _baseUrl = `${environment.apiUrl}/api/admin`;

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
}
