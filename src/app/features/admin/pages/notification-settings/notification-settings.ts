import { Component, afterNextRender, inject, signal } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';

import { Translate }                     from '../../../../core/services/translate';
import { NotificationRuleViewModel }     from '../../../../core/services/admin/notification-rule.view-model';
import {
  NotificationRuleRequest,
  NotificationRuleResponse,
  NotificationRuleType,
  NotificationChannel,
  NotificationPurpose,
} from '../../../../core/models/admin.model';

@Component({
  selector: 'app-notification-settings',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './notification-settings.html',
  styleUrl: './notification-settings.scss',
})
export class NotificationSettingsPage {

  readonly t  = inject(Translate);
  readonly vm = inject(NotificationRuleViewModel);

  // ─── Local UI state ───────────────────────────────────────────────────────

  readonly _formVisible    = signal(false);
  readonly _editingRule    = signal<NotificationRuleResponse | null>(null);
  readonly _toggleError    = signal<string | null>(null);
  readonly _schedulerError = signal<string | null>(null);
  readonly _schedulerSaved = signal(false);

  // Form field signals
  readonly _fRuleType   = signal<NotificationRuleType>('IMMEDIATE');
  readonly _fDaysBefore = signal<number | null>(null);
  readonly _fChannel    = signal<NotificationChannel>('EMAIL');
  readonly _fPurpose    = signal<NotificationPurpose>('REMINDER');
  readonly _fActive     = signal(true);
  readonly _fError      = signal<string | null>(null);

  // Scheduler field signal
  readonly _schedulerInput = signal<number>(8);

  constructor() {
    afterNextRender(() => {
      this.vm.loadAll();
      this.vm.loadSchedulerHour();
    });
  }

  // ─── Scheduler actions ────────────────────────────────────────────────────

  _onSchedulerInput(event: Event): void {
    const val = parseInt((event.target as HTMLInputElement).value, 10);
    this._schedulerInput.set(isNaN(val) ? 0 : Math.min(23, Math.max(0, val)));
  }

  _saveSchedulerHour(): void {
    this._schedulerError.set(null);
    this._schedulerSaved.set(false);
    const hour = this._schedulerInput();
    this.vm.saveSchedulerHour(hour).subscribe({
      next:  () => { this._schedulerSaved.set(true); setTimeout(() => this._schedulerSaved.set(false), 3000); },
      error: () => this._schedulerError.set(this.t.get('admin.notifications.error.scheduler')),
    });
  }

  // ─── Table actions ────────────────────────────────────────────────────────

  _openCreate(): void {
    this._editingRule.set(null);
    this._fRuleType.set('IMMEDIATE');
    this._fDaysBefore.set(null);
    this._fChannel.set('EMAIL');
    this._fPurpose.set('REMINDER');
    this._fActive.set(true);
    this._fError.set(null);
    this._toggleError.set(null);
    this._formVisible.set(true);
  }

  _openEdit(rule: NotificationRuleResponse): void {
    this._editingRule.set(rule);
    this._fRuleType.set(rule.ruleType);
    this._fDaysBefore.set(rule.daysBefore);
    this._fChannel.set(rule.channel);
    this._fPurpose.set(rule.purpose);
    this._fActive.set(rule.active);
    this._fError.set(null);
    this._toggleError.set(null);
    this._formVisible.set(true);
  }

  _cancel(): void {
    this._formVisible.set(false);
    this._editingRule.set(null);
    this._fError.set(null);
  }

  _onRuleTypeChange(event: Event): void {
    const val = (event.target as HTMLSelectElement).value as NotificationRuleType;
    this._fRuleType.set(val);
    if (val === 'IMMEDIATE') this._fDaysBefore.set(null);
  }

  _save(): void {
    // Validate daysBefore when ruleType is DAYS_BEFORE
    if (this._fRuleType() === 'DAYS_BEFORE') {
      const days = this._fDaysBefore();
      if (!days || days <= 0) {
        this._fError.set(this.t.get('admin.notifications.rules.modal.validation.daysRequired'));
        return;
      }
    }

    const request: NotificationRuleRequest = {
      ruleType:   this._fRuleType(),
      daysBefore: this._fRuleType() === 'DAYS_BEFORE' ? this._fDaysBefore() : null,
      channel:    this._fChannel(),
      purpose:    this._fPurpose(),
      active:     this._fActive(),
    };

    const editing = this._editingRule();
    const action$ = editing
      ? this.vm.update(editing.id, request)
      : this.vm.create(request);

    action$.subscribe({
      next:  () => this._cancel(),
      error: () => this._fError.set(this.t.get('admin.notifications.error.save')),
    });
  }

  _toggleActive(rule: NotificationRuleResponse): void {
    this._toggleError.set(null);
    const errorKey = this.vm.toggle(rule);
    if (errorKey) {
      this._toggleError.set(this.t.get(errorKey));
    }
  }

  // ─── Helpers (called from template) ──────────────────────────────────────

  _isEditing(): boolean { return this._editingRule() !== null; }

  _channelLabel(channel: NotificationChannel): string {
    const map: Record<NotificationChannel, string> = {
      WHATSAPP: this.t.get('admin.notifications.rules.channels.whatsapp'),
      EMAIL:    this.t.get('admin.notifications.rules.channels.email'),
      BOTH:     this.t.get('admin.notifications.rules.channels.both'),
    };
    return map[channel];
  }

  _channelIcon(channel: NotificationChannel): string {
    const map: Record<NotificationChannel, string> = {
      WHATSAPP: 'message-circle',
      EMAIL:    'at-sign',
      BOTH:     'radio',
    };
    return map[channel];
  }

  _purposeLabel(purpose: NotificationPurpose): string {
    const map: Record<NotificationPurpose, string> = {
      REMINDER:     this.t.get('admin.notifications.rules.purposes.reminder'),
      CONFIRMATION: this.t.get('admin.notifications.rules.purposes.confirmation'),
    };
    return map[purpose];
  }

  _typeLabel(rule: NotificationRuleResponse): string {
    if (rule.ruleType === 'IMMEDIATE') {
      return this.t.get('admin.notifications.rules.types.immediate');
    }
    const days = rule.daysBefore ?? 0;
    const unit  = days === 1
      ? this.t.get('admin.notifications.rules.types.dayBefore')
      : this.t.get('admin.notifications.rules.types.daysBefore');
    return `${days} ${unit}`;
  }

  _isProtected(rule: NotificationRuleResponse): boolean {
    return rule.ruleType === 'IMMEDIATE' && rule.purpose === 'CONFIRMATION';
  }
}
