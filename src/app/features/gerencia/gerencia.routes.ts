import { Routes } from '@angular/router';
import { roleGuard } from '../../core/guards/role/role-guard';

export const GERENCIA_ROUTES: Routes = [
  {
    path: '',
    canActivate: [roleGuard],
    data: { roles: ['GERENCIA'] },
    children: []
  }
];
