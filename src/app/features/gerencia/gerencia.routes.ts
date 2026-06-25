import { Routes } from '@angular/router';
import { roleGuard } from '../../core/guards/role/role-guard';
import { Role } from '../../core/models/role.enum';

export const GERENCIA_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./layout/layout').then(m => m.Layout),
    canActivate: [roleGuard],
    data: { roles: [Role.Gerencia] },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard/dashboard').then(m => m.Dashboard)
      },
      {
        path: 'consultorios',
        loadComponent: () => import('./pages/consultorios/consultorios').then(m => m.Consultorios)
      }
    ]
  }
];
