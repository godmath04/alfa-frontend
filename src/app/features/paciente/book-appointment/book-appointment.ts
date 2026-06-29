import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { DecimalPipe } from '@angular/common';

import { Translate } from '../../../core/services/translate';
import { AppointmentViewModel } from '../../../core/services/appointment/appointment.view-model';
import { Button } from '../../../shared/components/button/button';
import { FlowType } from '../../../core/models/appointment.model';
import { formatToAmPm, formatCountdown, generateNextDays } from '../../../shared/utils/date-time.utils';

@Component({
  selector: 'app-book-appointment',
  standalone: true,
  imports: [LucideAngularModule, Button, DecimalPipe],
  templateUrl: './book-appointment.html',
  styleUrl: './book-appointment.scss',
})
export class BookAppointment implements OnInit {

  readonly _translate = inject(Translate);
  readonly vm = inject(AppointmentViewModel);
  private readonly _router = inject(Router);

  _currentStep = 0;

  // Dynamic total steps based on flow type
  get _totalSteps(): number {
    return this.vm.flowType() === 'quick' ? 3 : 5;
  }

  // Step labels for the stepper header
  get _stepLabels(): string[] {
    if (this.vm.flowType() === 'quick') {
      return [
        this._translate.get('paciente.appointments.steps.quickSpecialtyDate'),
        this._translate.get('paciente.appointments.steps.quickConfirm'),
        this._translate.get('paciente.appointments.steps.voucher')
      ];
    }
    return [
      this._translate.get('paciente.appointments.steps.specialty'),
      this._translate.get('paciente.appointments.steps.doctor'),
      this._translate.get('paciente.appointments.steps.datetime'),
      this._translate.get('paciente.appointments.steps.confirmation'),
      this._translate.get('paciente.appointments.steps.voucher')
    ];
  }

  // Helper to check if current step is the voucher
  get _isVoucherStep(): boolean {
    return (this.vm.flowType() === 'manual' && this._currentStep === 5) ||
           (this.vm.flowType() === 'quick' && this._currentStep === 3);
  }

  ngOnInit(): void {
    this.vm.clearFlow();
    this.vm.loadSpecialties();
  }

  // ─── Flow selection ────────────────────────────────

  _selectFlow(flow: FlowType): void {
    this.vm.selectFlow(flow);
    this._currentStep = 1;
  }

  // ─── Navigation ────────────────────────────────────

  _goToStep(step: number): void {
    if (step >= 0 && step <= this._totalSteps) {
      this._currentStep = step;
    }
  }

  _next(): void {
    this._goToStep(this._currentStep + 1);
  }

  _back(): void {
    if (this._currentStep === 1) {
      // Return to flow selector, cancel any active proposal
      this.vm.resetFlow();
      this._currentStep = 0;
    } else if (this.vm.flowType() === 'quick' && this._currentStep === 2 && this.vm.proposal()) {
      // Cancel proposal when going back from quick step 2
      this.vm.cancelQuickProposal();
      this._goToStep(1);
    } else {
      this._goToStep(this._currentStep - 1);
    }
  }

  // ─── Specialty click handler ───────────────────────

  _onSpecialtyClick(specialty: import('../../../core/models/appointment.model').SpecialtyCatalog): void {
    this.vm.onSpecialtySelected(specialty);
    // In manual flow, auto-advance to step 2
    if (this.vm.flowType() === 'manual') {
      this._next();
    }
  }

  // ─── Doctor click handler ──────────────────────────

  _onDoctorClick(doctor: import('../../../core/models/appointment.model').SpecialtyDoctor): void {
    this.vm.onDoctorSelected(doctor);
    this._next();
  }

  // ─── Manual confirmation ───────────────────────────

  _confirmManual(): void {
    this.vm.confirmManualAppointment(() => this._next());
  }

  // ─── Quick flow actions ────────────────────────────

  _requestQuickProposal(): void {
    this.vm.requestQuickProposal(() => this._next());
  }

  _confirmQuick(): void {
    this.vm.confirmQuickAppointment(() => this._next());
  }

  _cancelQuickAndGoBack(): void {
    this.vm.cancelQuickProposal();
    this._goToStep(1);
  }

  // ─── Post-voucher actions ──────────────────────────

  _newAppointment(): void {
    this.vm.clearFlow();
    this._currentStep = 0;
    this.vm.loadSpecialties();
  }

  _goToDashboard(): void {
    this._router.navigate(['/paciente/appointment-history']);
  }

  // ─── Input handler for motivo textarea ─────────────

  _onMotivoInput(event: Event): void {
    const textarea = event.target as HTMLTextAreaElement;
    this.vm.setMotivo(textarea.value);
  }

  // ─── Image error fallback ──────────────────────────

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    // Prevent infinite loop if LOGO.svg also fails
    if (!img.src.includes('LOGO.svg')) {
      img.src = '/images/LOGO.svg';
    }
  }

  // ─── Date timeline (next 14 days from today) ───────

  readonly availableDates = generateNextDays(14);

  readonly formatToAmPm   = formatToAmPm;
  readonly formatCountdown = formatCountdown;
}