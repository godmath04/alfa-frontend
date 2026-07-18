import { Component, inject } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map, startWith } from 'rxjs';
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
  private router = inject(Router);

  private isNotAuthRoute = toSignal(
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map((event: NavigationEnd) => !event.urlAfterRedirects.startsWith('/auth')),
      startWith(!this.router.url.startsWith('/auth'))
    )
  );

  get showChatbot(): boolean {
    return this.authState.isAuthenticated() && (this.isNotAuthRoute() ?? false);
  }
}



