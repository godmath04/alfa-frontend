import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PacienteRoutingModule } from './paciente-routing-module';
import { SharedModule } from '../../shared/shared-module';
import { Layout } from './layout/layout';
import { Dashboard } from './pages/dashboard/dashboard';
import { BookAppointment } from './book-appointment/book-appointment';

@NgModule({
  declarations: [Layout, Dashboard, BookAppointment],
  imports: [CommonModule, PacienteRoutingModule, SharedModule],
})
export class PacienteModule {}
