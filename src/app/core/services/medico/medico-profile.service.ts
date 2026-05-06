import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';

export interface MedicoProfile {
  id:           number;
  nombre:       string;
  apellido:     string;
  email:        string;
  tipo:         string;
  officeId:     number | null;
  officeNumber: string | null;
}

@Injectable({ providedIn: 'root' })
export class MedicoProfileService {

  private readonly _http = inject(HttpClient);
  private readonly _base = `${environment.apiUrl}/api/agendamiento/medico`;

  getProfile(): Observable<MedicoProfile> {
    return this._http.get<MedicoProfile>(`${this._base}/me`);
  }
}
