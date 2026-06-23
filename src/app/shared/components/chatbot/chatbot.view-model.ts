import { Injectable, computed, inject, signal, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Chat } from '../../../core/services/chat/chat';
import { ChatStateService } from '../../../core/services/chat/chat.state';
import { AuthStateService } from '../../../core/services/auth/auth.state';

@Injectable() // Instancia scoped al ciclo de vida del componente
export class ChatbotViewModel {
  private readonly _chatService = inject(Chat);
  private readonly _chatState = inject(ChatStateService);
  private readonly _authState = inject(AuthStateService);
  private readonly _destroyRef = inject(DestroyRef);

  // ─── Signals expuestos a la View ──────────────────────────────────────────
  readonly messages = this._chatState.messages;
  readonly isOpen = this._chatState.isOpen;
  readonly isAuthenticated = this._authState.isAuthenticated;

  // Signal local: indica si el chatbot de IA está respondiendo
  readonly isLoading = signal<boolean>(false);

  // Texto reactivo del input
  readonly inputText = signal<string>('');

  // Computado: valida si se puede enviar el mensaje (si hay texto y no está cargando)
  readonly canSend = computed(
    () => this.inputText().trim().length > 0 && !this.isLoading()
  );

  // ─── Acciones expuestas a la View ─────────────────────────────────────────

  // Alterna la visibilidad del chat
  togglePanel(): void {
    this._chatState.togglePanel();
  }

  // Actualiza el texto ingresado en el input
  updateInput(text: string): void {
    this.inputText.set(text);
  }

  // Envía el mensaje y gestiona la llamada HTTP
  sendMessage(): void {
    const text = this.inputText().trim();
    if (!text || this.isLoading()) return;

    // 1. Añadimos el mensaje del usuario inmediatamente al historial
    this._chatState.addMessage({
      role: 'user',
      content: text,
      timestamp: new Date(),
    });

    // 2. Reseteamos el input y activamos el estado de carga
    this.inputText.set('');
    this.isLoading.set(true);

    // 3. Obtenemos el sessionId (el rol lo inyecta el Gateway via X-User-Role)
    const sessionId = this._chatState.sessionId();

    const payload = {
      message: text,
      ...(sessionId ? { sessionId } : {}),
    };

    // 4. Invocamos el servicio HTTP y nos suscribimos
    // takeUntilDestroyed() cancelará la suscripción si el componente es destruido
    this._chatService
      .sendMessage(payload)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: (res) => {
          // Guardamos la sesión devuelta por el servidor
          this._chatState.saveSessionId(res.sessionId);

          // Agregamos la respuesta de Alfa al chat
          this._chatState.addMessage({
            role: 'bot',
            content: res.message,
            timestamp: new Date(),
          });

          this.isLoading.set(false);
        },
        error: () => {
          // Añadimos un mensaje de error amigable en el chat
          this._chatState.addMessage({
            role: 'bot',
            content:
              'Lo siento, en este momento no puedo conectarme con el servicio. Por favor, inténtalo más tarde.',
            timestamp: new Date(),
          });
          this.isLoading.set(false);
        },
      });
  }

  // Limpia el historial de la conversación actual
  clearSession(): void {
    this._chatState.clearSession();
  }
}
