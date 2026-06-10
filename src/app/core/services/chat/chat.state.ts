import { Injectable, signal } from '@angular/core';
import { ChatMessage } from '../../models/chat.model';

@Injectable({
  providedIn: 'root',
})
export class ChatStateService {
  // Guardamos el sessionId en memoria — null indica que no hay sesión activa aún
  private readonly _sessionId = signal<string | null>(null);

  // Historial de mensajes visible en la interfaz
  private readonly _messages = signal<ChatMessage[]>([]);

  // Indica si el panel flotante de chat está abierto o cerrado
  private readonly _isOpen = signal<boolean>(false);

  // Signals de solo lectura expuestos al resto de la aplicación
  readonly sessionId = this._sessionId.asReadonly();
  readonly messages = this._messages.asReadonly();
  readonly isOpen = this._isOpen.asReadonly();

  // Guarda el sessionId recibido del backend tras el primer mensaje
  saveSessionId(id: string): void {
    this._sessionId.set(id);
  }

  // Agrega un mensaje nuevo al historial
  addMessage(msg: ChatMessage): void {
    this._messages.update((prev) => [...prev, msg]);
  }

  // Cambia el estado abierto/cerrado del panel
  togglePanel(): void {
    this._isOpen.update((v) => !v);
  }

  // Cierra el panel de chat
  closePanel(): void {
    this._isOpen.set(false);
  }

  // Limpia la sesión actual (para iniciar una nueva conversación)
  clearSession(): void {
    this._sessionId.set(null);
    this._messages.set([]);
  }
}
