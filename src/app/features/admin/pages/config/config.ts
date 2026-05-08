import { Component, afterNextRender, inject, signal } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';

import { Translate } from '../../../../core/services/translate';
import { ConfigViewModel } from '../../../../core/services/admin/config.view-model';
import { SystemConfig, SystemConfigRequest } from '../../../../core/models/admin.model';

@Component({
  selector: 'app-config',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './config.html',
  styleUrl: './config.scss',
})
export class ConfigPage {
  readonly t = inject(Translate);
  readonly configVm = inject(ConfigViewModel);

  readonly _formVisible = signal(false);
  readonly _editingId = signal<number | null>(null);
  readonly _formError = signal<string | null>(null);

  readonly _fKey = signal('');
  readonly _fValue = signal('');
  readonly _fDescription = signal('');

  constructor() {
    afterNextRender(() => this.configVm.loadAll());
  }

  _openCreate(): void {
    this._editingId.set(null);
    this._fKey.set('');
    this._fValue.set('');
    this._fDescription.set('');
    this._formError.set(null);
    this._formVisible.set(true);
  }

  _openEdit(c: SystemConfig): void {
    this._editingId.set(c.id);
    this._fKey.set(c.key);
    this._fValue.set(c.value);
    this._fDescription.set(c.description ?? '');
    this._formError.set(null);
    this._formVisible.set(true);
  }

  _cancel(): void {
    this._formVisible.set(false);
    this._editingId.set(null);
    this._formError.set(null);
  }

  _save(): void {
    const key = this._fKey().trim();
    const value = this._fValue().trim();

    if (!key) {
      this._formError.set(this.t.get('admin.config.validation.key-required'));
      return;
    }
    if (!value) {
      this._formError.set(this.t.get('admin.config.validation.value-required'));
      return;
    }

    const request: SystemConfigRequest = {
      key,
      value,
      description: this._fDescription().trim() || undefined,
    };

    const id = this._editingId();
    const action$ = id !== null ? this.configVm.update(id, request) : this.configVm.create(request);

    action$.subscribe({
      next: () => this._cancel(),
      error: () => this._formError.set(this.t.get('admin.config.save-error')),
    });
  }

  _isEditing(): boolean {
    return this._editingId() !== null;
  }
}
