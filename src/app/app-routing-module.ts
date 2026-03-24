import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/auth-module').then(m => m.AuthModule)
  },
  {
    path: 'paciente',
    loadChildren: () =>
      import('./features/paciente/paciente-module').then(m => m.PacienteModule)
  },
  {
    path: 'medico',
    loadChildren: () =>
      import('./features/medico/medico-module').then(m => m.MedicoModule)
  },
  {
    path: 'ejecutivo',
    loadChildren: () =>
      import('./features/ejecutivo/ejecutivo-module').then(m => m.EjecutivoModule)
  },
  {
    path: 'admin',
    loadChildren: () =>
      import('./features/admin/admin-module').then(m => m.AdminModule)
  },
  {
    path: 'gerencia',
    loadChildren: () =>
      import('./features/gerencia/gerencia-module').then(m => m.GerenciaModule)
  },
  {
    path: '',
    redirectTo: 'auth',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }