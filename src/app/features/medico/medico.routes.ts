import { Routes } from '@angular/router';
import { roleGuard } from '../../core/guards/role/role-guard';
import { Role } from '../../core/models/role.enum';

export const MEDICO_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./layout/layout').then(m => m.MedicoLayout),
    canActivate: [roleGuard],
    data: { roles: [Role.Medico] },
    children: [
      { path: '', redirectTo: 'agenda', pathMatch: 'full' },
      {
        path: 'agenda',
        loadComponent: () => import('./pages/daily-schedule/daily-schedule').then(m => m.DailySchedulePage)
      },
      {
        path: 'calendario',
        loadComponent: () => import('./pages/week-calendar/week-calendar').then(m => m.WeekCalendarPage)
      },
    ]
  }
];
