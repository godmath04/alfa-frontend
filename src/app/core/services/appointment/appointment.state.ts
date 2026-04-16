// src/app/core/services/appointment/appointment.state.ts
import { Injectable, signal } from '@angular/core';
import {
  SpecialtyCatalog,
  SpecialtyDoctor,
  FlowType,
  AppointmentResponse,
  QuickProposalResponse
} from '../../models/appointment.model';

@Injectable({ providedIn: 'root' })
export class AppointmentStateService {

  // --- Flow type ---
  readonly flowType = signal<FlowType | null>(null);

  // --- Specialties signals ---
  readonly specialties       = signal<SpecialtyCatalog[]>([]);
  readonly loading           = signal<boolean>(false);
  readonly error             = signal<string | null>(null);
  readonly selectedSpecialty = signal<SpecialtyCatalog | null>(null);

  // --- Doctors signals ---
  readonly selectedDoctor = signal<SpecialtyDoctor | null>(null);
  readonly doctors        = signal<SpecialtyDoctor[]>([]);
  readonly doctorsLoading = signal<boolean>(false);
  readonly doctorsError   = signal<string | null>(null);

  // --- Availability signals ---
  readonly selectedDate        = signal<string | null>(null);
  readonly selectedTime        = signal<string | null>(null);
  readonly availability        = signal<string[]>([]);
  readonly availabilityLoading = signal<boolean>(false);
  readonly availabilityError   = signal<string | null>(null);
  readonly slotDurationMinutes = signal<number>(30);

  // --- Manual appointment creation ---
  readonly motivo            = signal<string | null>(null);
  readonly appointmentResult = signal<AppointmentResponse | null>(null);
  readonly creating          = signal<boolean>(false);
  readonly createError       = signal<string | null>(null);

  // --- Quick appointment ---
  readonly proposal          = signal<QuickProposalResponse | null>(null);
  readonly proposalCountdown = signal<number>(0);
  readonly proposalLoading   = signal<boolean>(false);
  readonly proposalError     = signal<string | null>(null);

  // ─── Flow type setter ─────────────────────────────

  setFlowType(flow: FlowType | null): void {
    this.flowType.set(flow);
  }

  // ─── Specialties setters ──────────────────────────

  setSpecialties(data: SpecialtyCatalog[]): void {
    this.specialties.set(data);
  }
  setLoading(isLoading: boolean): void {
    this.loading.set(isLoading);
  }
  setError(msg: string | null): void {
    this.error.set(msg);
  }
  selectSpecialty(specialty: SpecialtyCatalog): void {
    this.selectedSpecialty.set(specialty);
  }

  // ─── Doctors setters ──────────────────────────────

  setDoctors(data: SpecialtyDoctor[]): void {
    this.doctors.set(data);
  }
  setDoctorsLoading(isLoading: boolean): void {
    this.doctorsLoading.set(isLoading);
  }
  setDoctorsError(msg: string | null): void {
    this.doctorsError.set(msg);
  }
  selectDoctor(doctor: SpecialtyDoctor): void {
    this.selectedDoctor.set(doctor);
  }

  // ─── Availability setters ─────────────────────────

  selectDate(date: string): void {
    this.selectedDate.set(date);
  }
  selectTime(time: string | null): void {
    this.selectedTime.set(time);
  }
  setAvailability(times: string[]): void {
    this.availability.set(times);
  }
  setAvailabilityLoading(isLoading: boolean): void {
    this.availabilityLoading.set(isLoading);
  }
  setAvailabilityError(msg: string | null): void {
    this.availabilityError.set(msg);
  }
  setSlotDurationMinutes(minutes: number): void {
    this.slotDurationMinutes.set(minutes);
  }

  // ─── Manual creation setters ──────────────────────

  setMotivo(motivo: string | null): void {
    this.motivo.set(motivo);
  }
  setAppointmentResult(result: AppointmentResponse | null): void {
    this.appointmentResult.set(result);
  }
  setCreating(isCreating: boolean): void {
    this.creating.set(isCreating);
  }
  setCreateError(msg: string | null): void {
    this.createError.set(msg);
  }

  // ─── Quick appointment setters ────────────────────

  setProposal(proposal: QuickProposalResponse | null): void {
    this.proposal.set(proposal);
  }
  setProposalCountdown(seconds: number): void {
    this.proposalCountdown.set(seconds);
  }
  setProposalLoading(isLoading: boolean): void {
    this.proposalLoading.set(isLoading);
  }
  setProposalError(msg: string | null): void {
    this.proposalError.set(msg);
  }

  // ─── Clear everything ─────────────────────────────

  clear(): void {
    // Flow
    this.flowType.set(null);

    // Specialties
    this.specialties.set([]);
    this.selectedSpecialty.set(null);
    this.error.set(null);
    this.loading.set(false);

    // Doctors
    this.doctors.set([]);
    this.selectedDoctor.set(null);
    this.doctorsError.set(null);
    this.doctorsLoading.set(false);

    // Availability
    this.selectedDate.set(null);
    this.selectedTime.set(null);
    this.availability.set([]);
    this.availabilityLoading.set(false);
    this.availabilityError.set(null);
    this.slotDurationMinutes.set(30);

    // Manual creation
    this.motivo.set(null);
    this.appointmentResult.set(null);
    this.creating.set(false);
    this.createError.set(null);

    // Quick appointment
    this.proposal.set(null);
    this.proposalCountdown.set(0);
    this.proposalLoading.set(false);
    this.proposalError.set(null);
  }
}
