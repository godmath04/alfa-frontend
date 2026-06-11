import { Injectable, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AnaliticaService } from './analitica';
import { AnaliticaStateService } from './analitica.state';

@Injectable({ providedIn: 'root' })
export class AnaliticaViewModel {
  private readonly _analiticaService = inject(AnaliticaService);
  private readonly _analiticaState = inject(AnaliticaStateService);
  private readonly _destroyRef = inject(DestroyRef);

  readonly loading = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  // Expose state signals
  readonly healthStatus = this._analiticaState.healthStatus;

  checkHealth(): void {
    this.loading.set(true);
    this.error.set(null);

    this._analiticaService.checkHealth()
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: (status) => {
          this.loading.set(false);
          this._analiticaState.setHealthStatus(status);
          console.log('Analitica Health Status:', status); // As requested by user
        },
        error: (err) => {
          this.loading.set(false);
          this.error.set('Error checking analitica health');
          console.error('Analitica Health Error:', err);
        }
      });
  }
}
