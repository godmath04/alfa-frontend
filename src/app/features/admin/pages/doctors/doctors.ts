import { Component, afterNextRender, computed, inject, signal } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';

import { Translate } from '../../../../core/services/translate';
import { DoctorViewModel } from '../../../../core/services/admin/doctor.view-model';
import { OfficeViewModel } from '../../../../core/services/admin/office.view-model';
import { SpecialtyViewModel } from '../../../../core/services/admin/specialty.view-model';
import { UserViewModel } from '../../../../core/services/admin/user.view-model';
import { HorarioViewModel } from '../../../../core/services/admin/horario.view-model';
import { DoctorProfile, DoctorProfileRequest, DoctorType, UserProfile } from '../../../../core/models/admin.model';

@Component({
  selector: 'app-doctors',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './doctors.html',
  styleUrl: './doctors.scss',
})
export class DoctorsPage {

  readonly t           = inject(Translate);
  readonly doctorVm    = inject(DoctorViewModel);
  readonly officeVm    = inject(OfficeViewModel);
  readonly specialtyVm = inject(SpecialtyViewModel);
  readonly userVm      = inject(UserViewModel);
  readonly horarioVm   = inject(HorarioViewModel);

  // ─── Doctor form ───────────────────────────────────────────────────────────
  readonly _formVisible = signal(false);
  readonly _editingId   = signal<number | null>(null);
  readonly _formError   = signal<string | null>(null);

  readonly _fUserId      = signal<number | null>(null);
  readonly _fEmail       = signal('');
  readonly _fFirstName   = signal('');
  readonly _fLastName    = signal('');
  readonly _fIdNumber    = signal('');
  readonly _fType        = signal<DoctorType>('INTERNO');
  readonly _fOfficeId    = signal<number | null>(null);
  readonly _fSpecialties = signal<number[]>([]);

  readonly _selectedUser = computed<UserProfile | undefined>(() =>
    this.userVm.users().find(u => u.id === this._fUserId())
  );

  readonly _availableOffices = computed(() => {
    if (this._fType() === 'EXTERNO') return [];
    const takenByInterno = new Set(
      this.doctorVm.doctors()
        .filter(d => d.type === 'INTERNO' && d.officeId !== null && d.id !== this._editingId())
        .map(d => d.officeId)
    );
    return this.officeVm.offices().filter(o =>
      o.active && o.type === 'INTERNAL' && !takenByInterno.has(o.id)
    );
  });

  readonly _availableMedicos = computed(() => {
    const assignedIds = new Set(this.doctorVm.doctors().map(d => d.userId));
    return this.userVm.medicos().filter(u => !assignedIds.has(u.id));
  });

  // ─── Schedule panel ────────────────────────────────────────────────────────
  readonly _scheduleDoctor = signal<DoctorProfile | null>(null);

  readonly _WEEK_DAYS = [
    { value: 0, key: 'common.days.monday' },
    { value: 1, key: 'common.days.tuesday' },
    { value: 2, key: 'common.days.wednesday' },
    { value: 3, key: 'common.days.thursday' },
    { value: 4, key: 'common.days.friday' },
    { value: 5, key: 'common.days.saturday' },
    { value: 6, key: 'common.days.sunday' },
  ];

  readonly _editingDayStart = signal<Record<number, string>>({});
  readonly _editingDayEnd   = signal<Record<number, string>>({});

  constructor() {
    afterNextRender(() => {
      this.doctorVm.loadAll();
      this.officeVm.loadAll();
      this.specialtyVm.loadAll();
      this.userVm.loadAll();
    });
  }

  // ─── Doctor form actions ───────────────────────────────────────────────────

  _openCreate(): void {
    this._editingId.set(null);
    this._fUserId.set(null); this._fEmail.set(''); this._fFirstName.set('');
    this._fLastName.set(''); this._fIdNumber.set(''); this._fType.set('INTERNO');
    this._fOfficeId.set(null); this._fSpecialties.set([]);
    this._formError.set(null);
    this._formVisible.set(true);
  }

  _openEdit(d: DoctorProfile): void {
    this._editingId.set(d.id);
    this._fUserId.set(d.userId); this._fEmail.set(d.email ?? '');
    this._fFirstName.set(d.firstName); this._fLastName.set(d.lastName);
    this._fIdNumber.set(d.idNumber); this._fType.set(d.type ?? 'INTERNO');
    this._fOfficeId.set(d.officeId);
    this._fSpecialties.set(d.specialties.map(s => s.id));
    this._formError.set(null);
    this._formVisible.set(true);
  }

  _cancel(): void {
    this._formVisible.set(false);
    this._editingId.set(null);
    this._formError.set(null);
  }

  _save(): void {
    const userId = this._fUserId(), email = this._fEmail().trim();
    const firstName = this._fFirstName().trim(), lastName = this._fLastName().trim();
    const idNumber = this._selectedUser()?.idNumber?.trim() || this._fIdNumber().trim();

    if (!userId)    { this._formError.set(this.t.get('admin.doctors.validation.user-required'));  return; }
    if (!email)     { this._formError.set(this.t.get('admin.doctors.validation.email-required')); return; }
    if (!firstName) { this._formError.set(this.t.get('admin.doctors.validation.first-required')); return; }
    if (!lastName)  { this._formError.set(this.t.get('admin.doctors.validation.last-required'));  return; }

    const request: DoctorProfileRequest = {
      userId, email, firstName, lastName, idNumber,
      type:         this._fType(),
      officeId:     this._fOfficeId() ?? undefined,
      specialtyIds: this._fSpecialties(),
    };

    const id = this._editingId();
    const action$ = id !== null ? this.doctorVm.update(id, request) : this.doctorVm.create(request);
    action$.subscribe({
      next:  () => this._cancel(),
      error: () => this._formError.set(this.t.get('admin.doctors.save-error')),
    });
  }

  _onTypeChange(type: DoctorType): void {
    this._fType.set(type);
    if (type === 'EXTERNO') this._fOfficeId.set(null);
  }

  _onUserChange(userId: number): void {
    this._fUserId.set(userId);
    const user = this.userVm.users().find(u => u.id === userId);
    if (user) {
      this._fEmail.set(user.email);
      if (user.idNumber) this._fIdNumber.set(user.idNumber);
    }
  }

  _toggleSpecialty(id: number): void {
    const current = this._fSpecialties();
    this._fSpecialties.set(current.includes(id) ? current.filter(x => x !== id) : [...current, id]);
  }

  _isSpecialtySelected(id: number): boolean { return this._fSpecialties().includes(id); }
  _isEditing(): boolean { return this._editingId() !== null; }

  _userOf(userId: number): UserProfile | undefined {
    return this.userVm.users().find(u => u.id === userId);
  }

  _officeNumberOf(officeId: number | null): string {
    if (!officeId) return '—';
    return this.officeVm.offices().find(o => o.id === officeId)?.number ?? '—';
  }

  // ─── Schedule panel actions ────────────────────────────────────────────────

  _openSchedules(d: DoctorProfile): void {
    if (this._scheduleDoctor()?.id === d.id) {
      this._scheduleDoctor.set(null);
      this.horarioVm.clear();
    } else {
      this._scheduleDoctor.set(d);
      this.horarioVm.loadForMedico(d.id);
      this._editingDayStart.set({});
      this._editingDayEnd.set({});
    }
  }

  _getHorario(diaSemana: number) {
    return this.horarioVm.getForDay(diaSemana);
  }

  _setDayTime(diaSemana: number, field: 'start' | 'end', value: string): void {
    if (field === 'start') this._editingDayStart.update(m => ({ ...m, [diaSemana]: value }));
    else                   this._editingDayEnd.update(m => ({ ...m, [diaSemana]: value }));
  }

  _saveDay(diaSemana: number): void {
    const medicoId = this._scheduleDoctor()?.id;
    if (!medicoId) return;
    const start = this._editingDayStart()[diaSemana];
    const end   = this._editingDayEnd()[diaSemana];
    if (!start || !end) return;
    this.horarioVm.upsert(medicoId, { diaSemana, horaInicio: `${start}:00`, horaFin: `${end}:00` });
    this._editingDayStart.update(m => { const n = { ...m }; delete n[diaSemana]; return n; });
    this._editingDayEnd.update(m =>   { const n = { ...m }; delete n[diaSemana]; return n; });
  }

  _editDay(diaSemana: number): void {
    const h = this.horarioVm.getForDay(diaSemana);
    if (h) {
      this._editingDayStart.update(m => ({ ...m, [diaSemana]: h.horaInicio.slice(0,5) }));
      this._editingDayEnd.update(m =>   ({ ...m, [diaSemana]: h.horaFin.slice(0,5) }));
    }
  }

  _deleteDay(diaSemana: number): void {
    const medicoId = this._scheduleDoctor()?.id;
    const h = this.horarioVm.getForDay(diaSemana);
    if (medicoId && h) this.horarioVm.delete(medicoId, h.id);
  }

  _isEditingDay(diaSemana: number): boolean {
    return diaSemana in this._editingDayStart();
  }

  _cancelDay(diaSemana: number): void {
    this._editingDayStart.update(m => { const n = { ...m }; delete n[diaSemana]; return n; });
    this._editingDayEnd.update(m =>   { const n = { ...m }; delete n[diaSemana]; return n; });
  }
}
