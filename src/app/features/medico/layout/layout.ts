import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';

import { AuthViewModel } from '../../../core/services/auth/auth.view-model';
import { Translate } from '../../../core/services/translate';

@Component({
  selector: 'app-medico-layout',
  standalone: true,
  imports: [RouterOutlet, LucideAngularModule],
  templateUrl: './layout.html',
  styleUrl: './layout.scss',
})
export class MedicoLayout {

  readonly _translate = inject(Translate);

  private readonly _vm     = inject(AuthViewModel);
  private readonly _router = inject(Router);

  readonly _navItems = [
    { key: 'medico.nav.agenda',      icon: 'clipboard-list', route: '/medico/agenda'     },
    { key: 'medico.nav.calendario',  icon: 'calendar',       route: '/medico/calendario' },
    { key: 'medico.nav.horarios',    icon: 'clock',          route: '/medico/horarios'   },
    { key: 'medico.nav.labResults',  icon: 'flask-conical',  route: '/medico/lab-results'},
  ];

  _isActive(route: string): boolean {
    return this._router.url.startsWith(route);
  }

  _navigate(route: string): void {
    this._router.navigate([route]);
  }

  _logout(): void {
    this._vm.logout();
  }
}
