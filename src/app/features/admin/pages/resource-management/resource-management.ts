import { Component, afterNextRender, inject, signal } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';

import { Translate } from '../../../../core/services/translate';
import { SpecialtyViewModel } from '../../../../core/services/admin/specialty.view-model';
import { OfficeViewModel } from '../../../../core/services/admin/office.view-model';
import { ScheduleViewModel } from '../../../../core/services/admin/schedule.view-model';
import {
  AttentionSchedule, AttentionScheduleRequest,
  Office, OfficeRequest, OfficeStatus, OfficeType,
  Specialty, SpecialtyRequest,
} from '../../../../core/models/admin.model';

type ActiveTab = 'specialties' | 'offices' | 'schedules';

@Component({
  selector: 'app-resource-management',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './resource-management.html',
  styleUrl: './resource-management.scss',
})
export class ResourceManagementPage {

  readonly t          = inject(Translate);
  readonly specialtyVm = inject(SpecialtyViewModel);
  readonly officeVm    = inject(OfficeViewModel);
  readonly scheduleVm  = inject(ScheduleViewModel);

  // ─── Tab ───────────────────────────────────────────────────────────────────
  readonly _activeTab = signal<ActiveTab>('specialties');

  // ─── Form shared ───────────────────────────────────────────────────────────
  readonly _formVisible = signal(false);
  readonly _editingId   = signal<number | null>(null);
  readonly _formError   = signal<string | null>(null);

  // ─── Specialty form ────────────────────────────────────────────────────────
  readonly _sfName        = signal('');
  readonly _sfIcon        = signal('');
  readonly _sfDescription = signal('');
  readonly _sfDuration    = signal<number | null>(null);

  // ─── Office form ───────────────────────────────────────────────────────────
  readonly _ofNumber      = signal('');
  readonly _ofFloor       = signal('');
  readonly _ofType        = signal<OfficeType>('INTERNAL');
  readonly _ofStatus      = signal<OfficeStatus>('AVAILABLE');
  readonly _ofSpecialtyId = signal<number | null>(null);
  readonly _ofEquipment   = signal('');

  // ─── Schedule form ─────────────────────────────────────────────────────────
  readonly _shCategory        = signal('');
  readonly _shDays            = signal<string[]>([]);
  readonly _shStartTime       = signal('');
  readonly _shEndTime         = signal('');
  readonly _shMaxAppointments = signal<number | null>(null);

  readonly _WEEK_DAYS = [
    { value: 'MONDAY',    key: 'common.days.monday' },
    { value: 'TUESDAY',   key: 'common.days.tuesday' },
    { value: 'WEDNESDAY', key: 'common.days.wednesday' },
    { value: 'THURSDAY',  key: 'common.days.thursday' },
    { value: 'FRIDAY',    key: 'common.days.friday' },
    { value: 'SATURDAY',  key: 'common.days.saturday' },
    { value: 'SUNDAY',    key: 'common.days.sunday' },
  ];

  constructor() {
    afterNextRender(() => {
      this.specialtyVm.loadAll();
      this.officeVm.loadAll();
      this.scheduleVm.loadAll();
    });
  }

  // ─── Tab switching ─────────────────────────────────────────────────────────
  _switchTab(tab: ActiveTab): void {
    this._activeTab.set(tab);
    this._closeForm();
  }

  // ─── Form open ─────────────────────────────────────────────────────────────
  _openCreate(): void {
    this._editingId.set(null);
    this._formError.set(null);
    this._resetForms();
    this._formVisible.set(true);
  }

  _openEditSpecialty(s: Specialty): void {
    this._editingId.set(s.id);
    this._sfName.set(s.name);
    this._sfIcon.set(s.icon ?? '');
    this._sfDescription.set(s.description ?? '');
    this._sfDuration.set(s.appointmentDuration);
    this._formError.set(null);
    this._formVisible.set(true);
  }

  _openEditOffice(o: Office): void {
    this._editingId.set(o.id);
    this._ofNumber.set(o.number);
    this._ofFloor.set(o.floor ?? '');
    this._ofType.set(o.type);
    this._ofStatus.set(o.status);
    this._ofSpecialtyId.set(o.specialtyId);
    this._ofEquipment.set(o.equipment.join(', '));
    this._formError.set(null);
    this._formVisible.set(true);
  }

  _openEditSchedule(s: AttentionSchedule): void {
    this._editingId.set(s.id);
    this._shCategory.set(s.category);
    this._shDays.set([...s.days]);
    this._shStartTime.set(s.startTime.slice(0, 5));
    this._shEndTime.set(s.endTime.slice(0, 5));
    this._shMaxAppointments.set(s.maxAppointments);
    this._formError.set(null);
    this._formVisible.set(true);
  }

  _cancel(): void { this._closeForm(); }

  // ─── Save ──────────────────────────────────────────────────────────────────
  _save(): void {
    const tab = this._activeTab();
    if (tab === 'specialties') this._saveSpecialty();
    else if (tab === 'offices') this._saveOffice();
    else this._saveSchedule();
  }

  private _saveSpecialty(): void {
    const name     = this._sfName().trim();
    const duration = this._sfDuration();
    if (!name)              { this._formError.set(this.t.get('admin.specialties.validation.name-required')); return; }
    if (!duration || duration < 5) { this._formError.set(this.t.get('admin.specialties.validation.duration-required')); return; }

    const request: SpecialtyRequest = {
      name, icon: this._sfIcon().trim() || undefined,
      description: this._sfDescription().trim() || undefined,
      appointmentDuration: duration,
    };
    const id = this._editingId();
    const action$ = id !== null ? this.specialtyVm.update(id, request) : this.specialtyVm.create(request);
    action$.subscribe({ next: () => this._closeForm(), error: () => this._formError.set(this.t.get('admin.specialties.save-error')) });
  }

  private _saveOffice(): void {
    const number = this._ofNumber().trim();
    if (!number) { this._formError.set(this.t.get('admin.offices.validation.number-required')); return; }

    const request: OfficeRequest = {
      number,
      floor:       this._ofFloor().trim() || undefined,
      type:        this._ofType(),
      status:      this._ofStatus(),
      specialtyId: this._ofSpecialtyId() ?? undefined,
      equipment:   this._ofEquipment().split(',').map(e => e.trim()).filter(Boolean),
    };
    const id = this._editingId();
    const action$ = id !== null ? this.officeVm.update(id, request) : this.officeVm.create(request);
    action$.subscribe({ next: () => this._closeForm(), error: () => this._formError.set(this.t.get('admin.offices.save-error')) });
  }

  private _saveSchedule(): void {
    const category = this._shCategory().trim();
    const days     = this._shDays();
    const start    = this._shStartTime();
    const end      = this._shEndTime();
    const max      = this._shMaxAppointments();

    if (!category)      { this._formError.set(this.t.get('admin.schedules.validation.category-required')); return; }
    if (!days.length)   { this._formError.set(this.t.get('admin.schedules.validation.days-required')); return; }
    if (!start || !end) { this._formError.set(this.t.get('admin.schedules.validation.time-required')); return; }
    if (!max || max < 1){ this._formError.set(this.t.get('admin.schedules.validation.max-required')); return; }

    const request: AttentionScheduleRequest = {
      category, days,
      startTime: `${start}:00`,
      endTime:   `${end}:00`,
      maxAppointments: max,
    };
    const id = this._editingId();
    const action$ = id !== null ? this.scheduleVm.update(id, request) : this.scheduleVm.create(request);
    action$.subscribe({ next: () => this._closeForm(), error: () => this._formError.set(this.t.get('admin.schedules.save-error')) });
  }

  // ─── Days toggle ───────────────────────────────────────────────────────────
  _toggleDay(day: string): void {
    const current = this._shDays();
    this._shDays.set(
      current.includes(day) ? current.filter(d => d !== day) : [...current, day]
    );
  }

  _isDaySelected(day: string): boolean {
    return this._shDays().includes(day);
  }

  // ─── Day display helper ────────────────────────────────────────────────────
  _formatDays(days: string[]): string {
    return days.map(d => this.t.get(`common.days.${d.toLowerCase()}-short`)).join(', ');
  }

  // ─── Private ───────────────────────────────────────────────────────────────
  private _closeForm(): void {
    this._formVisible.set(false);
    this._editingId.set(null);
    this._formError.set(null);
  }

  private _resetForms(): void {
    this._sfName.set(''); this._sfIcon.set(''); this._sfDescription.set(''); this._sfDuration.set(null);
    this._ofNumber.set(''); this._ofFloor.set(''); this._ofType.set('INTERNAL');
    this._ofStatus.set('AVAILABLE'); this._ofSpecialtyId.set(null); this._ofEquipment.set('');
    this._shCategory.set(''); this._shDays.set([]); this._shStartTime.set('');
    this._shEndTime.set(''); this._shMaxAppointments.set(null);
  }
}
