import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { DatePipe } from '@angular/common';

import { Translate } from '../../../core/services/translate';
import { LabService } from '../../../core/services/lab/lab.service';
import { GuestResult } from '../../../core/models/lab.model';
import { Spinner } from '../../../shared/components/spinner/spinner';
import { Button } from '../../../shared/components/button/button';
import { formatToAmPm } from '../../../shared/utils/date-time.utils';

@Component({
  selector: 'app-lab-result-guest',
  standalone: true,
  imports: [LucideAngularModule, DatePipe, Spinner, Button],
  templateUrl: './lab-result-guest.html',
  styleUrl: './lab-result-guest.scss',
})
export class LabResultGuestComponent implements OnInit {

  readonly t = inject(Translate);
  private readonly _svc   = inject(LabService);
  private readonly _route = inject(ActivatedRoute);

  readonly result        = signal<GuestResult | null>(null);
  readonly loading       = signal(true);
  readonly error         = signal<string | null>(null);
  readonly downloading   = signal(false);
  readonly downloadError = signal<string | null>(null);

  private _token = '';

  readonly formatToAmPm = formatToAmPm;

  ngOnInit(): void {
    this._token = this._route.snapshot.queryParamMap.get('token') ?? '';
    if (!this._token) {
      this.loading.set(false);
      this.error.set('lab.guest.invalidToken');
      return;
    }
    this._svc.getGuestResultado(this._token).subscribe({
      next: r => { this.result.set(r); this.loading.set(false); },
      error: () => { this.error.set('lab.guest.notFound'); this.loading.set(false); },
    });
  }

  _download(): void {
    this.downloading.set(true);
    this.downloadError.set(null);
    this._svc.getGuestDownloadUrl(this._token).subscribe({
      next: ({ downloadUrl }) => { window.open(downloadUrl, '_blank'); this.downloading.set(false); },
      error: () => { this.downloadError.set('lab.guest.downloadFailed'); this.downloading.set(false); },
    });
  }

  _view(): void {
    this.downloading.set(true);
    this.downloadError.set(null);
    this._svc.getGuestDownloadUrl(this._token).subscribe({
      next: ({ downloadUrl }) => { window.open(downloadUrl, '_blank'); this.downloading.set(false); },
      error: () => { this.downloadError.set('lab.guest.downloadFailed'); this.downloading.set(false); },
    });
  }
}
