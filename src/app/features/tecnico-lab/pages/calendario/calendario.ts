import { Component, afterNextRender, inject } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';

import { Translate } from '../../../../core/services/translate';
import { LabCalendarioViewModel } from '../../../../core/services/lab/lab-calendario.view-model';
import { Button } from '../../../../shared/components/button/button';

@Component({
  selector: 'app-tecnico-lab-calendario',
  standalone: true,
  imports: [LucideAngularModule, Button],
  templateUrl: './calendario.html',
  styleUrl: './calendario.scss',
})
export class TecnicoLabCalendario {

  readonly t  = inject(Translate);
  readonly vm = inject(LabCalendarioViewModel);

  constructor() {
    afterNextRender(() => {
      this.vm.load();
    });
  }

  _onFechaChange(e: Event): void {
    const val = (e.target as HTMLInputElement).value;
    if (val) {
      this.vm.setFecha(val);
    }
  }
}
