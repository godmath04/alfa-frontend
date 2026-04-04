import { Routes } from '@angular/router';

export const APP_ROUTES: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES)
  },
  {
    path: 'paciente',
    loadChildren: () => import('./features/paciente/paciente.routes').then(m => m.PACIENTE_ROUTES)
  },
  {
    path: 'medico',
    loadChildren: () => import('./features/medico/medico.routes').then(m => m.MEDICO_ROUTES)
  },
  {
    path: 'ejecutivo',
    loadChildren: () => import('./features/ejecutivo/ejecutivo.routes').then(m => m.EJECUTIVO_ROUTES)
  },
  {
    path: 'admin',
    loadChildren: () => import('./features/admin/admin.routes').then(m => m.ADMIN_ROUTES)
  },
  {
    path: 'gerencia',
    loadChildren: () => import('./features/gerencia/gerencia.routes').then(m => m.GERENCIA_ROUTES)
  },
  { path: '', redirectTo: 'auth', pathMatch: 'full' }
];
