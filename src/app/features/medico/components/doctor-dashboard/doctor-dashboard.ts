import { ChangeDetectionStrategy, Component, Input, inject } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { Translate } from '../../../../core/services/translate';

@Component({
  selector: 'app-doctor-dashboard',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './doctor-dashboard.html',
  styleUrl: './doctor-dashboard.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DoctorDashboardComponent {
  @Input() total:     number = 0;
  @Input() confirmed: number = 0;
  @Input() pending:   number = 0;
  @Input() completed: number = 0;
  @Input() cancelled: number = 0;

  readonly t = inject(Translate);
}
