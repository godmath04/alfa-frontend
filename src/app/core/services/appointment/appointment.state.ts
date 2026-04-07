// src/app/core/services/appointment/appointment.state.ts
import { Injectable, signal } from '@angular/core';
import { SpecialtyCatalog } from '../../models/appointment.model';

@Injectable({ providedIn: 'root' })
export class AppointmentStateService {

  // We use signals to store the data and an indication of loading/error 
  readonly specialties = signal<SpecialtyCatalog[]>([]);
  readonly loading     = signal<boolean>(false);
  readonly error       = signal<string | null>(null);

  // We might also want to store the specialty the user selects
  readonly selectedSpecialty = signal<SpecialtyCatalog | null>(null);

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
    this.specialties.set([]);
    this.selectedSpecialty.set(null);
    this.error.set(null);
    this.loading.set(false);
  }
}
