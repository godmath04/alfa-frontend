// src/app/core/services/appointment/appointment.state.ts
import { Injectable, signal } from '@angular/core';
import { SpecialtyCatalog, SpecialtyDoctor } from '../../models/appointment.model';

@Injectable({ providedIn: 'root' })
export class AppointmentStateService {

  // We use signals to store the data and an indication of loading/error 
  readonly specialties = signal<SpecialtyCatalog[]>([]);
  readonly loading     = signal<boolean>(false);
  readonly error       = signal<string | null>(null);

  // We might also want to store the specialty the user selects
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

  clear(): void {
    //Clear Specialties
    this.specialties.set([]);
    this.selectedSpecialty.set(null);
    this.error.set(null);
    this.loading.set(false);
    
    // Clear Doctors
    this.doctors.set([]);
    this.selectedDoctor.set(null);
    this.doctorsError.set(null);
    this.doctorsLoading.set(false);

    // Clear Availability
    this.selectedDate.set(null);
    this.selectedTime.set(null);
    this.availability.set([]);
    this.availabilityLoading.set(false);
    this.availabilityError.set(null);
  }

  // --- Doctors Setters ---
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

  // --- Availability Setters ---
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
}
