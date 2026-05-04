import { Routes } from '@angular/router';
import { roleGuard } from '../../core/guards/role/role-guard';
import { Role } from '../../core/models/role.enum';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./layout/layout').then(m => m.AdminLayout),
    canActivate: [roleGuard],
    data: { roles: [Role.Administrador] },
    children: [
      { path: '', redirectTo: 'resources', pathMatch: 'full' },
      {
        path: 'resources',
        loadComponent: () => import('./pages/resource-management/resource-management').then(m => m.ResourceManagementPage),
      },
      {
        path: 'doctors',
        loadComponent: () => import('./pages/doctors/doctors').then(m => m.DoctorsPage),
      },
      {
        path: 'users',
        loadComponent: () => import('./pages/users/users').then(m => m.UsersPage),
      },
      {
        path: 'config',
        loadComponent: () => import('./pages/config/config').then(m => m.ConfigPage),
      },
    ],
  },
];
