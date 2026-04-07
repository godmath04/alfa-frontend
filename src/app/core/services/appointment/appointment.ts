// src/app/core/services/appointment/appointment.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { SpecialtyCatalog } from '../../models/appointment.model';

@Injectable({ providedIn: 'root' })
export class AppointmentService {

  private readonly _http = inject(HttpClient);
  private get baseUrl() { return environment.apiUrl; }

  // Fetches specialties from the API Gateway
  getSpecialties(): Observable<SpecialtyCatalog[]> {
    return this._http.get<SpecialtyCatalog[]>(`${this.baseUrl}/api/agendamiento/especialidades`);
  }
}
