import { Component, afterNextRender, inject, signal } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';

import { Translate } from '../../../../core/services/translate';
import { UserViewModel } from '../../../../core/services/admin/user.view-model';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './users.html',
  styleUrl: './users.scss',
})
export class UsersPage {

  readonly t      = inject(Translate);
  readonly userVm = inject(UserViewModel);

  readonly _editingUserId  = signal<number | null>(null);
  readonly _selectedRole   = signal('');

  readonly _ROLES = [
    'PACIENTE',
    'MEDICO',
    'EJECUTIVO',
    'ADMINISTRADOR',
    'GERENCIA',
  ];

  constructor() {
    afterNextRender(() => this.userVm.loadAll());
  }

  _startEdit(userId: number, currentRole: string): void {
    this._editingUserId.set(userId);
    this._selectedRole.set(currentRole);
  }

  _cancelEdit(): void {
    this._editingUserId.set(null);
    this._selectedRole.set('');
  }

  _saveRole(userId: number): void {
    const role = this._selectedRole();
    if (!role) return;
    this.userVm.changeRole(userId, role);
    this._editingUserId.set(null);
  }

  _isEditing(userId: number): boolean {
    return this._editingUserId() === userId;
  }

  _roleLabel(role: string): string {
    return this.t.get(`admin.users.roles.${role.toLowerCase()}`);
  }

  _roleBadgeClass(role: string): string {
    const map: Record<string, string> = {
      PACIENTE:      'usr-page__badge--paciente',
      MEDICO:        'usr-page__badge--medico',
      EJECUTIVO:     'usr-page__badge--ejecutivo',
      ADMINISTRADOR: 'usr-page__badge--admin',
      GERENCIA:      'usr-page__badge--gerencia',
    };
    return map[role] ?? '';
  }
}
