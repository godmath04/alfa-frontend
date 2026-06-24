import { Injectable, signal } from '@angular/core';
import { AnaliticaHealthResponse } from '../../models/analitica.model';

@Injectable({ providedIn: 'root' })
export class AnaliticaStateService {
  readonly healthStatus = signal<AnaliticaHealthResponse | null>(null);

  setHealthStatus(status: AnaliticaHealthResponse): void {
    this.healthStatus.set(status);
  }

  clear(): void {
    this.healthStatus.set(null);
  }
}
