import { Component, inject, afterNextRender } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';

import { AgendaViewModel }  from '../../../../core/services/medico/agenda.view-model';
import { StatusFilter }     from '../../../../core/services/medico/agenda.state';
import { Translate }        from '../../../../core/services/translate';
import { formatToAmPm, MONTHS_SHORT, MONTHS_FULL, WEEK_DAYS_SHORT } from '../../../../shared/utils/date-time.utils';

const WEEK_DAYS_FULL = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'] as const;

@Component({
  selector: 'app-agenda-semanal',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './agenda-semanal.html',
  styleUrl: './agenda-semanal.scss',
})
export class AgendaSemanal {

  readonly vm           = inject(AgendaViewModel);
  readonly t            = inject(Translate);
  readonly formatToAmPm = formatToAmPm;

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

  _getInitials(name: string): string {
    return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
  }

  _onSearchInput(event: Event): void {
    this.vm.setSearchQuery((event.target as HTMLInputElement).value);
  }

  _onStatusFilter(event: Event): void {
    this.vm.setStatusFilter((event.target as HTMLSelectElement).value as StatusFilter);
  }

  _stop(event: Event): void {
    event.stopPropagation();
  }
}
