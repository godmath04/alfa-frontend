import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Translate } from '../../../core/services/translate';
import { LabService } from '../../../core/services/lab/lab.service';
import { GuestResult } from '../../../core/models/lab.model';
import { Spinner } from '../../../shared/components/spinner/spinner';
import { Button } from '../../../shared/components/button/button';
import { formatToAmPm } from '../../../shared/utils/date-time.utils';

@Component({
  selector: 'app-lab-result-guest',
  standalone: true,
  imports: [LucideAngularModule, DatePipe, Spinner, Button, FormsModule],
  templateUrl: './lab-result-guest.html',
  styleUrl: './lab-result-guest.scss',
})
export class LabResultGuestComponent implements OnInit {

  readonly t = inject(Translate);
  private readonly _svc   = inject(LabService);
  private readonly _route = inject(ActivatedRoute);

  readonly _result        = signal<GuestResult | null>(null);
  readonly _loading       = signal(true);
  readonly _error         = signal<string | null>(null);
  readonly _downloading   = signal(false);
  readonly _downloadError = signal<string | null>(null);

  readonly _idNumber     = signal('');
  readonly _renewing     = signal(false);
  readonly _renewSuccess = signal(false);
  readonly _renewError   = signal<string | null>(null);

  private _token = '';

  readonly formatToAmPm = formatToAmPm;

  ngOnInit(): void {
    this._token = this._route.snapshot.queryParamMap.get('token') ?? '';
    if (!this._token) {
      this._loading.set(false);
      this._error.set('lab.guest.invalidToken');
      return;
    }
    this._svc.getGuestResultado(this._token).subscribe({
      next: r => { this._result.set(r); this._loading.set(false); },
      error: (err) => {
        if (err?.status === 410) {
          this._error.set('lab.guest.expired');
        } else {
          this._error.set('lab.guest.notFound');
        }
        this._loading.set(false);
      },
    });
  }

  _download(): void {
    this._downloading.set(true);
    this._downloadError.set(null);
    this._svc.getGuestDownloadUrl(this._token).subscribe({
      next: ({ downloadUrl }) => { window.open(downloadUrl, '_blank'); this._downloading.set(false); },
      error: () => { this._downloadError.set('lab.guest.downloadFailed'); this._downloading.set(false); },
    });
  }

  _view(): void {
    this._downloading.set(true);
    this._downloadError.set(null);
    this._svc.getGuestDownloadUrl(this._token, true).subscribe({
      next: ({ downloadUrl }) => { window.open(downloadUrl, '_blank'); this._downloading.set(false); },
      error: () => { this._downloadError.set('lab.guest.downloadFailed'); this._downloading.set(false); },
    });
  }

  _requestRenew(): void {
    const doc = this._idNumber().trim();
    if (!doc) return;
    this._renewing.set(true);
    this._renewError.set(null);
    this._svc.solicitarRenovacionGuest(this._token, doc).subscribe({
      next: () => {
        this._renewSuccess.set(true);
        this._renewing.set(false);
      },
      error: (err) => {
        this._renewError.set(err?.error?.message ?? 'Número de identificación incorrecto.');
        this._renewing.set(false);
      }
    });
  }
}
