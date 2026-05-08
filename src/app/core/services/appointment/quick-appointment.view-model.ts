import { Injectable, inject, DestroyRef, computed } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { interval, Subject, takeUntil } from 'rxjs';

import { AppointmentService } from './appointment';
import { AppointmentStateService } from './appointment.state';
import { ErrorMapperService } from '../error-mapper.service';
import { Translate } from '../translate';
import { toApiError } from '../../models/api-error.model';

@Injectable({ providedIn: 'root' })
export class QuickAppointmentViewModel {
  private readonly _appointmentService = inject(AppointmentService);
  private readonly _stateService = inject(AppointmentStateService);
  private readonly _errorMapper = inject(ErrorMapperService);
  private readonly _translate = inject(Translate);
  private readonly _destroyRef = inject(DestroyRef);

  private readonly _stopCountdown$ = new Subject<void>();

  readonly proposal = computed(() => this._stateService.proposal());
  readonly proposalCountdown = computed(() => this._stateService.proposalCountdown());
  readonly proposalLoading = computed(() => this._stateService.proposalLoading());
  readonly proposalError = computed(() => this._stateService.proposalError());

  constructor() {
    this._destroyRef.onDestroy(() => this.clearCountdown());
  }

  requestQuickProposal(onSuccess: () => void): void {
    const specialty = this._stateService.selectedSpecialty();
    const date = this._stateService.selectedDate();
    if (!specialty || !date) return;

    this._stateService.setProposalLoading(true);
    this._stateService.setProposalError(null);

    this._appointmentService
      .getQuickProposal(specialty.id, date)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: (proposal) => {
          this._stateService.setProposal(proposal);
          this._stateService.setProposalLoading(false);
          this._startCountdown(proposal.expiresInSeconds);
          onSuccess();
        },
        error: (raw) => {
          this._stateService.setProposalError(
            this._errorMapper.map(toApiError(raw), 'paciente.appointments.errors.proposal-failed'),
          );
          this._stateService.setProposalLoading(false);
        },
      });
  }

  cancelQuickProposal(): void {
    this.clearCountdown();
    this._stateService.setProposal(null);
    this._stateService.setProposalCountdown(0);

    this._appointmentService
      .cancelQuickProposal()
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe();
  }

  cancelSilently(): void {
    if (!this._stateService.proposal()) return;
    this.clearCountdown();
    this._stateService.setProposal(null);
    this._stateService.setProposalCountdown(0);

    this._appointmentService
      .cancelQuickProposal()
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe();
  }

  clearCountdown(): void {
    this._stopCountdown$.next();
  }

  private _startCountdown(seconds: number): void {
    this.clearCountdown();
    this._stateService.setProposalCountdown(seconds);

    interval(1000)
      .pipe(takeUntil(this._stopCountdown$))
      .subscribe(() => {
        const current = this._stateService.proposalCountdown();
        if (current <= 1) {
          this.clearCountdown();
          this._stateService.setProposalCountdown(0);
          this._stateService.setProposal(null);
          this._stateService.setProposalError(
            this._translate.get('paciente.appointments.errors.proposal-expired'),
          );
        } else {
          this._stateService.setProposalCountdown(current - 1);
        }
      });
  }
}
