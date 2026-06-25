import { Injectable, computed, signal } from '@angular/core';
import {
  LabCatalog, LabDisponibilidad, LabCitaResponse,
  StudyType, InsuranceType,
} from '../../models/lab.model';
import { DoctorProfile } from '../../models/admin.model';

interface LabState {
  labs: LabCatalog[];
  selected: LabCatalog | null;
  loading: boolean;
  error: string | null;
}

interface SlotState {
  disponibilidad: LabDisponibilidad | null;
  selectedDate: string | null;
  selectedTime: string | null;
  loading: boolean;
  error: string | null;
}

interface CatalogState {
  studyTypes: StudyType[];
  insuranceTypes: InsuranceType[];
  loading: boolean;
  error: string | null;
}

interface DetailsState {
  selectedStudyTypeId: number | null;
  selectedStudyTypeName: string | null;
  selectedInsuranceTypeId: number | null;
  selectedInsuranceTypeName: string | null;
  observations: string;
  medicoId: string;
  doctors: DoctorProfile[];
}

interface CreationState {
  result: LabCitaResponse | null;
  loading: boolean;
  error: string | null;
}

@Injectable({ providedIn: 'root' })
export class LabBookingState {

  private readonly _lab      = signal<LabState>({ labs: [], selected: null, loading: false, error: null });
  private readonly _slot     = signal<SlotState>({ disponibilidad: null, selectedDate: null, selectedTime: null, loading: false, error: null });
  private readonly _catalog  = signal<CatalogState>({ studyTypes: [], insuranceTypes: [], loading: false, error: null });
  private readonly _details  = signal<DetailsState>({ selectedStudyTypeId: null, selectedStudyTypeName: null, selectedInsuranceTypeId: null, selectedInsuranceTypeName: null, observations: '', medicoId: '', doctors: [] });
  private readonly _creation = signal<CreationState>({ result: null, loading: false, error: null });

  // ─── Lab ──────────────────────────────────────────────────────────────────

  readonly labs         = computed(() => this._lab().labs);
  readonly selectedLab  = computed(() => this._lab().selected);
  readonly labsLoading  = computed(() => this._lab().loading);
  readonly labsError    = computed(() => this._lab().error);

  setLabs(labs: LabCatalog[]): void    { this._lab.update(s => ({ ...s, labs })); }
  setLabsLoading(v: boolean): void     { this._lab.update(s => ({ ...s, loading: v })); }
  setLabsError(e: string | null): void { this._lab.update(s => ({ ...s, error: e })); }
  selectLab(lab: LabCatalog): void     { this._lab.update(s => ({ ...s, selected: lab })); }

  // ─── Slot ─────────────────────────────────────────────────────────────────

  readonly disponibilidad   = computed(() => this._slot().disponibilidad);
  readonly selectedDate     = computed(() => this._slot().selectedDate);
  readonly selectedTime     = computed(() => this._slot().selectedTime);
  readonly slotLoading      = computed(() => this._slot().loading);
  readonly slotError        = computed(() => this._slot().error);

  setDisponibilidad(d: LabDisponibilidad | null): void { this._slot.update(s => ({ ...s, disponibilidad: d })); }
  setSlotLoading(v: boolean): void                     { this._slot.update(s => ({ ...s, loading: v })); }
  setSlotError(e: string | null): void                 { this._slot.update(s => ({ ...s, error: e })); }
  selectDate(date: string): void                       { this._slot.update(s => ({ ...s, selectedDate: date, selectedTime: null, disponibilidad: null })); }
  selectTime(time: string | null): void                { this._slot.update(s => ({ ...s, selectedTime: time })); }

  // ─── Catalog ─────────────────────────────────────────────────────────────

  readonly studyTypes      = computed(() => this._catalog().studyTypes);
  readonly insuranceTypes  = computed(() => this._catalog().insuranceTypes);
  readonly catalogLoading  = computed(() => this._catalog().loading);
  readonly catalogError    = computed(() => this._catalog().error);

  setStudyTypes(list: StudyType[]): void    { this._catalog.update(s => ({ ...s, studyTypes: list })); }
  setInsuranceTypes(list: InsuranceType[]): void { this._catalog.update(s => ({ ...s, insuranceTypes: list })); }
  setCatalogLoading(v: boolean): void       { this._catalog.update(s => ({ ...s, loading: v })); }
  setCatalogError(e: string | null): void   { this._catalog.update(s => ({ ...s, error: e })); }

  // ─── Details ─────────────────────────────────────────────────────────────

  readonly selectedStudyTypeId      = computed(() => this._details().selectedStudyTypeId);
  readonly selectedStudyTypeName    = computed(() => this._details().selectedStudyTypeName);
  readonly selectedInsuranceTypeId  = computed(() => this._details().selectedInsuranceTypeId);
  readonly selectedInsuranceTypeName = computed(() => this._details().selectedInsuranceTypeName);
  readonly observations             = computed(() => this._details().observations);
  readonly medicoId                 = computed(() => this._details().medicoId);
  readonly doctors                  = computed(() => this._details().doctors);

  selectStudyType(id: number, name: string): void    { this._details.update(s => ({ ...s, selectedStudyTypeId: id, selectedStudyTypeName: name })); }
  selectInsuranceType(id: number, name: string): void { this._details.update(s => ({ ...s, selectedInsuranceTypeId: id, selectedInsuranceTypeName: name })); }
  setObservations(obs: string): void                  { this._details.update(s => ({ ...s, observations: obs })); }
  setMedicoId(medicoId: string): void                 { this._details.update(s => ({ ...s, medicoId })); }
  setDoctors(doctors: DoctorProfile[]): void          { this._details.update(s => ({ ...s, doctors })); }

  // ─── Creation ─────────────────────────────────────────────────────────────

  readonly creationResult   = computed(() => this._creation().result);
  readonly creating         = computed(() => this._creation().loading);
  readonly creationError    = computed(() => this._creation().error);

  setCreationResult(r: LabCitaResponse | null): void { this._creation.update(s => ({ ...s, result: r })); }
  setCreating(v: boolean): void                       { this._creation.update(s => ({ ...s, loading: v })); }
  setCreationError(e: string | null): void            { this._creation.update(s => ({ ...s, error: e })); }

  // ─── Reset ────────────────────────────────────────────────────────────────

  clear(): void {
    this._lab.set({ labs: [], selected: null, loading: false, error: null });
    this._slot.set({ disponibilidad: null, selectedDate: null, selectedTime: null, loading: false, error: null });
    this._catalog.set({ studyTypes: [], insuranceTypes: [], loading: false, error: null });
    this._details.set({ selectedStudyTypeId: null, selectedStudyTypeName: null, selectedInsuranceTypeId: null, selectedInsuranceTypeName: null, observations: '', medicoId: '', doctors: [] });
    this._creation.set({ result: null, loading: false, error: null });
  }
}
