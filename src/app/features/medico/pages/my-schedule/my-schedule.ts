import { Component, afterNextRender, inject, signal } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';

import { Translate } from '../../../../core/services/translate';
import {
  MedicoProfileService,
  MedicoProfile,
} from '../../../../core/services/medico/medico-profile.service';
import { HorarioViewModel } from '../../../../core/services/admin/horario.view-model';

@Component({
  selector: 'app-my-schedule',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './my-schedule.html',
  styleUrl: './my-schedule.scss',
})
export class MySchedulePage {
  readonly t = inject(Translate);
  readonly horarioVm = inject(HorarioViewModel);

  private readonly _profileService = inject(MedicoProfileService);

  readonly _profile = signal<MedicoProfile | null>(null);
  readonly _profileError = signal(false);
  readonly _editingDayStart = signal<Record<number, string>>({});
  readonly _editingDayEnd = signal<Record<number, string>>({});

  readonly _WEEK_DAYS = [
    { value: 0, key: 'common.days.monday' },
    { value: 1, key: 'common.days.tuesday' },
    { value: 2, key: 'common.days.wednesday' },
    { value: 3, key: 'common.days.thursday' },
    { value: 4, key: 'common.days.friday' },
    { value: 5, key: 'common.days.saturday' },
    { value: 6, key: 'common.days.sunday' },
  ];

  constructor() {
    afterNextRender(() => this._loadProfile());
  }

  private _loadProfile(): void {
    this._profileService.getProfile().subscribe({
      next: (profile) => {
        this._profile.set(profile);
        this.horarioVm.loadForMedico(profile.id);
      },
      error: () => this._profileError.set(true),
    });
  }

  _getHorario(diaSemana: number) {
    return this.horarioVm.getForDay(diaSemana);
  }

  _isEditingDay(diaSemana: number): boolean {
    return diaSemana in this._editingDayStart();
  }

  _setDayTime(diaSemana: number, field: 'start' | 'end', value: string): void {
    if (field === 'start') this._editingDayStart.update((m) => ({ ...m, [diaSemana]: value }));
    else this._editingDayEnd.update((m) => ({ ...m, [diaSemana]: value }));
  }

  _saveDay(diaSemana: number): void {
    const medicoId = this._profile()?.id;
    if (!medicoId) return;
    const start = this._editingDayStart()[diaSemana];
    const end = this._editingDayEnd()[diaSemana];
    if (!start || !end) return;
    this.horarioVm.upsert(medicoId, { diaSemana, horaInicio: `${start}:00`, horaFin: `${end}:00` });
    this._editingDayStart.update((m) => {
      const n = { ...m };
      delete n[diaSemana];
      return n;
    });
    this._editingDayEnd.update((m) => {
      const n = { ...m };
      delete n[diaSemana];
      return n;
    });
  }

  _editDay(diaSemana: number): void {
    const h = this.horarioVm.getForDay(diaSemana);
    if (h) {
      this._editingDayStart.update((m) => ({ ...m, [diaSemana]: h.horaInicio.slice(0, 5) }));
      this._editingDayEnd.update((m) => ({ ...m, [diaSemana]: h.horaFin.slice(0, 5) }));
    }
  }

  _deleteDay(diaSemana: number): void {
    const medicoId = this._profile()?.id;
    const h = this.horarioVm.getForDay(diaSemana);
    if (medicoId && h) this.horarioVm.delete(medicoId, h.id);
  }

  _cancelEdit(diaSemana: number): void {
    this._editingDayStart.update((m) => {
      const n = { ...m };
      delete n[diaSemana];
      return n;
    });
    this._editingDayEnd.update((m) => {
      const n = { ...m };
      delete n[diaSemana];
      return n;
    });
  }
}
