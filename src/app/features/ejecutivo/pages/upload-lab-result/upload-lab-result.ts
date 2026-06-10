import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';

import { Translate } from '../../../../core/services/translate';
import { LabService } from '../../../../core/services/lab/lab.service';
import { LabResult, GuestResult } from '../../../../core/models/lab.model';
import { Button } from '../../../../shared/components/button/button';
import { Spinner } from '../../../../shared/components/spinner/spinner';

@Component({
  selector: 'app-upload-lab-result',
  standalone: true,
  imports: [LucideAngularModule, Button, Spinner],
  templateUrl: './upload-lab-result.html',
  styleUrl: './upload-lab-result.scss',
})
export class UploadLabResultPage {

  readonly t = inject(Translate);
  private readonly _svc    = inject(LabService);
  private readonly _route  = inject(ActivatedRoute);
  private readonly _router = inject(Router);

  readonly citaId = Number(this._route.snapshot.paramMap.get('citaId'));

  readonly selectedFile  = signal<File | null>(null);
  readonly uploading     = signal(false);
  readonly uploadError   = signal<string | null>(null);
  readonly uploadResult  = signal<LabResult | null>(null);

  // Token resend
  readonly resending      = signal(false);
  readonly resendError    = signal<string | null>(null);
  readonly resendResult   = signal<GuestResult | null>(null);

  _onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    if (file && file.type !== 'application/pdf') {
      this.uploadError.set(this.t.get('lab.upload.pdfOnly'));
      this.selectedFile.set(null);
      return;
    }
    this.selectedFile.set(file);
    this.uploadError.set(null);
  }

  _upload(): void {
    const file = this.selectedFile();
    if (!file) return;
    this.uploading.set(true);
    this.uploadError.set(null);
    this._svc.subirResultado(this.citaId, file).subscribe({
      next: result => { this.uploadResult.set(result); this.uploading.set(false); },
      error: () => { this.uploadError.set(this.t.get('lab.upload.error')); this.uploading.set(false); },
    });
  }

  _resendToken(): void {
    this.resending.set(true);
    this.resendError.set(null);
    this._svc.reenviarToken(this.citaId).subscribe({
      next: r => { this.resendResult.set(r); this.resending.set(false); },
      error: () => { this.resendError.set(this.t.get('lab.upload.resendError')); this.resending.set(false); },
    });
  }

  _goBack(): void {
    this._router.navigate(['/ejecutivo/pacientes']);
  }
}
