import { Component, afterNextRender, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';

import { Translate } from '../../../../core/services/translate';
import { ExecutiveService } from '../../../../core/services/ejecutivo/executive.service';
import { EjecutivoCitaItem, PacienteSearch } from '../../../../core/models/executive.model';

@Component({
  selector: 'app-patient-profile',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './patient-profile.html',
  styleUrl: './patient-profile.scss',
})
export class PatientProfilePage {

  readonly t   = inject(Translate);
  private readonly _svc    = inject(ExecutiveService);
  private readonly _route  = inject(ActivatedRoute);
  private readonly _router = inject(Router);

  readonly _patient   = signal<PacienteSearch | null>(null);
  readonly _citas     = signal<EjecutivoCitaItem[]>([]);
  readonly _loading   = signal(true);
  readonly _error     = signal<string | null>(null);

  readonly _cancellingId  = signal<number | null>(null);
  readonly _cancelError   = signal<string | null>(null);
  readonly _cancelSuccess = signal<string | null>(null);

  readonly _pendingCitas = computed(() =>
    this._citas().filter(c => c.estado === 'PENDIENTE' || c.estado === 'CONFIRMADA')
  );
  readonly _pastCitas = computed(() =>
    this._citas().filter(c => c.estado === 'COMPLETADA' || c.estado === 'CANCELADA')
  );

  constructor() {
    afterNextRender(() => {
      const id = Number(this._route.snapshot.paramMap.get('id'));
      this._load(id);
    });
  }

  private _load(id: number): void {
    this._loading.set(true);
    this._svc.obtenerPaciente(id).subscribe({
      next: p => {
        this._patient.set(p);
        this._loadCitas(id);
      },
      error: () => {
        this._error.set(this.t.get('ejecutivo.profile.load-error'));
        this._loading.set(false);
      },
    });
  }

  private _loadCitas(id: number): void {
    this._svc.getCitasPaciente(id).subscribe({
      next: citas => { this._citas.set(citas); this._loading.set(false); },
      error: ()  => { this._loading.set(false); },
    });
  }

  _goBack(): void {
    this._router.navigate(['/ejecutivo/pacientes']);
  }

  _bookAppointment(): void {
    const p = this._patient();
    if (!p) return;
    this._router.navigate(['/ejecutivo/pacientes', p.id, 'agendar']);
  }

  _cancelCita(citaId: number): void {
    this._cancellingId.set(citaId);
    this._cancelError.set(null);
    this._cancelSuccess.set(null);
    this._svc.cancelarCita(citaId).subscribe({
      next: () => {
        this._cancellingId.set(null);
        this._cancelSuccess.set(this.t.get('ejecutivo.profile.cancel-success'));
        this._citas.update(list => list.map(c => c.id === citaId ? { ...c, estado: 'CANCELADA' } : c));
      },
      error: () => {
        this._cancellingId.set(null);
        this._cancelError.set(this.t.get('ejecutivo.profile.cancel-error'));
      },
    });
  }

  _estadoClass(estado: string): string {
    const map: Record<string, string> = {
      PENDIENTE: 'badge--pendiente', CONFIRMADA: 'badge--confirmada',
      COMPLETADA: 'badge--completada', CANCELADA: 'badge--cancelada',
    };
    return map[estado] ?? '';
  }
}
