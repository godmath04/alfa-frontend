import { Routes } from '@angular/router';
import { roleGuard } from '../../core/guards/role/role-guard';

export const MEDICO_ROUTES: Routes = [
  {
    path: '',
    canActivate: [roleGuard],
    data: { roles: ['MEDICO'] },
    children: []
  }
];
