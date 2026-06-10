import { Component, inject, signal, computed, ChangeDetectionStrategy, ChangeDetectorRef, OnInit } from '@angular/core';
import { Observable, forkJoin } from 'rxjs';
import { LucideAngularModule } from 'lucide-angular';

import { Translate } from '../../../../core/services/translate';
import { LabService } from '../../../../core/services/lab/lab.service';
import {
  StudyType, StudyTypeRequest,
  InsuranceType, InsuranceTypeRequest,
  Laboratory, LaboratoryRequest, LaboratoryScheduleRequest,
} from '../../../../core/models/lab.model';

type ActiveTab = 'studyTypes' | 'insuranceTypes' | 'laboratories';

const DAY_NAMES  = ['', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const DAY_SHORT  = ['', 'Lun',   'Mar',    'Mié',       'Jue',    'Vie',     'Sáb',    'Dom'];

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

  // ─── Schedule sub-form (inside lab edit) ──────────────────────────────────

  readonly _schedDays  = signal<number[]>([]);
  readonly _schedStart = signal('');
  readonly _schedEnd   = signal('');
  readonly _schedSlot  = signal<number>(30);
  readonly _schedError = signal<string | null>(null);
  readonly _schedSaving = signal(false);

  readonly _DAYS = [1,2,3,4,5,6,7].map(d => ({
    value: d,
    label: DAY_NAMES[d],
    short: DAY_SHORT[d],
  }));

  readonly dayName = (d: number) => DAY_NAMES[d] ?? String(d);

  // ─── Computed editing lab (for live schedule list in edit form) ────────────

  readonly _editingLab = computed(() =>
    this._laboratories().find(l => l.id === this._editingId()) ?? null
  );

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
        next: list => { this._laboratories.set(list); this._loading.set(false); this._cdr.markForCheck(); },
        error: () => { this._listError.set('lab.catalogs.loadError'); this._loading.set(false); this._cdr.markForCheck(); },
      });
    }
  }

  // ─── Tab switch ───────────────────────────────────────────────────────────

  _switchTab(tab: ActiveTab): void {
    this._activeTab.set(tab);
    this._closeForm();
    this._loadAll();
  }

  // ─── Form open/close ──────────────────────────────────────────────────────

  _openCreate(): void {
    this._editingId.set(null);
    this._formError.set(null);
    this._resetForm();
    this._formVisible.set(true);
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
    this._resetSchedSubForm();
    this._formVisible.set(true);
    this._cdr.markForCheck();
  }

  _cancel(): void { this._closeForm(); }

  private _closeForm(): void {
    this._formVisible.set(false);
    this._editingId.set(null);
    this._formError.set(null);
    this._resetSchedSubForm();
    this._cdr.markForCheck();
  }

  private _resetForm(): void {
    this._fname.set(''); this._fdescription.set('');
    this._labNumber.set(''); this._labName.set(''); this._labFloor.set('');
    this._resetSchedSubForm();
  }

  private _resetSchedSubForm(): void {
    this._schedDays.set([]);
    this._schedStart.set('');
    this._schedEnd.set('');
    this._schedSlot.set(30);
    this._schedError.set(null);
  }

  // ─── Save ─────────────────────────────────────────────────────────────────

  _save(): void {
    const tab = this._activeTab();
    if (tab === 'studyTypes')     this._saveStudyType();
    else if (tab === 'insuranceTypes') this._saveInsuranceType();
    else                          this._saveLab();
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

  // ─── Schedule sub-form ────────────────────────────────────────────────────

  _toggleSchedDay(d: number): void {
    const cur = this._schedDays();
    this._schedDays.set(cur.includes(d) ? cur.filter(x => x !== d) : [...cur, d]);
    this._cdr.markForCheck();
  }

  _isSchedDaySelected(d: number): boolean {
    return this._schedDays().includes(d);
  }

  _addSchedule(): void {
    const labId = this._editingId();
    const days  = this._schedDays();
    const start = this._schedStart();
    const end   = this._schedEnd();

    if (!labId)        return;
    if (!days.length)  { this._schedError.set(this.t.get('lab.catalogs.validation.scheduleRequired')); this._cdr.markForCheck(); return; }
    if (!start || !end){ this._schedError.set(this.t.get('lab.catalogs.validation.scheduleRequired')); this._cdr.markForCheck(); return; }

    this._schedSaving.set(true);
    this._schedError.set(null);

    const calls = days.map(d => this._svc.upsertLabSchedule(labId, {
      dayOfWeek:           d,
      startTime:           `${start}:00`,
      endTime:             `${end}:00`,
      slotDurationMinutes: this._schedSlot(),
    } satisfies LaboratoryScheduleRequest));

    forkJoin(calls).subscribe({
      next: () => {
        this._schedSaving.set(false);
        this._resetSchedSubForm();
        this._loadAll();
      },
      error: () => {
        this._schedSaving.set(false);
        this._schedError.set(this.t.get('lab.catalogs.saveError'));
        this._cdr.markForCheck();
      },
    });
  }

  _deleteSchedule(labId: number, scheduleId: number): void {
    this._svc.deleteLabSchedule(labId, scheduleId).subscribe({
      next: () => this._loadAll(),
    });
  }
}
