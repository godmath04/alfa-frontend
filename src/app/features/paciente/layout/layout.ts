import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from '../../../core/services/auth/auth';
import { Translate } from '../../../core/services/translate';

@Component({
  selector: 'app-layout',
  standalone: false,
  templateUrl: './layout.html',
  styleUrl: './layout.scss',
})
export class Layout {

  _navItems = [
    { key: 'paciente.nav.profile',      icon: 'user',      route: '/paciente/profile'      },
    { key: 'paciente.nav.appointments', icon: 'calendar',  route: '/paciente/appointments' },
    { key: 'paciente.nav.lab',          icon: 'file-text', route: '/paciente/lab-history'  },
  ];

  constructor(
    private _router: Router,
    private _auth: Auth,
    public _translate: Translate
  ) {}

  _isActive(route: string): boolean {
    return this._router.url.startsWith(route);
  }

  _navigate(route: string): void {
    this._router.navigate([route]);
  }

  _logout(): void {
    this._auth.logout().subscribe({
      next: () => this._router.navigate(['/auth/login']),
      error: () => this._router.navigate(['/auth/login'])
    });
  }
}