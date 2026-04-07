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
    // Future expansion: trigger navigation to "Step 2"
    console.log('Specialty selected:', specialty.nombre);
  }

  /**
   * Clears the entire flow state
   */
  clearFlow(): void {
    this._stateService.clear();
  }
}
