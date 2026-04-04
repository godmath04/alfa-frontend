import { Component, inject } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';

import { Translate } from '../../../core/services/translate';
import { Button } from '../../../shared/components/button/button';

@Component({
  selector: 'app-book-appointment',
  standalone: true,
  imports: [LucideAngularModule, Button],
  templateUrl: './book-appointment.html',
  styleUrl: './book-appointment.scss',
})
export class BookAppointment {

  readonly _translate = inject(Translate);

  _currentStep = 1;
  _totalSteps  = 3;

  _goToStep(step: number): void {
    if (step >= 1 && step <= this._totalSteps) {
      this._currentStep = step;
    }
  }

  _next(): void { this._goToStep(this._currentStep + 1); }
  _back(): void { this._goToStep(this._currentStep - 1); }
}
