import { Injectable, inject } from '@angular/core';
import { Observable, catchError, tap, throwError } from 'rxjs';

import { NotificationRuleService }      from './notification-rule';
import { NotificationRuleStateService } from './notification-rule.state';
import {
  NotificationRuleRequest,
  NotificationRuleResponse,
} from '../../models/admin.model';

/** Key used in error signals — resolved by the Translate service in the view */
const ERR_LOAD      = 'admin.notifications.error.load';
const ERR_SAVE      = 'admin.notifications.error.save';
const ERR_TOGGLE    = 'admin.notifications.error.toggle';
const ERR_SCHEDULER = 'admin.notifications.error.scheduler';
const ERR_PROTECTED = 'admin.notifications.rules.modal.protectedRule';

@Injectable({ providedIn: 'root' })
export class NotificationRuleViewModel {

  private readonly _service = inject(NotificationRuleService);
  private readonly _state   = inject(NotificationRuleStateService);

  // ─── Exposed signals ──────────────────────────────────────────────────────

  readonly rules          = this._state.items;
  readonly loading        = this._state.loading;
  readonly error          = this._state.error;
  readonly saving         = this._state.saving;
  readonly saveError      = this._state.saveError;
  readonly schedulerHour  = this._state.schedulerHour;
  readonly schedulerSaving = this._state.schedulerSaving;

  // ─── Load actions ─────────────────────────────────────────────────────────

  loadAll(): void {
    this._state.setLoading(true);
    this._state.setError(null);
    this._service.getAll().subscribe({
      next:  items => { this._state.setItems(items); this._state.setLoading(false); },
      error: ()    => { this._state.setError(ERR_LOAD); this._state.setLoading(false); },
    });
  }

  loadSchedulerHour(): void {
    this._service.getSchedulerHour().subscribe({
      next:  value => this._state.setSchedulerHour(parseInt(value, 10)),
      error: ()    => { /* non-blocking — hour stays null */ },
    });
  }

  // ─── CRUD ─────────────────────────────────────────────────────────────────

  create(request: NotificationRuleRequest): Observable<NotificationRuleResponse> {
    this._state.setSaving(true);
    this._state.setSaveError(null);
    return this._service.create(request).pipe(
      tap(rule => { this._state.upsert(rule); this._state.setSaving(false); }),
      catchError(err => {
        this._state.setSaveError(ERR_SAVE);
        this._state.setSaving(false);
        return throwError(() => err);
      }),
    );
  }

  update(id: number, request: NotificationRuleRequest): Observable<NotificationRuleResponse> {
    this._state.setSaving(true);
    this._state.setSaveError(null);
    return this._service.update(id, request).pipe(
      tap(rule => { this._state.upsert(rule); this._state.setSaving(false); }),
      catchError(err => {
        this._state.setSaveError(ERR_SAVE);
        this._state.setSaving(false);
        return throwError(() => err);
      }),
    );
  }

  /**
   * Toggle active/inactive.
   * Returns an error key string if the rule is protected and cannot be toggled.
   * Returns null if the toggle was executed (may still fail via HTTP).
   */
  toggle(rule: NotificationRuleResponse): string | null {
    // Business rule: IMMEDIATE + CONFIRMATION cannot be deactivated
    if (rule.ruleType === 'IMMEDIATE' && rule.purpose === 'CONFIRMATION' && rule.active) {
      return ERR_PROTECTED;
    }

    this._service.toggle(rule.id).subscribe({
      next:  () => this._state.flipActive(rule.id),
      error: () => this._state.setError(ERR_TOGGLE),
    });

    return null;
  }

  // ─── Scheduler ────────────────────────────────────────────────────────────

  saveSchedulerHour(hour: number): Observable<void> {
    this._state.setSchedulerSaving(true);
    return this._service.updateSchedulerHour(hour).pipe(
      tap(() => { this._state.setSchedulerHour(hour); this._state.setSchedulerSaving(false); }),
      catchError(err => {
        this._state.setSchedulerSaving(false);
        return throwError(() => err);
      }),
    );
  }
}
