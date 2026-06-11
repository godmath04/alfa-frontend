import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';

import { AuthViewModel } from '../../../core/services/auth/auth.view-model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-gerencia-layout',
  standalone: true,
  imports: [RouterOutlet, LucideAngularModule],
  templateUrl: './layout.html',
  styleUrl: './layout.scss',
})
export class Layout {

  private readonly _vm     = inject(AuthViewModel);
  private readonly _router = inject(Router);

  // El menú está vacío por ahora, luego se agregarán más opciones
  readonly _navItems = [
    { key: 'Dashboard', icon: 'layout-dashboard', route: '/gerencia/dashboard' },
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
