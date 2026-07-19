import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';

import { Translate }         from '../../../../core/services/translate';
import { StatusFilter }      from '../../../../core/services/medico/agenda.state';
import { DoctorAppointment } from '../../../../core/models/medico.model';
import { formatToAmPm }      from '../../../../shared/utils/date-time.utils';

@Component({
  selector: 'app-day-appointments',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './day-appointments.html',
  styleUrl: './day-appointments.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DayAppointmentsComponent {
  @Input() appointments: DoctorAppointment[] = [];
  @Input() expandedId:   number | null       = null;
  @Input() searchQuery:  string              = '';
  @Input() statusFilter: StatusFilter        = 'ALL';

  @Output() searchChange = new EventEmitter<string>();
  @Output() filterChange = new EventEmitter<StatusFilter>();
  @Output() expand       = new EventEmitter<number>();
  @Output() markAbsent   = new EventEmitter<number>();
  @Output() markCompleted = new EventEmitter<number>();

  readonly t            = inject(Translate);
  readonly formatToAmPm = formatToAmPm;

  _getInitials(name: string): string {
    return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
  }

  _getEffectiveStatus(apt: DoctorAppointment): string {
    if (apt.status === 'PENDIENTE' || apt.status === 'CONFIRMADA') {
      const end = new Date(`${apt.date}T${apt.endTime}`);
      if (end < new Date()) return 'COMPLETADA';
    }
    return apt.status;
  }

  _isPastRow(apt: DoctorAppointment): boolean {
    const status = this._getEffectiveStatus(apt);
    return status === 'COMPLETADA' || status === 'NO_ASISTIO' || status === 'CANCELADA';
  }

  _isToday(apt: DoctorAppointment): boolean {
    const todayStr = new Date().toISOString().split('T')[0];
    return apt.date === todayStr;
  }

  _canCompleteOrAbsent(apt: DoctorAppointment): boolean {
    return this._isToday(apt) && (apt.status === 'PENDIENTE' || apt.status === 'CONFIRMADA');
  }

  _onSearch(event: Event): void {
    this.searchChange.emit((event.target as HTMLInputElement).value);
  }

  _onFilter(event: Event): void {
    this.filterChange.emit((event.target as HTMLSelectElement).value as StatusFilter);
  }

  _toggleRow(id: number): void {
    this.expand.emit(id);
  }

  _onMarkAbsent(id: number, event: Event): void {
    event.stopPropagation();
    this.markAbsent.emit(id);
  }

  _onMarkCompleted(id: number, event: Event): void {
    event.stopPropagation();
    this.markCompleted.emit(id);
  }

  _stop(event: Event): void {
    event.stopPropagation();
  }
}
