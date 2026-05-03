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
      { path: '', redirectTo: 'specialties', pathMatch: 'full' },
      {
        path: 'specialties',
        loadComponent: () => import('./pages/specialties/specialties').then(m => m.SpecialtiesPage),
      },
    ],
  },
];
