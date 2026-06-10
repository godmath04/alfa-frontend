import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ProfileResponse, UpdateProfileRequest } from './profile.model';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private readonly _http = inject(HttpClient);
  private get baseUrl() { return environment.apiUrl; }

  getProfile(): Observable<ProfileResponse> {
    return this._http.get<ProfileResponse>(`${this.baseUrl}/api/auth/profile`);
  }

  updateProfile(data: UpdateProfileRequest): Observable<void> {
    return this._http.put<void>(`${this.baseUrl}/api/auth/profile`, data);
  }

  uploadPhoto(file: File): Observable<void> {
    const formData = new FormData();
    formData.append('file', file);
    return this._http.put<void>(`${this.baseUrl}/api/auth/profile/foto`, formData);
  }

  getPhoto(): Observable<Blob> {
    return this._http.get(`${this.baseUrl}/api/auth/profile/foto`, { responseType: 'blob' });
  }
}
