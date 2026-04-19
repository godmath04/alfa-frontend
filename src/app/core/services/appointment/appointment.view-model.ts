import { Injectable, inject, computed } from '@angular/core';

import { AppointmentStateService }      from './appointment.state';
import { SpecialtyViewModel }           from './specialty.view-model';
import { DoctorAvailabilityViewModel }  from './doctor-availability.view-model';
import { AppointmentCreationViewModel } from './appointment-creation.view-model';
import { QuickAppointmentViewModel }    from './quick-appointment.view-model';
import { SpecialtyCatalog, SpecialtyDoctor, FlowType } from '../../models/appointment.model';

@Injectable({ providedIn: 'root' })
export class AppointmentViewModel {

  private readonly _stateService  = inject(AppointmentStateService);
  private readonly _specialtyVM   = inject(SpecialtyViewModel);
  private readonly _doctorVM      = inject(DoctorAvailabilityViewModel);
  private readonly _creationVM    = inject(AppointmentCreationViewModel);
  private readonly _quickVM       = inject(QuickAppointmentViewModel);

  // ─── Flow ──────────────────────────────────────────
  readonly flowType = computed(() => this._stateService.flowType());

  // ─── Specialties ───────────────────────────────────
  readonly specialties       = this._specialtyVM.specialties;
  readonly loading           = this._specialtyVM.loading;
  readonly error             = this._specialtyVM.error;
  readonly hasSpecialties    = this._specialtyVM.hasSpecialties;
  readonly selectedSpecialty = this._specialtyVM.selectedSpecialty;

  // ─── Doctors ───────────────────────────────────────
  readonly doctors        = this._doctorVM.doctors;
  readonly doctorsLoading = this._doctorVM.doctorsLoading;
  readonly doctorsError   = this._doctorVM.doctorsError;

  // ─── Availability ──────────────────────────────────
  readonly selectedDoctor      = this._doctorVM.selectedDoctor;
  readonly selectedDate        = this._doctorVM.selectedDate;
  readonly selectedTime        = this._doctorVM.selectedTime;
  readonly availability        = this._doctorVM.availability;
  readonly availabilityLoading = this._doctorVM.availabilityLoading;
  readonly availabilityError   = this._doctorVM.availabilityError;
  readonly slotDurationMinutes = this._doctorVM.slotDurationMinutes;

  // ─── Creation ──────────────────────────────────────
  readonly motivo            = this._creationVM.motivo;
  readonly appointmentResult = this._creationVM.appointmentResult;
  readonly creating          = this._creationVM.creating;
  readonly createError       = this._creationVM.createError;

  // ─── Quick ─────────────────────────────────────────
  readonly proposal          = this._quickVM.proposal;
  readonly proposalCountdown = this._quickVM.proposalCountdown;
  readonly proposalLoading   = this._quickVM.proposalLoading;
  readonly proposalError     = this._quickVM.proposalError;

  // ─── Cross-domain validations ──────────────────────
  readonly canConfirmManual = computed(() =>
    this.selectedSpecialty() !== null &&
    this.selectedDoctor()    !== null &&
    this.selectedDate()      !== null &&
    this.selectedTime()      !== null &&
    (this.motivo()?.trim().length ?? 0) > 0 &&
    !this.creating()
  );

  readonly canConfirmQuick = computed(() =>
    this.proposal()          !== null &&
    (this.motivo()?.trim().length ?? 0) > 0 &&
    this.proposalCountdown() > 0 &&
    !this.creating()
  );

  // ─── Flow actions ──────────────────────────────────

  selectFlow(flow: FlowType): void {
    if (this._stateService.flowType() === 'quick' && flow === 'manual') {
      this._quickVM.cancelSilently();
    }
    this._stateService.setFlowType(flow);
  }

  resetFlow(): void {
    this._quickVM.cancelSilently();
    this._stateService.setFlowType(null);
  }

  clearFlow(): void {
    this._quickVM.clearCountdown();
    this._stateService.clear();
  }

  // ─── Specialty actions ─────────────────────────────

  loadSpecialties(): void {
    this._specialtyVM.loadSpecialties();
  }

  onSpecialtySelected(specialty: SpecialtyCatalog): void {
    this._specialtyVM.selectSpecialty(specialty);
    if (this._stateService.flowType() === 'manual') {
      this._doctorVM.loadDoctors(specialty.id);
    }
  }

  // ─── Doctor & availability actions ─────────────────

  onDoctorSelected(doctor: SpecialtyDoctor): void {
    this._doctorVM.onDoctorSelected(doctor);
  }

  onDateSelected(date: string): void {
    this._doctorVM.onDateSelected(date);
  }

  onTimeSelected(time: string): void {
    this._doctorVM.onTimeSelected(time);
  }

  // ─── Creation actions ──────────────────────────────

  setMotivo(motivo: string): void {
    this._creationVM.setMotivo(motivo);
  }

  confirmManualAppointment(onSuccess: () => void): void {
    this._creationVM.confirmManualAppointment(onSuccess);
  }

  // ─── Quick appointment actions ─────────────────────

  requestQuickProposal(onSuccess: () => void): void {
    this._quickVM.requestQuickProposal(onSuccess);
  }

  confirmQuickAppointment(onSuccess: () => void): void {
    this._creationVM.confirmQuickAppointment(onSuccess, () => this._quickVM.clearCountdown());
  }

  cancelQuickProposal(): void {
    this._quickVM.cancelQuickProposal();
  }
}
