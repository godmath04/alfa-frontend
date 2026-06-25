import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';

import { AuthViewModel } from '../../../core/services/auth/auth.view-model';
import { Translate } from '../../../core/services/translate';
import { Router } from '@angular/router';

@Component({
  selector: 'app-gerencia-layout',
  standalone: true,
  imports: [RouterOutlet, LucideAngularModule],
  templateUrl: './layout.html',
  styleUrl: './layout.scss',
})
export class Layout {

  readonly _translate = inject(Translate);

  private readonly _vm     = inject(AuthViewModel);
  private readonly _router = inject(Router);

  readonly _navItems = [
    { key: 'gerencia.nav.dashboard',    icon: 'layout-dashboard', route: '/gerencia/dashboard' },
    { key: 'gerencia.nav.consultorios', icon: 'building-2',       route: '/gerencia/consultorios' },
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
