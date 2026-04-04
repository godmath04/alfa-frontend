import { Component } from '@angular/core';
import { Translate } from '../../../core/services/translate';

@Component({
  selector: 'app-book-appointment',
  standalone: false,
  templateUrl: './book-appointment.html',
  styleUrl: './book-appointment.scss',
})
export class BookAppointment {
  _currentStep = 1;
  _totalSteps = 3;

  constructor(public _translate: Translate) {}

  _goToStep(step: number): void {
    if (step >= 1 && step <= this._totalSteps) {
      this._currentStep = step;
    }
  }

  _next(): void {
    this._goToStep(this._currentStep + 1);
  }

  _back(): void {
    this._goToStep(this._currentStep - 1);
  }
}