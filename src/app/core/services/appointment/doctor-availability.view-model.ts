import { Injectable, inject, DestroyRef, computed } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { AppointmentService } from './appointment';
import { AppointmentStateService } from './appointment.state';
import { ErrorMapperService } from '../error-mapper.service';
import { SpecialtyDoctor } from '../../models/appointment.model';
import { toApiError } from '../../models/api-error.model';
import { formatDateToISO } from '../../../shared/utils/date-time.utils';

@Injectable({ providedIn: 'root' })
export class DoctorAvailabilityViewModel {
  private readonly _appointmentService = inject(AppointmentService);
  private readonly _stateService = inject(AppointmentStateService);
  private readonly _errorMapper = inject(ErrorMapperService);
  private readonly _destroyRef = inject(DestroyRef);

  readonly doctors = computed(() => this._stateService.doctors());
  readonly doctorsLoading = computed(() => this._stateService.doctorsLoading());
  readonly doctorsError = computed(() => this._stateService.doctorsError());
  readonly selectedDoctor = computed(() => this._stateService.selectedDoctor());
  readonly selectedDate = computed(() => this._stateService.selectedDate());
  readonly selectedTime = computed(() => this._stateService.selectedTime());
  readonly availability = computed(() => this._stateService.availability());
  readonly availabilityLoading = computed(() => this._stateService.availabilityLoading());
  readonly availabilityError = computed(() => this._stateService.availabilityError());
  readonly slotDurationMinutes = computed(() => this._stateService.slotDurationMinutes());

  loadDoctors(specialtyId: number): void {
    this._stateService.setDoctorsLoading(true);
    this._stateService.setDoctorsError(null);

    this._appointmentService
      .getDoctorsBySpecialty(specialtyId)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: (data) => {
          this._stateService.setDoctors(data);
          this._stateService.setDoctorsLoading(false);
        },
        error: (raw) => {
          this._stateService.setDoctorsError(
            this._errorMapper.map(toApiError(raw), 'paciente.appointments.errors.fetch-doctors'),
          );
          this._stateService.setDoctorsLoading(false);
        },
      });
  }

  onDoctorSelected(doctor: SpecialtyDoctor): void {
    this._stateService.selectDoctor(doctor);
    this.onDateSelected(formatDateToISO(new Date()));
  }

  onDateSelected(date: string): void {
    this._stateService.selectDate(date);
    this._stateService.selectTime(null);
    this.loadAvailability(date);
  }

  onTimeSelected(time: string): void {
    this._stateService.selectTime(time);
  }

  loadAvailability(date: string): void {
    const doctor = this._stateService.selectedDoctor();
    if (!doctor) return;

    this._stateService.setAvailabilityLoading(true);
    this._stateService.setAvailabilityError(null);

    this._appointmentService
      .getAvailability(doctor.id, date)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: (data) => {
          this._stateService.setAvailability(data.availableTimes);
          this._stateService.setSlotDurationMinutes(data.slotDurationMinutes);
          this._stateService.setAvailabilityLoading(false);
        },
        error: (raw) => {
          this._stateService.setAvailabilityError(
            this._errorMapper.mapAvailabilityError(toApiError(raw)),
          );
          this._stateService.setAvailability([]);
          this._stateService.setAvailabilityLoading(false);
        },
      });
  }
}
