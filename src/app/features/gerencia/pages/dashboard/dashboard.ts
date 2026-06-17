import { Component, computed, inject, OnInit } from '@angular/core';
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
      [Role.Paciente]: this.translate.get('gerencia.dashboard.roles.paciente')
    };
    const label = roleLabels[role ?? ''] ?? this.translate.get('gerencia.dashboard.roles.usuario');
    return `${timeGreeting}, ${label}`;
  });

  ngOnInit(): void {
    this.vm.loadDashboard();
  }
}
