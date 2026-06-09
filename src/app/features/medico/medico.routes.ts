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
      {
        path: 'horarios',
        loadComponent: () => import('./pages/my-schedule/my-schedule').then(m => m.MySchedulePage)
      },
      {
        path: 'lab-results',
        loadComponent: () => import('./pages/lab-results-search/lab-results-search').then(m => m.LabResultsSearchPage)
      },
      {
        path: 'profile',
        loadChildren: () => import('../profile/profile.routes').then(m => m.PROFILE_ROUTES)
      }
    ]
  }
];
