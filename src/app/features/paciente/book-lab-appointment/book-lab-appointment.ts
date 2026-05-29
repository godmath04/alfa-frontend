import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { DatePipe } from '@angular/common';

import { Translate } from '../../../core/services/translate';
import { LabBookingViewModel } from '../../../core/services/lab/lab-booking.view-model';
import { Button } from '../../../shared/components/button/button';
import { Spinner } from '../../../shared/components/spinner/spinner';
import { LabCatalog } from '../../../core/models/lab.model';
import { formatToAmPm } from '../../../shared/utils/date-time.utils';

@Component({
  selector: 'app-book-lab-appointment',
  standalone: true,
  imports: [LucideAngularModule, Button, Spinner, DatePipe],
  templateUrl: './book-lab-appointment.html',
  styleUrl: './book-lab-appointment.scss',
})
export class BookLabAppointment implements OnInit {

  readonly t   = inject(Translate);
  readonly vm  = inject(LabBookingViewModel);
  private readonly _router = inject(Router);

  _currentStep = 1;
  readonly _totalSteps = 4;

  readonly _stepLabels = [
    'lab.booking.steps.lab',
    'lab.booking.steps.slot',
    'lab.booking.steps.details',
    'lab.booking.steps.voucher',
  ];

  readonly formatToAmPm = formatToAmPm;

  ngOnInit(): void {
    this.vm.clear();
    this.vm.loadLabs();
    this.vm.loadCatalogs();
  }

  _goToStep(step: number): void {
    if (step >= 1 && step <= this._totalSteps) this._currentStep = step;
  }

  _next(): void { this._goToStep(this._currentStep + 1); }
  _back(): void { this._goToStep(this._currentStep - 1); }

  _onLabClick(lab: LabCatalog): void {
    this.vm.selectLab(lab);
    this._next();
  }

  _onDateClick(date: string): void {
    this.vm.selectDate(date);
  }

  _onTimeClick(time: string): void {
    this.vm.selectTime(time);
  }

  _onStudyTypeChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const opt = select.options[select.selectedIndex];
    this.vm.selectStudyType(Number(opt.value), opt.text);
  }

  _onInsuranceTypeChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const opt = select.options[select.selectedIndex];
    this.vm.selectInsuranceType(Number(opt.value), opt.text);
  }

  _onObsInput(event: Event): void {
    this.vm.setObservations((event.target as HTMLTextAreaElement).value);
  }

  _confirmDetails(): void {
    if (!this.vm.canConfirmDetails()) return;
    this._next();
  }

  _confirm(): void {
    this.vm.book(() => this._next());
  }

  _newBooking(): void {
    this.vm.clear();
    this.vm.loadLabs();
    this._currentStep = 1;
  }

  _goToDashboard(): void {
    this._router.navigate(['/paciente/dashboard']);
  }
}
