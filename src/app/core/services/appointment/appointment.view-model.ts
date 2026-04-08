// src/app/core/services/appointment/appointment.view-model.ts
import { Injectable, inject, DestroyRef, computed } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { AppointmentService } from './appointment';
import { AppointmentStateService } from './appointment.state';
import { Translate } from '../translate';
import { SpecialtyCatalog } from '../../models/appointment.model';

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
  readonly hasSpecialties = computed(() => this.specialties().length > 0);

  // Doctors state
  readonly doctors        = computed(() => this._stateService.doctors());
  readonly doctorsLoading = computed(() => this._stateService.doctorsLoading());
  readonly doctorsError   = computed(() => this._stateService.doctorsError());


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
   * Clears the entire flow state
   */
  clearFlow(): void {
    this._stateService.clear();
  }
}
