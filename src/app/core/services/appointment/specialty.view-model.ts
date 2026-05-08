import { Injectable, inject, DestroyRef, computed } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { AppointmentService } from './appointment';
import { AppointmentStateService } from './appointment.state';
import { Translate } from '../translate';
import { SpecialtyCatalog } from '../../models/appointment.model';

@Injectable({ providedIn: 'root' })
export class SpecialtyViewModel {
  private readonly _appointmentService = inject(AppointmentService);
  private readonly _stateService = inject(AppointmentStateService);
  private readonly _translate = inject(Translate);
  private readonly _destroyRef = inject(DestroyRef);

  readonly specialties = computed(() => this._stateService.specialties());
  readonly loading = computed(() => this._stateService.loading());
  readonly error = computed(() => this._stateService.error());
  readonly hasSpecialties = computed(() => this._stateService.specialties().length > 0);
  readonly selectedSpecialty = computed(() => this._stateService.selectedSpecialty());

  loadSpecialties(): void {
    if (this.hasSpecialties()) return;

    this._stateService.setLoading(true);
    this._stateService.setError(null);

    this._appointmentService
      .getSpecialties()
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: (data) => {
          this._stateService.setSpecialties(data);
          this._stateService.setLoading(false);
        },
        error: () => {
          this._stateService.setError(
            this._translate.get('paciente.appointments.errors.fetch-catalog'),
          );
          this._stateService.setLoading(false);
        },
      });
  }

  selectSpecialty(specialty: SpecialtyCatalog): void {
    this._stateService.selectSpecialty(specialty);
  }
}
