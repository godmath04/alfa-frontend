import { ChangeDetectionStrategy, Component, Input, inject } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';

import { Translate }      from '../../../../core/services/translate';
import { formatToAmPm }   from '../../../../shared/utils/date-time.utils';

@Component({
  selector: 'app-dashboard-medico',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './dashboard-medico.html',
  styleUrl: './dashboard-medico.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardMedicoComponent {
  @Input() total:     number      = 0;
  @Input() confirmed: number      = 0;
  @Input() pending:   number      = 0;
  @Input() nextTime:  string | null = null;

  readonly t            = inject(Translate);
  readonly formatToAmPm = formatToAmPm;
}
