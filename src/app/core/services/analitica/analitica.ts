import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AnaliticaHealthResponse } from '../../models/analitica.model';

@Injectable({ providedIn: 'root' })
export class AnaliticaService {
  private readonly _http = inject(HttpClient);
  // Volvemos a usar el API Gateway (8080) que maneja el CORS y los Headers
  private readonly _apiUrl = `${environment.apiUrl}/api/analitica`;

  checkHealth(): Observable<AnaliticaHealthResponse> {
    // El Gateway inyecta automáticamente el X-User-Role validando tu JWT
    return this._http.get<AnaliticaHealthResponse>(`${this._apiUrl}/health`);
  }
}
