import { Routes } from '@angular/router';
import { roleGuard } from '../../core/guards/role/role-guard';
import { Role } from '../../core/models/role.enum';

export const EJECUTIVO_ROUTES: Routes = [
  {
    path: '',
    canActivate: [roleGuard],
    data: { roles: [Role.Ejecutivo] },
    children: [],
  },
];
