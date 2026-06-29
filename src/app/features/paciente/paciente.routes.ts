import { Routes } from '@angular/router';
import { roleGuard } from '../../core/guards/role/role-guard';
import { Role } from '../../core/models/role.enum';

export const PACIENTE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./layout/layout').then(m => m.Layout),
    canActivate: [roleGuard],
    data: { roles: [Role.Paciente] },
    children: [
      { path: '', redirectTo: 'appointment-history', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard/dashboard').then(m => m.Dashboard)
      },
      {
        path: 'appointments',
        loadComponent: () => import('./book-appointment/book-appointment').then(m => m.BookAppointment)
      },
      {
        path: 'appointment-history',
        loadComponent: () => import('./appointment-history/appointment-history').then(m => m.AppointmentHistoryComponent)
      },
      {
        path: 'lab-appointments',
        loadComponent: () => import('./book-lab-appointment/book-lab-appointment').then(m => m.BookLabAppointment)
      },
      {
        path: 'mis-lab-citas',
        loadComponent: () => import('./lab-appointments/lab-appointments').then(m => m.LabAppointmentsComponent)
      },
      {
        path: 'lab-results',
        loadComponent: () => import('./lab-results/lab-results').then(m => m.LabResultsComponent)
      },
      {
        path: 'profile',
        loadChildren: () => import('../profile/profile.routes').then(m => m.PROFILE_ROUTES)
      }
    ]
  }
];
