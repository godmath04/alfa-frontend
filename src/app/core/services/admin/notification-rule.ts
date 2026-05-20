import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import { environment } from '../../../../environments/environment';
import {
  NotificationRuleRequest,
  NotificationRuleResponse,
  SystemConfig,
} from '../../models/admin.model';

@Injectable({ providedIn: 'root' })
export class NotificationRuleService {

  private readonly _http    = inject(HttpClient);
  private readonly _baseUrl = `${environment.apiUrl}/api/admin`;

  // ─── Notification Rules ────────────────────────────────────────────────────

  getAll(): Observable<NotificationRuleResponse[]> {
    return this._http.get<NotificationRuleResponse[]>(`${this._baseUrl}/notification-rules`);
  }

  getActive(): Observable<NotificationRuleResponse[]> {
    return this._http.get<NotificationRuleResponse[]>(`${this._baseUrl}/notification-rules/active`);
  }

  getById(id: number): Observable<NotificationRuleResponse> {
    return this._http.get<NotificationRuleResponse>(`${this._baseUrl}/notification-rules/${id}`);
  }

  create(data: NotificationRuleRequest): Observable<NotificationRuleResponse> {
    return this._http.post<NotificationRuleResponse>(`${this._baseUrl}/notification-rules`, data);
  }

  update(id: number, data: NotificationRuleRequest): Observable<NotificationRuleResponse> {
    return this._http.put<NotificationRuleResponse>(`${this._baseUrl}/notification-rules/${id}`, data);
  }

  toggle(id: number): Observable<void> {
    return this._http.patch<void>(`${this._baseUrl}/notification-rules/${id}/toggle`, {});
  }

  // ─── Scheduler Hour ────────────────────────────────────────────────────────

  getSchedulerHour(): Observable<string> {
    return this._http
      .get<SystemConfig>(
        `${this._baseUrl}/config/key/scheduler.notification.hour`
      )
      .pipe(map((config) => config.value));
  }

  updateSchedulerHour(hour: number): Observable<void> {
    return this._http.put<void>(
      `${this._baseUrl}/config/key/scheduler.notification.hour`,
      {
        key: 'scheduler.notification.hour',
        value: String(hour),
        description: 'Hora de ejecucion',
      }
    );
  }
}
