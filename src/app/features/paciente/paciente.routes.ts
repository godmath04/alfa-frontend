import { Routes } from '@angular/router';
import { roleGuard } from '../../core/guards/role/role-guard';

export const PACIENTE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./layout/layout').then(m => m.Layout),
    canActivate: [roleGuard],
    data: { roles: ['PACIENTE'] },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard/dashboard').then(m => m.Dashboard)
      },
      {
        path: 'appointments',
        loadComponent: () => import('./book-appointment/book-appointment').then(m => m.BookAppointment)
      },
    ]
  }
];
