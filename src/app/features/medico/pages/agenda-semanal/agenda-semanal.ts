import { ChangeDetectionStrategy, Component, inject, afterNextRender } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';

import { AgendaViewModel }          from '../../../../core/services/medico/agenda.view-model';
import { StatusFilter }             from '../../../../core/services/medico/agenda.state';
import { Translate }                from '../../../../core/services/translate';
import { DashboardMedicoComponent } from '../../components/dashboard-medico/dashboard-medico';
import { CitasDiaComponent }        from '../../components/citas-dia/citas-dia';
import { formatToAmPm, MONTHS_SHORT, MONTHS_FULL, WEEK_DAYS_SHORT } from '../../../../shared/utils/date-time.utils';

const WEEK_DAYS_FULL = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'] as const;

@Component({
  selector: 'app-agenda-semanal',
  standalone: true,
  imports: [LucideAngularModule, DashboardMedicoComponent, CitasDiaComponent],
  templateUrl: './agenda-semanal.html',
  styleUrl: './agenda-semanal.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AgendaSemanal {

  readonly vm = inject(AgendaViewModel);
  readonly t  = inject(Translate);

  constructor() {
    afterNextRender(() => this.vm.loadWeek());
  }

  _formatWeekRange(): string {
    const start = this.vm.weekStart();
    const end   = this.vm.weekEnd();
    if (!start || !end) return '';
    const s = new Date(start + 'T00:00:00');
    const e = new Date(end   + 'T00:00:00');
    return `${s.getDate()} ${MONTHS_SHORT[s.getMonth()]} – ${e.getDate()} ${MONTHS_SHORT[e.getMonth()]} ${e.getFullYear()}`;
  }

  _formatDayHeader(dateStr: string): string {
    const d = new Date(dateStr + 'T00:00:00');
    return `${WEEK_DAYS_FULL[d.getDay()]} ${d.getDate()} ${MONTHS_SHORT[d.getMonth()]}`;
  }

  _formatSelectedDate(): string {
    const d = new Date(this.vm.selectedDate() + 'T00:00:00');
    return `${WEEK_DAYS_FULL[d.getDay()]}, ${d.getDate()} de ${MONTHS_FULL[d.getMonth()].name} ${d.getFullYear()}`;
  }

  _isToday(dateStr: string): boolean {
    return dateStr === new Date().toISOString().slice(0, 10);
  }
}
