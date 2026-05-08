import { ChangeDetectionStrategy, Component, inject, afterNextRender } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';

import { AgendaViewModel } from '../../../../core/services/medico/agenda.view-model';
import { Translate } from '../../../../core/services/translate';
import { DoctorDashboardComponent } from '../../components/doctor-dashboard/doctor-dashboard';
import { DayAppointmentsComponent } from '../../components/day-appointments/day-appointments';
import { CalendarPickerComponent } from '../../components/calendar-picker/calendar-picker';
import { formatToAmPm, MONTHS_SHORT } from '../../../../shared/utils/date-time.utils';

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
  selector: 'app-daily-schedule',
  standalone: true,
  imports: [
    LucideAngularModule,
    DoctorDashboardComponent,
    DayAppointmentsComponent,
    CalendarPickerComponent,
  ],
  templateUrl: './daily-schedule.html',
  styleUrl: './daily-schedule.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DailySchedulePage {
  readonly vm = inject(AgendaViewModel);
  readonly t = inject(Translate);

  constructor() {
    afterNextRender(() => {
      const d = new Date(this.vm.selectedDate() + 'T00:00:00');
      this.vm.loadWeek(d);
    });
  }

  _formatDayHeader(dateStr: string): string {
    const d = new Date(dateStr + 'T00:00:00');
    return `${WEEK_DAYS[d.getDay()]} ${d.getDate()} ${MONTHS_SHORT[d.getMonth()]}`;
  }

  _getInitials(name: string): string {
    return name
      .split(' ')
      .slice(0, 2)
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  }

  _formatToAmPm(time: string): string {
    return formatToAmPm(time);
  }
}
