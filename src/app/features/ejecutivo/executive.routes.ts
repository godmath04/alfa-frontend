import { Routes } from '@angular/router';
import { roleGuard } from '../../core/guards/role/role-guard';
import { Role } from '../../core/models/role.enum';

export const EXECUTIVE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./layout/layout').then(m => m.ExecutiveLayout),
    canActivate: [roleGuard],
    data: { roles: [Role.Ejecutivo] },
    children: [
      { path: '', redirectTo: 'pacientes', pathMatch: 'full' },
      {
        path: 'pacientes',
        loadComponent: () => import('./pages/patient-search/patient-search').then(m => m.PatientSearchPage),
      },
      {
        path: 'pacientes/:id',
        loadComponent: () => import('./pages/patient-profile/patient-profile').then(m => m.PatientProfilePage),
      },
      {
        path: 'pacientes/:id/agendar',
        loadComponent: () => import('./pages/book-appointment/book-appointment').then(m => m.ExecutiveBookAppointmentPage),
      },
    ],
  },
];
