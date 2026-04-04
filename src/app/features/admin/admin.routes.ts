import { Routes } from '@angular/router';
import { roleGuard } from '../../core/guards/role/role-guard';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    canActivate: [roleGuard],
    data: { roles: ['ADMINISTRADOR'] },
    children: []
  }
];
