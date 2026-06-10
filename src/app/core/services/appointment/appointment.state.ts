import { Injectable, computed, signal } from '@angular/core';
import {
  SpecialtyCatalog,
  SpecialtyDoctor,
  FlowType,
  AppointmentResponse,
  QuickProposalResponse
} from '../../models/appointment.model';

interface SpecialtyState {
  catalog:  SpecialtyCatalog[];
  selected: SpecialtyCatalog | null;
  loading:  boolean;
  error:    string | null;
}

interface DoctorState {
  list:     SpecialtyDoctor[];
  selected: SpecialtyDoctor | null;
  loading:  boolean;
  error:    string | null;
}

interface AvailabilityState {
  times:               string[];
  selectedDate:        string | null;
  selectedTime:        string | null;
  loading:             boolean;
  error:               string | null;
  slotDurationMinutes: number;
}

interface CreationState {
  motivo:  string | null;
  result:  AppointmentResponse | null;
  loading: boolean;
  error:   string | null;
}

interface QuickState {
  proposal:  QuickProposalResponse | null;
  countdown: number;
  loading:   boolean;
  error:     string | null;
}

@Injectable({ providedIn: 'root' })
export class AppointmentStateService {

  private readonly _flow         = signal<FlowType | null>(null);
  private readonly _specialty    = signal<SpecialtyState>({ catalog: [], selected: null, loading: false, error: null });
  private readonly _doctor       = signal<DoctorState>({ list: [], selected: null, loading: false, error: null });
  private readonly _availability = signal<AvailabilityState>({ times: [], selectedDate: null, selectedTime: null, loading: false, error: null, slotDurationMinutes: 30 });
  private readonly _creation     = signal<CreationState>({ motivo: null, result: null, loading: false, error: null });
  private readonly _quick        = signal<QuickState>({ proposal: null, countdown: 0, loading: false, error: null });

  // ─── Public read API ───────────────────────────────

  readonly flowType            = computed(() => this._flow());

  readonly specialties         = computed(() => this._specialty().catalog);
  readonly loading             = computed(() => this._specialty().loading);
  readonly error               = computed(() => this._specialty().error);
  readonly selectedSpecialty   = computed(() => this._specialty().selected);

  readonly doctors             = computed(() => this._doctor().list);
  readonly doctorsLoading      = computed(() => this._doctor().loading);
  readonly doctorsError        = computed(() => this._doctor().error);
  readonly selectedDoctor      = computed(() => this._doctor().selected);

  readonly selectedDate        = computed(() => this._availability().selectedDate);
  readonly selectedTime        = computed(() => this._availability().selectedTime);
  readonly availability        = computed(() => this._availability().times);
  readonly availabilityLoading = computed(() => this._availability().loading);
  readonly availabilityError   = computed(() => this._availability().error);
  readonly slotDurationMinutes = computed(() => this._availability().slotDurationMinutes);

  readonly motivo              = computed(() => this._creation().motivo);
  readonly appointmentResult   = computed(() => this._creation().result);
  readonly creating            = computed(() => this._creation().loading);
  readonly createError         = computed(() => this._creation().error);

  readonly proposal            = computed(() => this._quick().proposal);
  readonly proposalCountdown   = computed(() => this._quick().countdown);
  readonly proposalLoading     = computed(() => this._quick().loading);
  readonly proposalError       = computed(() => this._quick().error);

  // ─── Flow ──────────────────────────────────────────

  setFlowType(flow: FlowType | null): void { this._flow.set(flow); }

  // ─── Specialty ─────────────────────────────────────

  setSpecialties(catalog: SpecialtyCatalog[]): void        { this._specialty.update(s => ({ ...s, catalog })); }
  setLoading(loading: boolean): void                        { this._specialty.update(s => ({ ...s, loading })); }
  setError(error: string | null): void                      { this._specialty.update(s => ({ ...s, error })); }
  selectSpecialty(selected: SpecialtyCatalog): void         { this._specialty.update(s => ({ ...s, selected })); }

  // ─── Doctor ────────────────────────────────────────

  setDoctors(list: SpecialtyDoctor[]): void                 { this._doctor.update(s => ({ ...s, list })); }
  setDoctorsLoading(loading: boolean): void                 { this._doctor.update(s => ({ ...s, loading })); }
  setDoctorsError(error: string | null): void               { this._doctor.update(s => ({ ...s, error })); }
  selectDoctor(selected: SpecialtyDoctor): void             { this._doctor.update(s => ({ ...s, selected })); }

  // ─── Availability ──────────────────────────────────

  selectDate(selectedDate: string): void                    { this._availability.update(s => ({ ...s, selectedDate })); }
  selectTime(selectedTime: string | null): void             { this._availability.update(s => ({ ...s, selectedTime })); }
  setAvailability(times: string[]): void                    { this._availability.update(s => ({ ...s, times })); }
  setAvailabilityLoading(loading: boolean): void            { this._availability.update(s => ({ ...s, loading })); }
  setAvailabilityError(error: string | null): void          { this._availability.update(s => ({ ...s, error })); }
  setSlotDurationMinutes(slotDurationMinutes: number): void { this._availability.update(s => ({ ...s, slotDurationMinutes })); }

  // ─── Creation ──────────────────────────────────────

  setMotivo(motivo: string | null): void                    { this._creation.update(s => ({ ...s, motivo })); }
  setAppointmentResult(result: AppointmentResponse | null): void { this._creation.update(s => ({ ...s, result })); }
  setCreating(loading: boolean): void                       { this._creation.update(s => ({ ...s, loading })); }
  setCreateError(error: string | null): void                { this._creation.update(s => ({ ...s, error })); }

  // ─── Quick appointment ─────────────────────────────

  setProposal(proposal: QuickProposalResponse | null): void { this._quick.update(s => ({ ...s, proposal })); }
  setProposalCountdown(countdown: number): void             { this._quick.update(s => ({ ...s, countdown })); }
  setProposalLoading(loading: boolean): void                { this._quick.update(s => ({ ...s, loading })); }
  setProposalError(error: string | null): void              { this._quick.update(s => ({ ...s, error })); }

  // ─── Reset ─────────────────────────────────────────

  clear(): void {
    this._flow.set(null);
    this._specialty.set({ catalog: [], selected: null, loading: false, error: null });
    this._doctor.set({ list: [], selected: null, loading: false, error: null });
    this._availability.set({ times: [], selectedDate: null, selectedTime: null, loading: false, error: null, slotDurationMinutes: 30 });
    this._creation.set({ motivo: null, result: null, loading: false, error: null });
    this._quick.set({ proposal: null, countdown: 0, loading: false, error: null });
  }
}
