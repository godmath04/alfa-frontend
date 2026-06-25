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
    loadChildren: () => import('./features/ejecutivo/executive.routes').then(m => m.EXECUTIVE_ROUTES)
  },
  {
    path: 'admin',
    loadChildren: () => import('./features/admin/admin.routes').then(m => m.ADMIN_ROUTES)
  },
  {
    path: 'gerencia',
    loadChildren: () => import('./features/gerencia/gerencia.routes').then(m => m.GERENCIA_ROUTES)
  },
  {
    path: 'tecnico-lab',
    loadChildren: () => import('./features/tecnico-lab/tecnico-lab.routes').then(m => m.TECNICO_LAB_ROUTES)
  },
  {
    path: 'resultados/guest',
    loadComponent: () => import('./features/public/lab-result-guest/lab-result-guest').then(m => m.LabResultGuestComponent)
  },
  { path: '', redirectTo: 'auth', pathMatch: 'full' }
];
