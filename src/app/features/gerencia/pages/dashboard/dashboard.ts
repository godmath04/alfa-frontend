import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthStateService } from '../../../../core/services/auth/auth.state';
import { AnaliticaDashboardViewModel } from '../../../../core/services/analitica/analitica-dashboard.view-model';
import { Translate } from '../../../../core/services/translate';
import { Role } from '../../../../core/models/role.enum';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard implements OnInit {
  readonly vm = inject(AnaliticaDashboardViewModel);
  readonly translate = inject(Translate);
  private readonly _authState = inject(AuthStateService);

  activeSlice = signal<{ nombre: string; cantidad: number; pct: number; color: string } | null>(null);
  activeNotifSlice = signal<{ nombre: string; cantidad: number; pct: number; color: string } | null>(null);
  readonly currentDate = new Date().toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  readonly greeting = computed(() => {
    const role = this._authState.userRole();
    const hour = new Date().getHours();
    let timeGreeting: string;
    if (hour < 12) {
      timeGreeting = this.translate.get('gerencia.dashboard.greeting.morning');
    } else if (hour < 18) {
      timeGreeting = this.translate.get('gerencia.dashboard.greeting.afternoon');
    } else {
      timeGreeting = this.translate.get('gerencia.dashboard.greeting.night');
    }

    const roleLabels: Record<string, string> = {
      [Role.Gerencia]: this.translate.get('gerencia.dashboard.roles.gerencia'),
      [Role.Administrador]: this.translate.get('gerencia.dashboard.roles.administrador'),
      [Role.Ejecutivo]: this.translate.get('gerencia.dashboard.roles.ejecutivo'),
      [Role.Medico]: this.translate.get('gerencia.dashboard.roles.medico'),
      [Role.Paciente]: this.translate.get('gerencia.dashboard.roles.paciente'),
      [Role.TecnicoLab]: this.translate.get('gerencia.dashboard.roles.tecnico_lab')
    };
    const label = roleLabels[role ?? ''] ?? this.translate.get('gerencia.dashboard.roles.usuario');
    return `${timeGreeting}, ${label}`;
  });

  formatPeriod(period: string | undefined): string {
    if (!period) return '';
    // If daily format: yyyy-MM-dd
    if (period.length === 10) {
      const parts = period.split('-');
      const day = parseInt(parts[2], 10);
      const monthNum = parts[1];
      const monthNames: Record<string, string> = {
        '01': 'Ene', '02': 'Feb', '03': 'Mar', '04': 'Abr',
        '05': 'May', '06': 'Jun', '07': 'Jul', '08': 'Ago',
        '09': 'Sep', '10': 'Oct', '11': 'Nov', '12': 'Dic'
      };
      const monthName = monthNames[monthNum] || monthNum;
      return `${day}\n${monthName}`;
    }
    // If monthly format: yyyy-MM
    if (period.length === 7) {
      const monthNum = period.split('-')[1];
      const monthNames: Record<string, string> = {
        '01': 'Ene', '02': 'Feb', '03': 'Mar', '04': 'Abr',
        '05': 'May', '06': 'Jun', '07': 'Jul', '08': 'Ago',
        '09': 'Sep', '10': 'Oct', '11': 'Nov', '12': 'Dic'
      };
      return monthNames[monthNum] || period;
    }
    return period;
  }

  ngOnInit(): void {
    this.vm.loadDashboard();
  }
}
