import { Component, inject, signal, computed, ChangeDetectionStrategy, ChangeDetectorRef, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { LucideAngularModule } from 'lucide-angular';

import { Translate } from '../../../../core/services/translate';
import { LabService } from '../../../../core/services/lab/lab.service';
import {
  StudyType, StudyTypeRequest,
  InsuranceType, InsuranceTypeRequest,
  Laboratory, LaboratoryRequest, LaboratoryScheduleRequest, LabSchedule,
} from '../../../../core/models/lab.model';

type ActiveTab = 'studyTypes' | 'insuranceTypes' | 'laboratories';

// Backend uses 0-indexed days: 0=Mon, 1=Tue, 2=Wed, 3=Thu, 4=Fri, 5=Sat, 6=Sun
const DAY_NAMES = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

@Component({
  selector: 'app-lab-catalogs',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './lab-catalogs.html',
  styleUrl: './lab-catalogs.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LabCatalogsPage implements OnInit {

  readonly t    = inject(Translate);
  private readonly _svc = inject(LabService);
  private readonly _cdr = inject(ChangeDetectorRef);

  // ─── Tab ──────────────────────────────────────────────────────────────────

  readonly _activeTab = signal<ActiveTab>('laboratories');

  // ─── Data lists ───────────────────────────────────────────────────────────

  readonly _studyTypes     = signal<StudyType[]>([]);
  readonly _insuranceTypes = signal<InsuranceType[]>([]);
  readonly _laboratories   = signal<Laboratory[]>([]);
  readonly _loading        = signal(false);
  readonly _listError      = signal<string | null>(null);

  // ─── Form shared ──────────────────────────────────────────────────────────

  readonly _formVisible = signal(false);
  readonly _editingId   = signal<number | null>(null);
  readonly _formError   = signal<string | null>(null);

  // ─── StudyType / InsuranceType form ───────────────────────────────────────

  readonly _fname        = signal('');
  readonly _fdescription = signal('');

  // ─── Laboratory form ──────────────────────────────────────────────────────

  readonly _labNumber = signal('');
  readonly _labName   = signal('');
  readonly _labFloor  = signal('');

  // ─── Schedule panel (doctors-style: per-day inline editing) ───────────────

  // The lab whose schedule panel is open (null = closed)
  readonly _scheduleLab = signal<Laboratory | null>(null);

  // 7 days matching backend 0-indexed convention
  readonly _WEEK_DAYS = [0,1,2,3,4,5,6].map(d => ({ value: d, label: DAY_NAMES[d] }));

  // Per-day editing state: { [dayOfWeek]: { start, end, slot } }
  readonly _editingDayStart = signal<Record<number, string>>({});
  readonly _editingDayEnd   = signal<Record<number, string>>({});
  readonly _editingDaySlot  = signal<Record<number, number>>({});

  // Per-day saving/error state
  readonly _daySaving = signal<Record<number, boolean>>({});
  readonly _dayError  = signal<string | null>(null);

  /** Schedules of the currently open lab as a map {dayOfWeek → LabSchedule} */
  readonly _schedMap = computed<Record<number, LabSchedule>>(() => {
    const lab = this._scheduleLab();
    if (!lab) return {};
    return Object.fromEntries(lab.schedules.map(s => [s.dayOfWeek, s]));
  });

  // ─── Day name helper ──────────────────────────────────────────────────────

  readonly dayName = (d: number) => DAY_NAMES[d] ?? String(d);

  ngOnInit(): void {
    this._loadAll();
  }

  // ─── Load ─────────────────────────────────────────────────────────────────

  private _loadAll(): void {
    this._loading.set(true);
    this._listError.set(null);
    const tab = this._activeTab();
    if (tab === 'studyTypes') {
      this._svc.getAllStudyTypes().subscribe({
        next: list => { this._studyTypes.set(list); this._loading.set(false); this._cdr.markForCheck(); },
        error: () => { this._listError.set('lab.catalogs.loadError'); this._loading.set(false); this._cdr.markForCheck(); },
      });
    } else if (tab === 'insuranceTypes') {
      this._svc.getAllInsuranceTypes().subscribe({
        next: list => { this._insuranceTypes.set(list); this._loading.set(false); this._cdr.markForCheck(); },
        error: () => { this._listError.set('lab.catalogs.loadError'); this._loading.set(false); this._cdr.markForCheck(); },
      });
    } else {
      this._svc.getAllLaboratories().subscribe({
        next: list => {
          this._laboratories.set(list);
          this._loading.set(false);
          // Keep the schedule panel in sync after reload
          const openLabId = this._scheduleLab()?.id;
          if (openLabId != null) {
            const updated = list.find(l => l.id === openLabId) ?? null;
            this._scheduleLab.set(updated);
          }
          this._cdr.markForCheck();
        },
        error: () => { this._listError.set('lab.catalogs.loadError'); this._loading.set(false); this._cdr.markForCheck(); },
      });
    }
  }

  // ─── Tab switch ───────────────────────────────────────────────────────────

  _switchTab(tab: ActiveTab): void {
    this._activeTab.set(tab);
    this._closeForm();
    this._closeSchedulePanel();
    this._loadAll();
  }

  // ─── Form open/close ──────────────────────────────────────────────────────

  _openCreate(): void {
    this._editingId.set(null);
    this._formError.set(null);
    this._resetForm();
    this._formVisible.set(true);
    this._closeSchedulePanel();
    this._cdr.markForCheck();
  }

  _openEditStudyType(st: StudyType): void {
    this._editingId.set(st.id);
    this._fname.set(st.name);
    this._fdescription.set(st.description ?? '');
    this._formError.set(null);
    this._formVisible.set(true);
    this._cdr.markForCheck();
  }

  _openEditInsuranceType(it: InsuranceType): void {
    this._editingId.set(it.id);
    this._fname.set(it.name);
    this._fdescription.set(it.description ?? '');
    this._formError.set(null);
    this._formVisible.set(true);
    this._cdr.markForCheck();
  }

  _openEditLab(lab: Laboratory): void {
    this._editingId.set(lab.id);
    this._labNumber.set(lab.number);
    this._labName.set(lab.name);
    this._labFloor.set(lab.floor ?? '');
    this._formError.set(null);
    this._formVisible.set(true);
    this._closeSchedulePanel();
    this._cdr.markForCheck();
  }

  _cancel(): void { this._closeForm(); }

  private _closeForm(): void {
    this._formVisible.set(false);
    this._editingId.set(null);
    this._formError.set(null);
    this._cdr.markForCheck();
  }

  private _resetForm(): void {
    this._fname.set(''); this._fdescription.set('');
    this._labNumber.set(''); this._labName.set(''); this._labFloor.set('');
  }

  // ─── Schedule panel (doctors-style) ───────────────────────────────────────

  _openSchedules(lab: Laboratory): void {
    if (this._scheduleLab()?.id === lab.id) {
      this._closeSchedulePanel();
    } else {
      this._scheduleLab.set(lab);
      this._editingDayStart.set({});
      this._editingDayEnd.set({});
      this._editingDaySlot.set({});
      this._daySaving.set({});
      this._dayError.set(null);
      this._closeForm();
      this._cdr.markForCheck();
    }
  }

  private _closeSchedulePanel(): void {
    this._scheduleLab.set(null);
    this._editingDayStart.set({});
    this._editingDayEnd.set({});
    this._editingDaySlot.set({});
    this._daySaving.set({});
    this._dayError.set(null);
    this._cdr.markForCheck();
  }

  _getScheduleForDay(d: number): LabSchedule | undefined {
    return this._schedMap()[d];
  }

  _isEditingDay(d: number): boolean {
    return d in this._editingDayStart();
  }

  _startEditDay(d: number): void {
    const existing = this._getScheduleForDay(d);
    this._editingDayStart.update(m => ({ ...m, [d]: existing?.startTime.slice(0,5) ?? '08:00' }));
    this._editingDayEnd.update(m =>   ({ ...m, [d]: existing?.endTime.slice(0,5)   ?? '17:00' }));
    this._editingDaySlot.update(m =>  ({ ...m, [d]: existing?.slotDurationMinutes  ?? 30 }));
    this._dayError.set(null);
    this._cdr.markForCheck();
  }

  _cancelEditDay(d: number): void {
    this._editingDayStart.update(m => { const n = { ...m }; delete n[d]; return n; });
    this._editingDayEnd.update(m =>   { const n = { ...m }; delete n[d]; return n; });
    this._editingDaySlot.update(m =>  { const n = { ...m }; delete n[d]; return n; });
    this._cdr.markForCheck();
  }

  _setDayField(d: number, field: 'start' | 'end', value: string): void {
    if (field === 'start') this._editingDayStart.update(m => ({ ...m, [d]: value }));
    else                   this._editingDayEnd.update(m =>   ({ ...m, [d]: value }));
  }

  _setDaySlot(d: number, slot: number): void {
    this._editingDaySlot.update(m => ({ ...m, [d]: slot }));
  }

  _saveDay(d: number): void {
    const labId = this._scheduleLab()?.id;
    const start = this._editingDayStart()[d];
    const end   = this._editingDayEnd()[d];
    const slot  = this._editingDaySlot()[d] ?? 30;
    if (!labId || !start || !end) return;

    this._daySaving.update(m => ({ ...m, [d]: true }));
    this._dayError.set(null);

    const req: LaboratoryScheduleRequest = {
      dayOfWeek:           d,
      startTime:           `${start}:00`,
      endTime:             `${end}:00`,
      slotDurationMinutes: slot,
    };

    this._svc.upsertLabSchedule(labId, req).subscribe({
      next: () => {
        this._daySaving.update(m => { const n = { ...m }; delete n[d]; return n; });
        this._cancelEditDay(d);
        this._loadAll();
      },
      error: () => {
        this._daySaving.update(m => { const n = { ...m }; delete n[d]; return n; });
        this._dayError.set(this.t.get('lab.catalogs.saveError'));
        this._cdr.markForCheck();
      },
    });
  }

  _deleteDay(d: number): void {
    const labId = this._scheduleLab()?.id;
    const sched = this._getScheduleForDay(d);
    if (!labId || !sched) return;
    this._svc.deleteLabSchedule(labId, sched.id).subscribe({
      next: () => this._loadAll(),
    });
  }

  // ─── Save lab / study-type / insurance ────────────────────────────────────

  _save(): void {
    const tab = this._activeTab();
    if (tab === 'studyTypes')          this._saveStudyType();
    else if (tab === 'insuranceTypes') this._saveInsuranceType();
    else                               this._saveLab();
  }

  private _saveStudyType(): void {
    const name = this._fname().trim();
    if (!name) { this._formError.set(this.t.get('lab.catalogs.validation.nameRequired')); this._cdr.markForCheck(); return; }
    const req: StudyTypeRequest = { name, description: this._fdescription().trim() || undefined };
    const id = this._editingId();
    const action$ = id !== null ? this._svc.updateStudyType(id, req) : this._svc.createStudyType(req);
    action$.subscribe({
      next: () => { this._closeForm(); this._loadAll(); },
      error: () => { this._formError.set(this.t.get('lab.catalogs.saveError')); this._cdr.markForCheck(); },
    });
  }

  private _saveInsuranceType(): void {
    const name = this._fname().trim();
    if (!name) { this._formError.set(this.t.get('lab.catalogs.validation.nameRequired')); this._cdr.markForCheck(); return; }
    const req: InsuranceTypeRequest = { name, description: this._fdescription().trim() || undefined };
    const id = this._editingId();
    const action$ = id !== null ? this._svc.updateInsuranceType(id, req) : this._svc.createInsuranceType(req);
    action$.subscribe({
      next: () => { this._closeForm(); this._loadAll(); },
      error: () => { this._formError.set(this.t.get('lab.catalogs.saveError')); this._cdr.markForCheck(); },
    });
  }

  private _saveLab(): void {
    const number = this._labNumber().trim();
    const name   = this._labName().trim();
    if (!number) { this._formError.set(this.t.get('lab.catalogs.validation.labNumberRequired')); this._cdr.markForCheck(); return; }
    if (!name)   { this._formError.set(this.t.get('lab.catalogs.validation.labNameRequired'));   this._cdr.markForCheck(); return; }
    const req: LaboratoryRequest = { number, name, floor: this._labFloor().trim() || undefined };
    const id = this._editingId();
    const action$ = id !== null ? this._svc.updateLaboratory(id, req) : this._svc.createLaboratory(req);
    action$.subscribe({
      next: () => { this._closeForm(); this._loadAll(); },
      error: () => { this._formError.set(this.t.get('lab.catalogs.saveError')); this._cdr.markForCheck(); },
    });
  }

  // ─── Deactivate / reactivate ──────────────────────────────────────────────

  _toggleStudyType(st: StudyType): void {
    const a$: Observable<unknown> = st.active ? this._svc.deactivateStudyType(st.id) : this._svc.reactivateStudyType(st.id);
    a$.subscribe(() => this._loadAll());
  }

  _toggleInsuranceType(it: InsuranceType): void {
    const a$: Observable<unknown> = it.active ? this._svc.deactivateInsuranceType(it.id) : this._svc.reactivateInsuranceType(it.id);
    a$.subscribe(() => this._loadAll());
  }

  _toggleLab(lab: Laboratory): void {
    const a$: Observable<unknown> = lab.active ? this._svc.deactivateLaboratory(lab.id) : this._svc.reactivateLaboratory(lab.id);
    a$.subscribe(() => this._loadAll());
  }
}
