import {
  ChangeDetectionStrategy, Component, EventEmitter,
  Input, OnChanges, Output, computed, signal,
} from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { formatDateToISO, MONTHS_FULL } from '../../../../shared/utils/date-time.utils';

interface CalDay {
  date:           string;
  day:            number;
  isCurrentMonth: boolean;
  isToday:        boolean;
  isSelected:     boolean;
}

const DOW = ['L', 'M', 'X', 'J', 'V', 'S', 'D'] as const;

const WEEK_DAYS = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'] as const;

@Component({
  selector: 'app-calendar-picker',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './calendar-picker.html',
  styleUrl: './calendar-picker.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalendarPickerComponent implements OnChanges {

  private readonly _selected = signal(new Date().toISOString().slice(0, 10));

  @Input() set selectedDate(v: string) {
    if (v) this._selected.set(v);
  }
  get selectedDate(): string { return this._selected(); }

  @Output() dateChange = new EventEmitter<string>();

  readonly DOW     = DOW;
  readonly open    = signal(false);

  private readonly _viewYear  = signal(new Date().getFullYear());
  private readonly _viewMonth = signal(new Date().getMonth());

  readonly monthLabel = computed(() =>
    `${MONTHS_FULL[this._viewMonth()].name} ${this._viewYear()}`
  );

  readonly displayLabel = computed(() => {
    const d = new Date(this._selected() + 'T00:00:00');
    return `${WEEK_DAYS[d.getDay()]}, ${d.getDate()} de ${MONTHS_FULL[d.getMonth()].name} ${d.getFullYear()}`;
  });

  readonly calendarDays = computed((): CalDay[] => {
    const year     = this._viewYear();
    const month    = this._viewMonth();
    const today    = new Date().toISOString().slice(0, 10);
    const selected = this._selected();
    const first    = new Date(year, month, 1);
    const last     = new Date(year, month + 1, 0);
    const startDow = (first.getDay() + 6) % 7; // Mon = 0

    const days: CalDay[] = [];

    for (let i = startDow - 1; i >= 0; i--) {
      const d = new Date(year, month, -i);
      const s = formatDateToISO(d);
      days.push({ date: s, day: d.getDate(), isCurrentMonth: false, isToday: s === today, isSelected: s === selected });
    }

    for (let d = 1; d <= last.getDate(); d++) {
      const s = formatDateToISO(new Date(year, month, d));
      days.push({ date: s, day: d, isCurrentMonth: true, isToday: s === today, isSelected: s === selected });
    }

    for (let d = 1; days.length < 42; d++) {
      const s = formatDateToISO(new Date(year, month + 1, d));
      days.push({ date: s, day: d, isCurrentMonth: false, isToday: s === today, isSelected: s === selected });
    }

    return days;
  });

  ngOnChanges(): void {
    const d = new Date(this._selected() + 'T00:00:00');
    this._viewYear.set(d.getFullYear());
    this._viewMonth.set(d.getMonth());
  }

  toggle(): void { this.open.update(v => !v); }
  close():  void { this.open.set(false); }

  prevMonth(): void {
    if (this._viewMonth() === 0) { this._viewMonth.set(11); this._viewYear.update(y => y - 1); }
    else                          { this._viewMonth.update(m => m - 1); }
  }

  nextMonth(): void {
    if (this._viewMonth() === 11) { this._viewMonth.set(0); this._viewYear.update(y => y + 1); }
    else                           { this._viewMonth.update(m => m + 1); }
  }

  selectDay(day: CalDay): void {
    this.dateChange.emit(day.date);
    this.close();
  }
}
