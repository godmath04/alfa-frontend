// src/app/core/services/appointment/appointment.view-model.ts
import { Injectable, inject, DestroyRef, computed } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { AppointmentService } from './appointment';
import { AppointmentStateService } from './appointment.state';
import { Translate } from '../translate';
import { SpecialtyCatalog, SpecialtyDoctor } from '../../models/appointment.model';

@Injectable({ providedIn: 'root' })
export class AppointmentViewModel {

  private readonly _appointmentService = inject(AppointmentService);
  private readonly _stateService       = inject(AppointmentStateService);
  private readonly _translate          = inject(Translate);
  private readonly _destroyRef         = inject(DestroyRef);

  // We expose state as read-only computed signals so the Component can't mutate them directly
  readonly specialties = computed(() => this._stateService.specialties());
  readonly loading     = computed(() => this._stateService.loading());
  readonly error       = computed(() => this._stateService.error());
  
  // Computed property to check if there are any specialties
  readonly hasSpecialties    = computed(() => this.specialties().length > 0);
  readonly selectedSpecialty = computed(() => this._stateService.selectedSpecialty());

  // Doctors state
  readonly doctors        = computed(() => this._stateService.doctors());
  readonly doctorsLoading = computed(() => this._stateService.doctorsLoading());
  readonly doctorsError   = computed(() => this._stateService.doctorsError());

  // Availability state
  readonly selectedDoctor      = computed(() => this._stateService.selectedDoctor());
  readonly selectedDate        = computed(() => this._stateService.selectedDate());
  readonly selectedTime        = computed(() => this._stateService.selectedTime());
  readonly availability        = computed(() => this._stateService.availability());
  readonly availabilityLoading = computed(() => this._stateService.availabilityLoading());
  readonly availabilityError   = computed(() => this._stateService.availabilityError());


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
   * Called when the user clicks a specialty card
   */
  onSpecialtySelected(specialty: SpecialtyCatalog): void {
    this._stateService.selectSpecialty(specialty);
    // Start loading doctors
    this.loadDoctors(specialty.id);
  }
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

  /**
   * Clears the entire flow state
   */
  clearFlow(): void {
    this._stateService.clear();
  }
}
