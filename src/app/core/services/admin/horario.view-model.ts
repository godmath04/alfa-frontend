import { Injectable, inject, signal, computed } from '@angular/core';

import { HorarioService } from './horario.service';
import { Horario, HorarioRequest } from '../../models/admin.model';

@Injectable({ providedIn: 'root' })
export class HorarioViewModel {
  private readonly _service = inject(HorarioService);

  private readonly _horarios = signal<Horario[]>([]);
  private readonly _loading = signal(false);
  private readonly _saving = signal(false);
  private readonly _medicoId = signal<number | null>(null);

  readonly horarios = computed(() => this._horarios());
  readonly loading = computed(() => this._loading());
  readonly saving = computed(() => this._saving());
  readonly medicoId = computed(() => this._medicoId());

  loadForMedico(medicoId: number): void {
    this._medicoId.set(medicoId);
    this._loading.set(true);
    this._service.getByMedico(medicoId).subscribe({
      next: (items) => {
        this._horarios.set(items);
        this._loading.set(false);
      },
      error: () => this._loading.set(false),
    });
  }

  clear(): void {
    this._horarios.set([]);
    this._medicoId.set(null);
  }

  upsert(medicoId: number, request: HorarioRequest): void {
    this._saving.set(true);
    this._service.upsert(medicoId, request).subscribe({
      next: (h) => {
        this._horarios.update((list) => {
          const idx = list.findIndex((x) => x.diaSemana === h.diaSemana);
          return idx >= 0 ? list.map((x, i) => (i === idx ? h : x)) : [...list, h];
        });
        this._saving.set(false);
      },
      error: () => this._saving.set(false),
    });
  }

  delete(medicoId: number, horarioId: number): void {
    this._service.delete(medicoId, horarioId).subscribe({
      next: () => this._horarios.update((list) => list.filter((h) => h.id !== horarioId)),
      error: () => {},
    });
  }

  getForDay(diaSemana: number): Horario | undefined {
    return this._horarios().find((h) => h.diaSemana === diaSemana);
  }
}
