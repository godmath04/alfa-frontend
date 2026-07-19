import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { LogPage, NotificationLogPage } from '../../models/admin.model';

@Injectable({ providedIn: 'root' })
export class SystemLogsService {
  private readonly _http = inject(HttpClient);
  private readonly _apiUrl = `${environment.apiUrl}/api/admin`;

  getLogs(filters: {
    servicio?: string;
    nivel?: string;
    fechaDesde?: string;
    fechaHasta?: string;
    pagina?: number;
  }): Observable<LogPage> {
    let params = new HttpParams();
    if (filters.servicio && filters.servicio !== 'TODOS') params = params.set('servicio', filters.servicio);
    if (filters.nivel && filters.nivel !== 'TODOS') params = params.set('nivel', filters.nivel);
    if (filters.fechaDesde) params = params.set('fechaDesde', filters.fechaDesde);
    if (filters.fechaHasta) params = params.set('fechaHasta', filters.fechaHasta);
    if (filters.pagina) params = params.set('pagina', filters.pagina.toString());

    return this._http.get<LogPage>(`${this._apiUrl}/logs`, { params });
  }

  getFailedNotificationsLogs(pagina: number = 1): Observable<NotificationLogPage> {
    return this._http.get<NotificationLogPage>(`${this._apiUrl}/notificaciones/logs`, {
      params: new HttpParams().set('pagina', pagina.toString())
    });
  }
}
