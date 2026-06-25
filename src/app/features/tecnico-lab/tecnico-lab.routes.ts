import { Routes } from '@angular/router';
import { roleGuard } from '../../core/guards/role/role-guard';
import { Role } from '../../core/models/role.enum';

export const TECNICO_LAB_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./layout/layout').then(m => m.TecnicoLabLayout),
    canActivate: [roleGuard],
    data: { roles: [Role.TecnicoLab] },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard/dashboard').then(m => m.TecnicoLabDashboard)
      },
      {
        path: 'calendario',
        loadComponent: () => import('./pages/calendario/calendario').then(m => m.TecnicoLabCalendario)
      },
      {
        // Listing of completed citas — entry point from sidebar nav
        path: 'subir-resultados',
        loadComponent: () => import('./pages/upload-result-list/upload-result-list').then(m => m.TlUploadResultListPage)
      },
      {
        // Detail page — navigated to from the listing table row
        path: 'subir-resultados/:citaId',
        loadComponent: () => import('./pages/upload-result/upload-result').then(m => m.TlUploadResultPage)
      }
    ]
  }
];
