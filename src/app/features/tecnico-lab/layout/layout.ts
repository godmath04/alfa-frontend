import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { AuthViewModel } from '../../../core/services/auth/auth.view-model';
import { Router } from '@angular/router';
import { Translate } from '../../../core/services/translate';

@Component({
  selector: 'app-tecnico-lab-layout',
  standalone: true,
  imports: [RouterOutlet, LucideAngularModule],
  templateUrl: './layout.html',
  styleUrl: './layout.scss',
})
export class TecnicoLabLayout {

  readonly _translate = inject(Translate);
  private readonly _vm     = inject(AuthViewModel);
  private readonly _router = inject(Router);

  readonly _navItems = [
    { key: 'tecnicoLab.nav.dashboard',       icon: 'layout-dashboard', route: '/tecnico-lab/dashboard' },
    { key: 'tecnicoLab.nav.calendario',      icon: 'calendar',         route: '/tecnico-lab/calendario' },
    { key: 'tecnicoLab.nav.subirResultados', icon: 'upload',           route: '/tecnico-lab/subir-resultados' },
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
