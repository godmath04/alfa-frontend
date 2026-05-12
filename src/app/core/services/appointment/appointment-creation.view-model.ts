import { Injectable, inject, DestroyRef, computed } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { AppointmentService } from './appointment';
import { AppointmentStateService } from './appointment.state';
import { ErrorMapperService } from '../error-mapper.service';
import { CreateAppointmentRequest, ConfirmQuickRequest } from '../../models/appointment.model';
import { toApiError } from '../../models/api-error.model';
import { calculateEndTime } from '../../../shared/utils/date-time.utils';

@Injectable({ providedIn: 'root' })
export class AppointmentCreationViewModel {

  private readonly _appointmentService = inject(AppointmentService);
  private readonly _stateService       = inject(AppointmentStateService);
  private readonly _errorMapper        = inject(ErrorMapperService);
  private readonly _destroyRef         = inject(DestroyRef);

  readonly motivo            = computed(() => this._stateService.motivo());
  readonly appointmentResult = computed(() => this._stateService.appointmentResult());
  readonly creating          = computed(() => this._stateService.creating());
  readonly createError       = computed(() => this._stateService.createError());

  setMotivo(motivo: string): void {
    this._stateService.setMotivo(motivo);
  }

  confirmManualAppointment(onSuccess: () => void, patientId?: number): void {
    const doctor = this._stateService.selectedDoctor();
    const date   = this._stateService.selectedDate();
    const time   = this._stateService.selectedTime();
    const motivo = this._stateService.motivo();

    if (!doctor || !date || !time || !motivo) return;

    const request: CreateAppointmentRequest = {
      medicoId:      doctor.id,
      consultorioId: null,
      fecha:         date,
      horaInicio:    time,
      horaFin:       calculateEndTime(time, this._stateService.slotDurationMinutes()),
      motivo:        motivo.trim(),
    };

    this._stateService.setCreating(true);
    this._stateService.setCreateError(null);

    this._appointmentService.createAppointment(request, patientId)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: (result) => {
          this._stateService.setAppointmentResult(result);
          this._stateService.setCreating(false);
          onSuccess();
        },
        error: (raw) => {
          this._stateService.setCreateError(this._errorMapper.mapCreateError(toApiError(raw)));
          this._stateService.setCreating(false);
        }
      });
  }

  confirmQuickAppointment(onSuccess: () => void, onClearCountdown: () => void, patientId?: number): void {
    const proposal = this._stateService.proposal();
    const motivo   = this._stateService.motivo();
    if (!proposal || !motivo) return;

    const request: ConfirmQuickRequest = {
      reservaId: proposal.reservationId,
      motivo:    motivo.trim(),
    };

    this._stateService.setCreating(true);
    this._stateService.setCreateError(null);

    this._appointmentService.confirmQuickAppointment(request, patientId)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: (result) => {
          this._stateService.setAppointmentResult(result);
          this._stateService.setCreating(false);
          onClearCountdown();
          onSuccess();
        },
        error: (raw) => {
          this._stateService.setCreateError(this._errorMapper.mapCreateError(toApiError(raw)));
          this._stateService.setCreating(false);
        }
      });
  }
}
