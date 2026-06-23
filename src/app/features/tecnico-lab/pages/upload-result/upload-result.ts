import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';

import { LabService } from '../../../../core/services/lab/lab.service';
import { LabResult, GuestResult } from '../../../../core/models/lab.model';
import { Button } from '../../../../shared/components/button/button';
import { Spinner } from '../../../../shared/components/spinner/spinner';

@Component({
  selector: 'app-tl-upload-result',
  standalone: true,
  imports: [LucideAngularModule, Button, Spinner],
  templateUrl: './upload-result.html',
  styleUrl: './upload-result.scss',
})
export class TlUploadResultPage {

  private readonly _svc    = inject(LabService);
  private readonly _route  = inject(ActivatedRoute);
  private readonly _router = inject(Router);

  /** citaId comes from the route param :citaId */
  readonly citaId = Number(this._route.snapshot.paramMap.get('citaId'));

  // ── Upload state ──────────────────────────────────────────────────────────
  readonly selectedFile  = signal<File | null>(null);
  readonly uploading     = signal(false);
  readonly uploadError   = signal<string | null>(null);
  readonly uploadResult  = signal<LabResult | null>(null);

  // ── Token resend state (only shown when result.guest === true) ────────────
  readonly resending    = signal(false);
  readonly resendError  = signal<string | null>(null);
  readonly resendResult = signal<GuestResult | null>(null);

  // ── File selection ────────────────────────────────────────────────────────

  _onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file  = input.files?.[0] ?? null;
    if (file && file.type !== 'application/pdf') {
      this.uploadError.set('Solo se permiten archivos PDF');
      this.selectedFile.set(null);
      return;
    }
    this.selectedFile.set(file);
    this.uploadError.set(null);
  }

  // ── Upload PDF ────────────────────────────────────────────────────────────

  _upload(): void {
    const file = this.selectedFile();
    if (!file || !this.citaId) return;
    this.uploading.set(true);
    this.uploadError.set(null);
    this._svc.subirResultado(this.citaId, file).subscribe({
      next:  result => { this.uploadResult.set(result); this.uploading.set(false); },
      error: ()     => { this.uploadError.set('Error al subir el archivo. Intenta nuevamente.'); this.uploading.set(false); },
    });
  }

  // ── Resend guest access token ─────────────────────────────────────────────

  _resendToken(): void {
    this.resending.set(true);
    this.resendError.set(null);
    this._svc.reenviarToken(this.citaId).subscribe({
      next:  r  => { this.resendResult.set(r); this.resending.set(false); },
      error: () => { this.resendError.set('Error al reenviar el código de acceso.'); this.resending.set(false); },
    });
  }

  // ── Navigation ────────────────────────────────────────────────────────────

  _goBack(): void {
    this._router.navigate(['/tecnico-lab/dashboard']);
  }
}
