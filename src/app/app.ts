import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Chatbot } from './shared/components/chatbot/chatbot';
import { AuthStateService } from './core/services/auth/auth.state';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Chatbot],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  private authState = inject(AuthStateService);

  get showChatbot(): boolean {
    return this.authState.isAuthenticated();
  }
}


