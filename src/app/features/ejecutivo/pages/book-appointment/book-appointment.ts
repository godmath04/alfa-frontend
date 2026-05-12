import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { DecimalPipe } from '@angular/common';

import { Translate } from '../../../../core/services/translate';
import { AppointmentViewModel } from '../../../../core/services/appointment/appointment.view-model';
import { Button } from '../../../../shared/components/button/button';
import { FlowType, SpecialtyCatalog, SpecialtyDoctor } from '../../../../core/models/appointment.model';
import { formatToAmPm, formatCountdown, generateNextDays } from '../../../../shared/utils/date-time.utils';

@Component({
  selector: 'app-executive-book-appointment',
  standalone: true,
  imports: [LucideAngularModule, Button, DecimalPipe],
  templateUrl: './book-appointment.html',
  styleUrl: './book-appointment.scss',
})
export class ExecutiveBookAppointmentPage implements OnInit {

  readonly _translate = inject(Translate);
  readonly vm         = inject(AppointmentViewModel);

  private readonly _router = inject(Router);
  private readonly _route  = inject(ActivatedRoute);

  private _patientId!: number;
  _currentStep = 0;

  get _totalSteps(): number {
    return this.vm.flowType() === 'quick' ? 3 : 5;
  }

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

  get _isVoucherStep(): boolean {
    return (this.vm.flowType() === 'manual' && this._currentStep === 5) ||
           (this.vm.flowType() === 'quick'  && this._currentStep === 3);
  }

  ngOnInit(): void {
    this._patientId = Number(this._route.snapshot.paramMap.get('id'));
    this.vm.clearFlow();
    this.vm.loadSpecialties();
  }

  _selectFlow(flow: FlowType): void {
    this.vm.selectFlow(flow);
    this._currentStep = 1;
  }

  _goToStep(step: number): void {
    if (step >= 0 && step <= this._totalSteps) this._currentStep = step;
  }

  _next(): void { this._goToStep(this._currentStep + 1); }

  _back(): void {
    if (this._currentStep === 1) {
      this.vm.resetFlow();
      this._currentStep = 0;
    } else if (this.vm.flowType() === 'quick' && this._currentStep === 2 && this.vm.proposal()) {
      this.vm.cancelQuickProposal(this._patientId);
      this._goToStep(1);
    } else {
      this._goToStep(this._currentStep - 1);
    }
  }

  _onSpecialtyClick(specialty: SpecialtyCatalog): void {
    this.vm.onSpecialtySelected(specialty);
    if (this.vm.flowType() === 'manual') this._next();
  }

  _onDoctorClick(doctor: SpecialtyDoctor): void {
    this.vm.onDoctorSelected(doctor);
    this._next();
  }

  _confirmManual(): void {
    this.vm.confirmManualAppointment(() => this._next(), this._patientId);
  }

  _requestQuickProposal(): void {
    this.vm.requestQuickProposal(() => this._next(), this._patientId);
  }

  _confirmQuick(): void {
    this.vm.confirmQuickAppointment(() => this._next(), this._patientId);
  }

  _cancelQuickAndGoBack(): void {
    this.vm.cancelQuickProposal(this._patientId);
    this._goToStep(1);
  }

  _newAppointment(): void {
    this.vm.clearFlow();
    this._currentStep = 0;
    this.vm.loadSpecialties();
  }

  _goToDashboard(): void {
    this._router.navigate(['/ejecutivo/pacientes', this._patientId]);
  }

  _onMotivoInput(event: Event): void {
    this.vm.setMotivo((event.target as HTMLTextAreaElement).value);
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (!img.src.includes('LOGO.svg')) img.src = '/images/LOGO.svg';
  }

  readonly availableDates  = generateNextDays(14);
  readonly formatToAmPm    = formatToAmPm;
  readonly formatCountdown = formatCountdown;
}
