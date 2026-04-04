import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { LoginRequest, LoginResponse, RegisterRequest } from '../../models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private readonly _http = inject(HttpClient);
  private get baseUrl() { return environment.apiUrl; }

  login(email: string, password: string): Observable<LoginResponse> {
    const body: LoginRequest = { email, password };
    return this._http.post<LoginResponse>(`${this.baseUrl}/api/auth/login`, body);
  }

  logout(): Observable<void> {
    return this._http.post<void>(`${this.baseUrl}/api/auth/logout`, {});
  }

  register(data: RegisterRequest): Observable<void> {
    return this._http.post<void>(`${this.baseUrl}/api/auth/register`, data);
  }
}
