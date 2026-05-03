import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';

import { AuthViewModel } from '../../../core/services/auth/auth.view-model';
import { Translate } from '../../../core/services/translate';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, LucideAngularModule],
  templateUrl: './layout.html',
  styleUrl: './layout.scss',
})
export class AdminLayout {

  readonly _translate = inject(Translate);

  private readonly _vm     = inject(AuthViewModel);
  private readonly _router = inject(Router);

  readonly _navItems = [
    { key: 'admin.nav.resources', icon: 'stethoscope', route: '/admin/resources' },
    { key: 'admin.nav.doctors',   icon: 'user-check',  route: '/admin/doctors'   },
    { key: 'admin.nav.users',     icon: 'users',        route: '/admin/users'     },
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
