import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private _token: string | null = null;
  private _userRole: string | null = null;

  constructor(private _http: HttpClient) {}

  login(email: string, password: string): Observable<any> {
    return this._http.post(`${environment.apiUrl}/api/auth/login`, { email, password }).pipe(
      tap((response: any) => {
        this._token = response.token;
        this._userRole = response.role;
      }),
    );
  }

  logout(): Observable<any> {
    return this._http.post(`${environment.apiUrl}/api/auth/logout`, {}).pipe(
      tap(() => {
        this._token = null;
        this._userRole = null;
      }),
    );
  }

  register(data: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  idType: string;
  idNumber: string;
  birthDate: string;
  city: string;
  gender: string;
}): Observable<any> {
  return this._http.post(`${environment.apiUrl}/api/auth/register`, data);
}

  getToken(): string | null {
    return this._token;
  }

  getUserRole(): string | null {
    return this._userRole;
  }

  isAuthenticated(): boolean {
    return this._token !== null;
  }
}
