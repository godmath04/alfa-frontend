import { Component, inject, OnInit, signal, effect } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { Translate } from '../../../core/services/translate';
import { Button } from '../../../shared/components/button/button';
import { Spinner } from '../../../shared/components/spinner/spinner';
import { AppointmentHistoryViewModel } from './appointment-history.view-model';
import { DatePipe } from '@angular/common';
import { CancelModalComponent } from './components/cancel-modal';
import { MisCitaItem } from '../../../core/models/appointment.model';

@Component({
  selector: 'app-appointment-history',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    LucideAngularModule,
    Button,
    Spinner,
    DatePipe,
    CancelModalComponent,
  ],
  providers: [AppointmentHistoryViewModel],
  templateUrl: './appointment-history.html',
  styleUrl: './appointment-history.scss',
})
export class AppointmentHistoryComponent implements OnInit {
  readonly vm = inject(AppointmentHistoryViewModel);
  readonly translate = inject(Translate);
  private readonly _fb = inject(FormBuilder);

  // Filtros de búsqueda
  readonly filterForm = this._fb.group({
    estado: [''],
    fechaDesde: [''],
    fechaHasta: [''],
  });

  // Estado del modal de cancelación
  readonly citaParaCancelar = signal<MisCitaItem | null>(null);
  readonly showSuccessToast = signal<boolean>(false);
  readonly showErrorToast = signal<string | null>(null);

  constructor() {
    // Efecto para manejar el cierre del modal tras éxito/error y mostrar feedback
    effect(() => {
      const success = this.vm.cancelSuccess();
      const error = this.vm.cancelError();

      if (success || error) {
        this.citaParaCancelar.set(null); // Cerrar modal

        if (success) {
          this.showSuccessToast.set(true);
          setTimeout(() => this.showSuccessToast.set(false), 5000);
        }

        if (error) {
          this.showErrorToast.set(error);
          setTimeout(() => this.showErrorToast.set(null), 5000);
        }

        this.vm.clearFeedback();
      }
    });
  }

  ngOnInit(): void {
    // Carga inicial (page=0, sin filtros)
    this.vm.loadMisCitas();
  }

  _onSearch(): void {
    const v = this.filterForm.value;
    this.vm.setFilters(v.estado || '', v.fechaDesde || '', v.fechaHasta || '');
  }

  _onClearFilters(): void {
    this.filterForm.reset({
      estado: '',
      fechaDesde: '',
      fechaHasta: '',
    });
    this.vm.clearFilters();
  }

  _prevPage(): void {
    if (this.vm.page() > 0) {
      this.vm.setPage(this.vm.page() - 1);
      this._scrollToTop();
    }
  }

  _nextPage(): void {
    if (!this.vm.isLastPage()) {
      this.vm.setPage(this.vm.page() + 1);
      this._scrollToTop();
    }
  }

  private _scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  _puedeSerCancelada(cita: MisCitaItem): boolean {
    const fechaHoraCita = new Date(`${cita.fecha}T${cita.horaInicio}`);
    const ahora = new Date();
    const diferenciaMs = fechaHoraCita.getTime() - ahora.getTime();
    const horasRestantes = diferenciaMs / (1000 * 60 * 60);

    const estadoCancelable = cita.estado === 'PENDIENTE' || cita.estado === 'CONFIRMADA';
    return estadoCancelable && horasRestantes > 24;
  }

  _abrirModalCancelacion(cita: MisCitaItem): void {
    this.citaParaCancelar.set(cita);
  }

  _cerrarModalCancelacion(): void {
    this.citaParaCancelar.set(null);
  }

  _confirmarCancelacion(citaId: number): void {
    this.vm.cancelAppointment(citaId);
  }
}
