import { Injectable, inject, computed, DestroyRef } from '@angular/core';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { switchMap, map, of, catchError } from 'rxjs';

import { LabCalendarioState } from './lab-calendario.state';
import { LabService } from './lab.service';
import { formatDateToISO, formatToAmPm } from '../../../shared/utils/date-time.utils';

@Injectable({ providedIn: 'root' })
export class LabCalendarioViewModel {

  private readonly _state      = inject(LabCalendarioState);
  private readonly _svc        = inject(LabService);
  private readonly _router     = inject(Router);
  private readonly _destroyRef = inject(DestroyRef);

  readonly citas           = this._state.citas;
  readonly loading         = this._state.loading;
  readonly error           = this._state.error;
  readonly fecha           = this._state.fecha;
  readonly actionLoading   = this._state.actionLoading;
  readonly downloadLoading = this._state.downloadLoading;

  readonly timeSlots = [
    '07:00', '07:30', '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00'
  ];

  readonly calendarGrid = computed(() => {
    const list = this.citas();
    return this.timeSlots.map(slot => {
      // Filter appointments that start at this HH:mm slot
      const appointments = list.filter(c => c.horaInicio.startsWith(slot));
      return {
        time: slot,
        formattedTime: formatToAmPm(slot + ':00'),
        appointments
      };
    });
  });

  load(): void {
    this._state.setLoading(true);
    this._state.setError(null);
    this._svc.getLabCitasStaff({
      fechaDesde: this.fecha(),
      fechaHasta: this.fecha(),
      page: 0,
      size: 100, // retrieve all for the day
    }).pipe(
      switchMap(r => {
        const completedIds = r.content.filter(c => c.estado === 'COMPLETADA').map(c => c.citaId);
        if (completedIds.length === 0) {
          return of({ page: r, statusMap: {} as Record<number, boolean> });
        }
        return this._svc.getResultsBatchStatus(completedIds).pipe(
          map(statusMap => ({ page: r, statusMap })),
          catchError(() => of({ page: r, statusMap: {} as Record<number, boolean> }))
        );
      }),
      takeUntilDestroyed(this._destroyRef)
    ).subscribe({
      next: ({ page, statusMap }) => {
        const enhancedCitas = page.content.map(c => {
          if (statusMap[c.citaId]) {
            return { ...c, originalFileName: 'uploaded.pdf' };
          }
          return c;
        });
        this._state.setCitas(enhancedCitas);
        this._state.setLoading(false);
      },
      error: () => {
        this._state.setError('Error al cargar la agenda de laboratorio.');
        this._state.setLoading(false);
      }
    });
  }

  setFecha(fecha: string): void {
    this._state.setFecha(fecha);
    this.load();
  }

  nextDay(): void {
    const current = new Date(this.fecha() + 'T00:00:00');
    current.setDate(current.getDate() + 1);
    this.setFecha(formatDateToISO(current));
  }

  prevDay(): void {
    const current = new Date(this.fecha() + 'T00:00:00');
    current.setDate(current.getDate() - 1);
    this.setFecha(formatDateToISO(current));
  }

  completar(citaId: number): void {
    this._state.setActionLoading(citaId);
    this._svc.completarLabCita(citaId).pipe(
      takeUntilDestroyed(this._destroyRef)
    ).subscribe({
      next: () => {
        this._state.setActionLoading(null);
        this._state.setCitas(
          this.citas().map(c => c.citaId === citaId ? { ...c, estado: 'COMPLETADA' } : c)
        );
      },
      error: () => this._state.setActionLoading(null),
    });
  }

  cancelar(citaId: number): void {
    if (!confirm('¿Estás seguro de cancelar esta cita?')) return;
    this._state.setActionLoading(citaId);
    this._svc.cancelarLabCitaEjecutivo(citaId).pipe(
      takeUntilDestroyed(this._destroyRef)
    ).subscribe({
      next: () => {
        this._state.setActionLoading(null);
        this._state.setCitas(
          this.citas().map(c => c.citaId === citaId ? { ...c, estado: 'CANCELADA' } : c)
        );
      },
      error: () => this._state.setActionLoading(null),
    });
  }

  downloadResult(citaId: number, inline: boolean = false): void {
    this._state.setDownloadLoading(citaId);
    this._svc.getDownloadUrlByCitaId(citaId, inline).pipe(
      takeUntilDestroyed(this._destroyRef)
    ).subscribe({
      next: ({ downloadUrl }) => {
        window.open(downloadUrl, '_blank');
        this._state.setDownloadLoading(null);
      },
      error: () => this._state.setDownloadLoading(null),
    });
  }

  resendToken(citaId: number): void {
    this._svc.reenviarToken(citaId).pipe(
      takeUntilDestroyed(this._destroyRef)
    ).subscribe({
      next: () => {
        alert('Código de acceso reenviado con éxito al paciente.');
      },
      error: () => {
        alert('Error al reenviar el código de acceso.');
      },
    });
  }

  openUploadPage(citaId: number): void {
    this._router.navigate(['/tecnico-lab/subir-resultados', citaId]);
  }
}
