import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { DatePipe } from '@angular/common';

import { Translate } from '../../../../core/services/translate';
import { LabBookingViewModel } from '../../../../core/services/lab/lab-booking.view-model';
import { Button } from '../../../../shared/components/button/button';
import { Spinner } from '../../../../shared/components/spinner/spinner';
import { LabCatalog } from '../../../../core/models/lab.model';
import { formatToAmPm } from '../../../../shared/utils/date-time.utils';

type BookingMode = 'patient' | 'guest';

@Component({
  selector: 'app-executive-book-lab-appointment',
  standalone: true,
  imports: [LucideAngularModule, Button, Spinner, DatePipe],
  templateUrl: './book-lab-appointment.html',
  styleUrl: './book-lab-appointment.scss',
})
export class ExecutiveBookLabAppointmentPage implements OnInit {

  readonly t   = inject(Translate);
  readonly vm  = inject(LabBookingViewModel);
  private readonly _router = inject(Router);
  private readonly _route  = inject(ActivatedRoute);

  private _patientId!: number;

  _currentStep = 0;
  readonly _totalSteps = 4;

  readonly _stepLabels = [
    'lab.booking.steps.lab',
    'lab.booking.steps.slot',
    'lab.booking.steps.details',
    'lab.booking.steps.voucher',
  ];

  // Guest form fields (used when mode = 'guest')
  _mode         = signal<BookingMode>('patient');
  _guestNombre  = signal('');
  _guestApellido= signal('');
  _guestEmail   = signal('');
  _guestPhone   = signal('');
  _guestIdNumber= signal('');
  _guestError   = signal<string | null>(null);

  readonly formatToAmPm = formatToAmPm;

  ngOnInit(): void {
    this._patientId = Number(this._route.snapshot.paramMap.get('id'));
    // If no valid patientId, default to guest mode
    if (!this._patientId || isNaN(this._patientId)) {
      this._mode.set('guest');
    }
    this.vm.clear();
    this.vm.loadLabs();
    this.vm.loadCatalogs();
    this._currentStep = 1;
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

  _onDateClick(date: string): void { this.vm.selectDate(date); }
  _onTimeClick(time: string): void { this.vm.selectTime(time); }

  _onStudyTypeChange(event: Event): void {
    const sel = event.target as HTMLSelectElement;
    const opt = sel.options[sel.selectedIndex];
    this.vm.selectStudyType(Number(opt.value), opt.text);
  }

  _onInsuranceTypeChange(event: Event): void {
    const sel = event.target as HTMLSelectElement;
    const opt = sel.options[sel.selectedIndex];
    this.vm.selectInsuranceType(Number(opt.value), opt.text);
  }

  _onObsInput(event: Event): void {
    this.vm.setObservations((event.target as HTMLTextAreaElement).value);
  }

  _confirm(): void {
    if (!this.vm.canConfirmDetails()) return;

    if (this._mode() === 'patient') {
      this.vm.book(() => this._next(), this._patientId);
    } else {
      const nombre   = this._guestNombre().trim();
      const apellido = this._guestApellido().trim();
      const email    = this._guestEmail().trim();
      const phone    = this._guestPhone().trim();
      const idNum    = this._guestIdNumber().trim();

      if (!nombre || !apellido || !email || !phone || !idNum) {
        this._guestError.set(this.t.get('lab.booking.guest.requiredFields'));
        return;
      }
      this._guestError.set(null);
      this.vm.book(
        () => this._next(),
        undefined,
        { nombre, apellido, email, phone, idNumber: idNum }
      );
    }
  }

  _goBack(): void {
    this._router.navigate(['/ejecutivo/pacientes', this._patientId]);
  }

  _newBooking(): void {
    this.vm.clear();
    this.vm.loadLabs();
    this._currentStep = 1;
    this._guestError.set(null);
  }
}
