import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';

import { AuthViewModel } from '../../../core/services/auth/auth.view-model';
import { Translate } from '../../../core/services/translate';

@Component({
  selector: 'app-executive-layout',
  standalone: true,
  imports: [RouterOutlet, LucideAngularModule],
  templateUrl: './layout.html',
  styleUrl: './layout.scss',
})
export class ExecutiveLayout {

  readonly _translate = inject(Translate);
  private readonly _vm     = inject(AuthViewModel);
  private readonly _router = inject(Router);

  readonly _navItems = [
    { key: 'ejecutivo.nav.patients',      icon: 'users',         route: '/ejecutivo/pacientes'      },
    { key: 'ejecutivo.nav.labManagement', icon: 'flask-conical', route: '/ejecutivo/lab-management' },
    { key: 'ejecutivo.nav.profile',       icon: 'user',          route: '/ejecutivo/profile'        },
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
