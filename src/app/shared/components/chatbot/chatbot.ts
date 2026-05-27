import { Component, inject, ElementRef, ViewChild, effect } from '@angular/core';
import { MarkdownModule } from 'ngx-markdown';
import { LucideAngularModule } from 'lucide-angular';
import { ChatbotViewModel } from './chatbot.view-model';
import { ChatMessage } from '../../../core/models/chat.model';

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [MarkdownModule, LucideAngularModule],
  templateUrl: './chatbot.html',
  styleUrl: './chatbot.scss',
  providers: [ChatbotViewModel], // ViewModel provisto a este componente y sus hijos
})
export class Chatbot {
  protected readonly vm = inject(ChatbotViewModel);

  // Referencia al contenedor de los mensajes para hacer auto-scroll
  @ViewChild('messagesContainer')
  private messagesContainer!: ElementRef<HTMLDivElement>;

  constructor() {
    // Escucha de manera reactiva cambios en la lista de mensajes para bajar el scroll
    effect(() => {
      this.vm.messages(); // Leemos el signal para registrar la dependencia
      setTimeout(() => this.scrollToBottom(), 50);
    });
  }

  // Permite enviar con Enter y saltar de línea con Shift + Enter
  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.vm.sendMessage();
    }
  }

  // Optimización para @for track
  protected trackMessage(_idx: number, msg: ChatMessage): string {
    return `${msg.role}-${msg.timestamp.getTime()}`;
  }

  private scrollToBottom(): void {
    const el = this.messagesContainer?.nativeElement;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }
}
