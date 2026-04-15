// src/app/core/services/appointment/appointment.view-model.ts
import { Injectable, inject, DestroyRef, computed } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { AppointmentService } from './appointment';
import { AppointmentStateService } from './appointment.state';
import { Translate } from '../translate';
import {
  SpecialtyCatalog,
  SpecialtyDoctor,
  FlowType,
  CreateAppointmentRequest,
  ConfirmQuickRequest
} from '../../models/appointment.model';

@Injectable({ providedIn: 'root' })
export class AppointmentViewModel {

  private readonly _appointmentService = inject(AppointmentService);
  private readonly _stateService       = inject(AppointmentStateService);
  private readonly _translate          = inject(Translate);
  private readonly _destroyRef         = inject(DestroyRef);
  private _countdownInterval: ReturnType<typeof setInterval> | null = null;

  // ─── Flow ──────────────────────────────────────────
  readonly flowType = computed(() => this._stateService.flowType());

  // ─── Specialties ───────────────────────────────────
  readonly specialties       = computed(() => this._stateService.specialties());
  readonly loading           = computed(() => this._stateService.loading());
  readonly error             = computed(() => this._stateService.error());
  readonly hasSpecialties    = computed(() => this.specialties().length > 0);
  readonly selectedSpecialty = computed(() => this._stateService.selectedSpecialty());

  // ─── Doctors ───────────────────────────────────────
  readonly doctors        = computed(() => this._stateService.doctors());
  readonly doctorsLoading = computed(() => this._stateService.doctorsLoading());
  readonly doctorsError   = computed(() => this._stateService.doctorsError());

  // ─── Availability ──────────────────────────────────
  readonly selectedDoctor      = computed(() => this._stateService.selectedDoctor());
  readonly selectedDate        = computed(() => this._stateService.selectedDate());
  readonly selectedTime        = computed(() => this._stateService.selectedTime());
  readonly availability        = computed(() => this._stateService.availability());
  readonly availabilityLoading = computed(() => this._stateService.availabilityLoading());
  readonly availabilityError   = computed(() => this._stateService.availabilityError());
  readonly slotDurationMinutes = computed(() => this._stateService.slotDurationMinutes());

  // ─── Manual creation ──────────────────────────────
  readonly motivo            = computed(() => this._stateService.motivo());
  readonly appointmentResult = computed(() => this._stateService.appointmentResult());
  readonly creating          = computed(() => this._stateService.creating());
  readonly createError       = computed(() => this._stateService.createError());

  // ─── Quick appointment ─────────────────────────────
  readonly proposal          = computed(() => this._stateService.proposal());
  readonly proposalCountdown = computed(() => this._stateService.proposalCountdown());
  readonly proposalLoading   = computed(() => this._stateService.proposalLoading());
  readonly proposalError     = computed(() => this._stateService.proposalError());

  // ─── Computed validations ──────────────────────────
  readonly canConfirmManual = computed(() =>
    this.selectedSpecialty() !== null &&
    this.selectedDoctor() !== null &&
    this.selectedDate() !== null &&
    this.selectedTime() !== null &&
    (this.motivo()?.trim().length ?? 0) > 0 &&
    !this.creating()
  );

  readonly canConfirmQuick = computed(() =>
    this.proposal() !== null &&
    (this.motivo()?.trim().length ?? 0) > 0 &&
    this.proposalCountdown() > 0 &&
    !this.creating()
  );

  constructor() {
    // Clean up countdown interval when this service is destroyed
    this._destroyRef.onDestroy(() => this._clearCountdownInterval());
  }

  // ─── Flow ──────────────────────────────────────────

  selectFlow(flow: FlowType): void {
    // If switching from quick to manual, cancel any active proposal
    if (this._stateService.flowType() === 'quick' && flow === 'manual') {
      this._cancelProposalSilently();
    }
    this._stateService.setFlowType(flow);
  }

  /**
   * Resets flow type and cancels any active quick proposal.
   * Used when navigating back to the flow selector (step 0).
   */
  resetFlow(): void {
    this._cancelProposalSilently();
    this._stateService.setFlowType(null);
  }

  // ─── Specialties ───────────────────────────────────

  /**
   * Triggers the API call to load specialties.
   */
  loadSpecialties(): void {
    // If we already have specialties loaded, we might not want to fetch again
    if (this.hasSpecialties()) {
      return;
    }

    this._stateService.setLoading(true);
    this._stateService.setError(null);

    this._appointmentService.getSpecialties()
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: (data) => {
          this._stateService.setSpecialties(data);
          this._stateService.setLoading(false);
        },
        error: (err) => {
          console.error('Error fetching specialties:', err);

          // Using the i18n JSON service for the error message
          const errorMessage = this._translate.get('paciente.appointments.errors.fetch-catalog');
          this._stateService.setError(errorMessage);

          this._stateService.setLoading(false);
        }
      });
  }

  /**
   * Called when the user clicks a specialty card.
   * In manual flow, also loads doctors. In quick flow, just saves selection.
   */
  onSpecialtySelected(specialty: SpecialtyCatalog): void {
    this._stateService.selectSpecialty(specialty);
    // Only load doctors in manual flow
    if (this._stateService.flowType() === 'manual') {
      this.loadDoctors(specialty.id);
    }
  }

  // ─── Doctors ───────────────────────────────────────

  /**
   * Triggers the API call to load doctors for step 2.
   */
  loadDoctors(specialtyId: number): void {
    this._stateService.setDoctorsLoading(true);
    this._stateService.setDoctorsError(null);
    this._appointmentService.getDoctorsBySpecialty(specialtyId)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: (data) => {
          this._stateService.setDoctors(data);
          this._stateService.setDoctorsLoading(false);
        },
        error: (err) => {
          console.error('Error fetching doctors:', err);

          // Fallback if backend doesn't provide a message
          let msg = this._translate.get('paciente.appointments.errors.fetch-doctors');

          // Si el Backend regresó 400 con un mensaje ("Especialidad no encontrada")
          if (err.status === 400 && err.error?.message) {
            msg = err.error.message;
          }

          this._stateService.setDoctorsError(msg);
          this._stateService.setDoctorsLoading(false);
        }
      });
  }

  // ─── Availability ──────────────────────────────────

  /**
   * Called when a user clicks a doctor card.
   * Auto-selects today's date and navigates logically or triggers loadAvailability.
   */
  onDoctorSelected(doctor: SpecialtyDoctor): void {
    this._stateService.selectDoctor(doctor);

    // Automatically select today's date
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const formattedToday = `${yyyy}-${mm}-${dd}`;

    this.onDateSelected(formattedToday);
  }

  /**
   * Called when the user explicitely selects a date in Step 3.
   */
  onDateSelected(date: string): void {
    this._stateService.selectDate(date);
    this._stateService.selectTime(null);
    this.loadAvailability(date);
  }

  /**
   * Called when the user clicks an available time slot.
   */
  onTimeSelected(time: string): void {
    this._stateService.selectTime(time);
  }

  /**
   * Triggers the API call to load available times for the selected doctor and date.
   */
  loadAvailability(date: string): void {
    const doctor = this.selectedDoctor();
    if (!doctor) return;

    this._stateService.setAvailabilityLoading(true);
    this._stateService.setAvailabilityError(null);

    this._appointmentService.getAvailability(doctor.id, date)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: (data) => {
          this._stateService.setAvailability(data.availableTimes);
          this._stateService.setSlotDurationMinutes(data.slotDurationMinutes);
          this._stateService.setAvailabilityLoading(false);
        },
        error: (err) => {
          console.error('Error fetching availability:', err);
          let msg = this._translate.get('paciente.appointments.errors.doctor-not-available');

          if (err.status === 400 && err.error?.message) {
            const errorMsg = err.error.message.toLowerCase();
            if (errorMsg.includes('encontrado')) {
               msg = this._translate.get('paciente.appointments.errors.doctor-not-found');
            } else if (errorMsg.includes('atiende')) {
               msg = this._translate.get('paciente.appointments.errors.doctor-not-available');
            } else {
               msg = err.error.message;
            }
          }

          this._stateService.setAvailabilityError(msg);
          this._stateService.setAvailability([]); // Clear previous slots just in case
          this._stateService.setAvailabilityLoading(false);
        }
      });
  }

  // ─── Motivo ────────────────────────────────────────

  setMotivo(motivo: string): void {
    this._stateService.setMotivo(motivo);
  }

  // ─── Manual appointment creation ───────────────────

  /**
   * Builds the request from state, calls POST /citas, and invokes onSuccess
   * callback when the appointment is created (for step navigation).
   */
  confirmManualAppointment(onSuccess: () => void): void {
    const doctor = this.selectedDoctor();
    const date   = this.selectedDate();
    const time   = this.selectedTime();
    const motivo = this.motivo();

    if (!doctor || !date || !time || !motivo) return;

    const horaFin = this._calculateEndTime(time, this.slotDurationMinutes());

    const request: CreateAppointmentRequest = {
      medicoId: doctor.id,
      consultorioId: null, // Backend resolves automatically
      fecha: date,
      horaInicio: time,
      horaFin,
      motivo: motivo.trim()
    };

    this._stateService.setCreating(true);
    this._stateService.setCreateError(null);

    this._appointmentService.createAppointment(request)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: (result) => {
          this._stateService.setAppointmentResult(result);
          this._stateService.setCreating(false);
          onSuccess();
        },
        error: (err) => {
          console.error('Error creating appointment:', err);
          const msg = this._mapCreateError(err);
          this._stateService.setCreateError(msg);
          this._stateService.setCreating(false);
        }
      });
  }

  // ─── Quick appointment ─────────────────────────────

  /**
   * Requests a quick proposal from the backend and starts the countdown timer.
   */
  requestQuickProposal(onSuccess: () => void): void {
    const specialty = this.selectedSpecialty();
    const date      = this.selectedDate();
    if (!specialty || !date) return;

    this._stateService.setProposalLoading(true);
    this._stateService.setProposalError(null);

    this._appointmentService.getQuickProposal(specialty.id, date)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: (proposal) => {
          this._stateService.setProposal(proposal);
          this._stateService.setProposalLoading(false);
          this._startCountdown(proposal.expiresInSeconds);
          onSuccess();
        },
        error: (err) => {
          console.error('Error requesting quick proposal:', err);
          let msg = this._translate.get('paciente.appointments.errors.proposal-failed');
          if (err.status === 400 && err.error?.message) {
            msg = err.error.message;
          }
          this._stateService.setProposalError(msg);
          this._stateService.setProposalLoading(false);
        }
      });
  }

  /**
   * Confirms the quick appointment proposal and creates a real appointment.
   */
  confirmQuickAppointment(onSuccess: () => void): void {
    const proposal = this.proposal();
    const motivo   = this.motivo();
    if (!proposal || !motivo) return;

    const request: ConfirmQuickRequest = {
      reservaId: proposal.reservationId,
      motivo: motivo.trim()
    };

    this._stateService.setCreating(true);
    this._stateService.setCreateError(null);

    this._appointmentService.confirmQuickAppointment(request)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: (result) => {
          this._stateService.setAppointmentResult(result);
          this._stateService.setCreating(false);
          this._clearCountdownInterval();
          onSuccess();
        },
        error: (err) => {
          console.error('Error confirming quick appointment:', err);
          const msg = this._mapCreateError(err);
          this._stateService.setCreateError(msg);
          this._stateService.setCreating(false);
        }
      });
  }

  /**
   * Cancels the active quick proposal and releases the slot.
   */
  cancelQuickProposal(): void {
    this._clearCountdownInterval();
    this._stateService.setProposal(null);
    this._stateService.setProposalCountdown(0);

    this._appointmentService.cancelQuickProposal()
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        error: (err) => console.error('Error cancelling quick proposal:', err)
      });
  }

  // ─── Clear flow ────────────────────────────────────

  /**
   * Clears the entire flow state
   */
  clearFlow(): void {
    this._clearCountdownInterval();
    this._stateService.clear();
  }

  // ─── Private helpers ───────────────────────────────

  /**
   * Calculates the end time by adding durationMinutes to the startTime string.
   * @example _calculateEndTime('09:00:00', 30) → '09:30:00'
   */
  private _calculateEndTime(startTime: string, durationMinutes: number): string {
    const parts = startTime.split(':');
    const d = new Date();
    d.setHours(parseInt(parts[0], 10), parseInt(parts[1], 10), 0, 0);
    d.setMinutes(d.getMinutes() + durationMinutes);

    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    return `${hh}:${mm}:00`;
  }

  /**
   * Starts the countdown timer for a quick proposal.
   * Decrements every second and clears the proposal when it reaches 0.
   */
  private _startCountdown(seconds: number): void {
    this._clearCountdownInterval();
    this._stateService.setProposalCountdown(seconds);

    this._countdownInterval = setInterval(() => {
      const current = this._stateService.proposalCountdown();
      if (current <= 1) {
        this._clearCountdownInterval();
        this._stateService.setProposalCountdown(0);
        this._stateService.setProposal(null);
        this._stateService.setProposalError(
          this._translate.get('paciente.appointments.errors.proposal-expired')
        );
      } else {
        this._stateService.setProposalCountdown(current - 1);
      }
    }, 1000);
  }

  private _clearCountdownInterval(): void {
    if (this._countdownInterval) {
      clearInterval(this._countdownInterval);
      this._countdownInterval = null;
    }
  }

  /**
   * Silently cancels any active proposal without affecting UI error state.
   */
  private _cancelProposalSilently(): void {
    if (this._stateService.proposal()) {
      this._clearCountdownInterval();
      this._stateService.setProposal(null);
      this._stateService.setProposalCountdown(0);

      this._appointmentService.cancelQuickProposal()
        .pipe(takeUntilDestroyed(this._destroyRef))
        .subscribe({
          error: (err) => console.error('Error cancelling proposal silently:', err)
        });
    }
  }

  /**
   * Maps HTTP error responses to user-friendly i18n messages.
   */
  private _mapCreateError(err: { status?: number; error?: { message?: string } }): string {
    if (err.status === 409) {
      return this._translate.get('paciente.appointments.errors.slot-conflict');
    }
    if (err.status === 400 && err.error?.message) {
      return err.error.message;
    }
    return this._translate.get('paciente.appointments.errors.create-failed');
  }
}
