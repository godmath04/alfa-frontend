import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';

import { Translate }          from '../../../../core/services/translate';
import { StatusFilter }       from '../../../../core/services/medico/agenda.state';
import { DoctorAppointment }  from '../../../../core/models/medico.model';
import { formatToAmPm }       from '../../../../shared/utils/date-time.utils';

@Component({
  selector: 'app-citas-dia',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './citas-dia.html',
  styleUrl: './citas-dia.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CitasDiaComponent {
  @Input() appointments: DoctorAppointment[] = [];
  @Input() expandedId:   number | null       = null;
  @Input() searchQuery:  string              = '';
  @Input() statusFilter: StatusFilter        = 'ALL';

  @Output() searchChange = new EventEmitter<string>();
  @Output() filterChange = new EventEmitter<StatusFilter>();
  @Output() expand       = new EventEmitter<number>();

  readonly t            = inject(Translate);
  readonly formatToAmPm = formatToAmPm;

  _getInitials(name: string): string {
    return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
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

  _stop(event: Event): void {
    event.stopPropagation();
  }
}
