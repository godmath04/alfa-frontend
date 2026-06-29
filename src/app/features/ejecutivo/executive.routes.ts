import { Routes } from '@angular/router';
import { roleGuard } from '../../core/guards/role/role-guard';
import { Role } from '../../core/models/role.enum';

export const EXECUTIVE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./layout/layout').then(m => m.ExecutiveLayout),
    canActivate: [roleGuard],
    data: { roles: [Role.Ejecutivo] },
    children: [
      { path: '', redirectTo: 'pacientes', pathMatch: 'full' },
      {
        path: 'lab-management',
        loadComponent: () => import('./pages/lab-management/lab-management').then(m => m.LabManagementPage),
      },
      {
        path: 'pacientes',
        loadComponent: () => import('./pages/patient-search/patient-search').then(m => m.PatientSearchPage),
      },
      {
        path: 'pacientes/:id',
        loadComponent: () => import('./pages/patient-profile/patient-profile').then(m => m.PatientProfilePage),
      },
      {
        path: 'pacientes/:id/agendar',
        loadComponent: () => import('./pages/book-appointment/book-appointment').then(m => m.ExecutiveBookAppointmentPage),
      },
      {
        path: 'pacientes/:id/agendar-lab',
        loadComponent: () => import('./pages/book-lab-appointment/book-lab-appointment').then(m => m.ExecutiveBookLabAppointmentPage),
      },
      // COMENTADO TEMPORALMENTE - Ejecutivo ya no sube PDFs, ahora es responsabilidad de TECNICO_LAB
      // La ruta de subida se eliminó del scope del ejecutivo. Ver: tecnico-lab.routes.ts
      /* {
        path: 'subir-resultado/:citaId',
        loadComponent: () => import('./pages/upload-lab-result/upload-lab-result').then(m => m.UploadLabResultPage),
      }, */
      {
        path: 'profile',
        loadChildren: () => import('../profile/profile.routes').then(m => m.PROFILE_ROUTES)
      },
    ],
  },
];
