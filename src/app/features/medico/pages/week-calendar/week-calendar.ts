import { ChangeDetectionStrategy, Component, inject, afterNextRender } from '@angular/core';
import { Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';

import { AgendaViewModel } from '../../../../core/services/medico/agenda.view-model';
import { Translate } from '../../../../core/services/translate';
import { MONTHS_SHORT } from '../../../../shared/utils/date-time.utils';

const WEEK_DAYS = [
  'Domingo',
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
] as const;

@Component({
  selector: 'app-week-calendar',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './week-calendar.html',
  styleUrl: './week-calendar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WeekCalendarPage {
  readonly vm = inject(AgendaViewModel);
  readonly t = inject(Translate);

  private readonly _router = inject(Router);

  constructor() {
    afterNextRender(() => this.vm.loadWeek());
  }

  _formatWeekRange(): string {
    const start = this.vm.weekStart();
    const end = this.vm.weekEnd();
    if (!start || !end) return '';
    const s = new Date(start + 'T00:00:00');
    const e = new Date(end + 'T00:00:00');
    return `${s.getDate()} ${MONTHS_SHORT[s.getMonth()]} – ${e.getDate()} ${MONTHS_SHORT[e.getMonth()]} ${e.getFullYear()}`;
  }

  _formatDayHeader(dateStr: string): string {
    const d = new Date(dateStr + 'T00:00:00');
    return `${WEEK_DAYS[d.getDay()]} ${d.getDate()} ${MONTHS_SHORT[d.getMonth()]}`;
  }

  _isToday(dateStr: string): boolean {
    return dateStr === new Date().toISOString().slice(0, 10);
  }

  _goToDay(date: string): void {
    this.vm.selectDate(date);
    this._router.navigate(['/medico/agenda']);
  }
}
