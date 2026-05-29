import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ChatRequest, ChatResponse } from '../../models/chat.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class Chat {
  private readonly _http = inject(HttpClient);
  private readonly BASE = `${environment.apiUrl}/api/ia/chat`;

  // Envía el mensaje del usuario al backend y retorna la respuesta observable
  sendMessage(payload: ChatRequest): Observable<ChatResponse> {
    return this._http.post<ChatResponse>(this.BASE, payload);
  }
}
