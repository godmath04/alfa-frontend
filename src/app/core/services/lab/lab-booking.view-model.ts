import { Injectable, inject, computed } from '@angular/core';
import { forkJoin } from 'rxjs';

import { LabBookingState } from './lab-booking.state';
import { LabService } from './lab.service';
import { AdminService } from '../admin/admin.service';
import { LabCatalog, LabCitaRequest } from '../../models/lab.model';
import { generateNextDays } from '../../../shared/utils/date-time.utils';

@Injectable({ providedIn: 'root' })
export class LabBookingViewModel {

  private readonly _state = inject(LabBookingState);
  private readonly _svc   = inject(LabService);
  private readonly _admin = inject(AdminService);

  // ─── Public read ─────────────────────────────────────────────────────────

  readonly labs                    = this._state.labs;
  readonly selectedLab             = this._state.selectedLab;
  readonly labsLoading             = this._state.labsLoading;
  readonly labsError               = this._state.labsError;

  readonly disponibilidad          = this._state.disponibilidad;
  readonly selectedDate            = this._state.selectedDate;
  readonly selectedTime            = this._state.selectedTime;
  readonly slotLoading             = this._state.slotLoading;
  readonly slotError               = this._state.slotError;

  readonly studyTypes              = this._state.studyTypes;
  readonly insuranceTypes          = this._state.insuranceTypes;
  readonly catalogLoading          = this._state.catalogLoading;
  readonly catalogError            = this._state.catalogError;

  readonly selectedStudyTypeId     = this._state.selectedStudyTypeId;
  readonly selectedStudyTypeName   = this._state.selectedStudyTypeName;
  readonly selectedInsuranceTypeId = this._state.selectedInsuranceTypeId;
  readonly selectedInsuranceTypeName = this._state.selectedInsuranceTypeName;
  readonly observations            = this._state.observations;
  readonly medicoId                = this._state.medicoId;
  readonly doctors                 = this._state.doctors;

  readonly creationResult  = this._state.creationResult;
  readonly creating        = this._state.creating;
  readonly creationError   = this._state.creationError;

  // ─── Derived ─────────────────────────────────────────────────────────────

  readonly availableDates = generateNextDays(30);

  readonly availableTimes = computed(() =>
    this._state.disponibilidad()?.horariosDisponibles ?? []);

  readonly canConfirmDetails = computed(() =>
    this._state.selectedStudyTypeId()   !== null &&
    this._state.selectedInsuranceTypeId() !== null);

  // ─── Actions ──────────────────────────────────────────────────────────────

  loadLabs(): void {
    this._state.setLabsLoading(true);
    this._state.setLabsError(null);
    this._svc.getLabs().subscribe({
      next:  labs => { this._state.setLabs(labs); this._state.setLabsLoading(false); },
      error: ()   => { this._state.setLabsError('lab.errors.loadLabs'); this._state.setLabsLoading(false); },
    });
  }

  loadCatalogs(): void {
    this._state.setCatalogLoading(true);
    this._state.setCatalogError(null);
    forkJoin({
      studyTypes:     this._svc.getStudyTypes(),
      insuranceTypes: this._svc.getInsuranceTypes(),
      doctors:        this._admin.getActiveDoctors(),
    }).subscribe({
      next: ({ studyTypes, insuranceTypes, doctors }) => {
        this._state.setStudyTypes(studyTypes);
        this._state.setInsuranceTypes(insuranceTypes);
        this._state.setDoctors(doctors);
        this._state.setCatalogLoading(false);
      },
      error: () => {
        this._state.setCatalogError('lab.errors.loadCatalogs');
        this._state.setCatalogLoading(false);
      },
    });
  }

  selectLab(lab: LabCatalog): void {
    this._state.selectLab(lab);
  }

  selectDate(date: string): void {
    this._state.selectDate(date);
    const labId = this._state.selectedLab()?.id;
    if (!labId) return;
    this._state.setSlotLoading(true);
    this._svc.getLabDisponibilidad(labId, date).subscribe({
      next:  d  => { this._state.setDisponibilidad(d); this._state.setSlotLoading(false); },
      error: () => { this._state.setSlotError('lab.errors.loadSlots'); this._state.setSlotLoading(false); },
    });
  }

  selectTime(time: string): void {
    this._state.selectTime(time);
  }

  selectStudyType(id: number, name: string): void {
    this._state.selectStudyType(id, name);
  }

  selectInsuranceType(id: number, name: string): void {
    this._state.selectInsuranceType(id, name);
  }

  setObservations(obs: string): void {
    this._state.setObservations(obs);
  }

  setMedicoId(medicoId: string): void {
    this._state.setMedicoId(medicoId);
  }

  book(onSuccess: () => void, patientId?: number,
       guestData?: { nombre: string; apellido: string; email: string; phone: string; idNumber: string }
  ): void {
    const lab         = this._state.selectedLab();
    const date        = this._state.selectedDate();
    const time        = this._state.selectedTime();
    const studyTypeId = this._state.selectedStudyTypeId();
    const studyName   = this._state.selectedStudyTypeName();
    const insId       = this._state.selectedInsuranceTypeId();
    const insName     = this._state.selectedInsuranceTypeName();
    const obs         = this._state.observations();
    const medicoId    = this._state.medicoId();

    if (!lab || !date || !time || !studyTypeId || !studyName || !insId || !insName) return;

    const req: LabCitaRequest = {
      labId: lab.id,
      fecha: date,
      horaInicio: time,
      studyTypeId,
      studyTypeName: studyName,
      insuranceTypeId: insId,
      insuranceTypeName: insName,
      observations: obs || undefined,
      pacienteId: patientId,
      guestNombre:    guestData?.nombre,
      guestApellido:  guestData?.apellido,
      guestEmail:     guestData?.email,
      guestPhone:     guestData?.phone,
      guestIdNumber:  guestData?.idNumber,
      medicoId:       medicoId || undefined,
    };

    this._state.setCreating(true);
    this._state.setCreationError(null);
    this._svc.crearLabCita(req).subscribe({
      next: result => {
        this._state.setCreationResult(result);
        this._state.setCreating(false);
        onSuccess();
      },
      error: () => {
        this._state.setCreationError('lab.errors.createFailed');
        this._state.setCreating(false);
      },
    });
  }

  clear(): void {
    this._state.clear();
  }
}
