import { Component, inject, input, output } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { Translate } from '../../../../core/services/translate';
import { Button } from '../../../../shared/components/button/button';
import { MisCitaItem } from '../../../../core/models/appointment.model';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-cancel-modal',
  standalone: true,
  imports: [LucideAngularModule, Button, DatePipe],
  template: `
    <div class="modal-backdrop" (click)="_onCancel()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <lucide-icon name="alert-circle" class="modal-icon text-error"></lucide-icon>
          <h2 class="modal-title">{{ translate.get('paciente.appointmentHistory.cancel.confirmTitle') }}</h2>
        </div>
        
        <div class="modal-body">
          <p class="modal-message">{{ translate.get('paciente.appointmentHistory.cancel.confirmMessage') }}</p>
          
          <div class="appointment-details">
            <h3 class="details-title">{{ translate.get('paciente.appointmentHistory.cancel.confirmDetails') }}</h3>
            <div class="details-grid">
              <div class="detail-item">
                <lucide-icon name="calendar" [size]="14"></lucide-icon>
                <span>{{ cita().fecha | date:'dd/MM/yyyy' }}</span>
              </div>
              <div class="detail-item">
                <lucide-icon name="clock" [size]="14"></lucide-icon>
                <span>{{ cita().horaInicio }}</span>
              </div>
              <div class="detail-item">
                <lucide-icon name="stethoscope" [size]="14"></lucide-icon>
                <span>{{ cita().medicoNombre }}</span>
              </div>
              <div class="detail-item">
                <lucide-icon name="file-text" [size]="14"></lucide-icon>
                <span>{{ cita().especialidad }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <app-button 
            variant="outline" 
            [disabled]="loading()"
            (clicked)="_onCancel()">
            {{ translate.get('paciente.appointmentHistory.cancel.cancelButton') }}
          </app-button>
          
          <app-button 
            variant="destructive" 
            [disabled]="loading()"
            (clicked)="_onConfirm()">
            @if (loading()) {
              <lucide-icon name="loader-2" [size]="16" class="animate-spin mr-2"></lucide-icon>
              {{ translate.get('paciente.appointmentHistory.cancel.cancelling') }}
            } @else {
              {{ translate.get('paciente.appointmentHistory.cancel.confirmButton') }}
            }
          </app-button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      backdrop-filter: blur(4px);
      padding: 1rem;
    }

    .modal-content {
      background: var(--color-white);
      border-radius: var(--radius-lg);
      width: 100%;
      max-width: 500px;
      box-shadow: var(--shadow-lg);
      animation: modal-enter 0.3s ease-out;
      overflow: hidden;
    }

    @keyframes modal-enter {
      from { opacity: 0; transform: scale(0.95) translateY(10px); }
      to { opacity: 1; transform: scale(1) translateY(0); }
    }

    .modal-header {
      padding: var(--spacing-lg);
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
      border-bottom: 1px solid var(--color-border);
    }

    .modal-title {
      font-size: var(--font-size-xl);
      font-weight: 700;
      color: var(--color-primary-dark);
      margin: 0;
    }

    .modal-icon {
      color: var(--color-error);
    }

    .modal-body {
      padding: var(--spacing-lg);
      display: flex;
      flex-direction: column;
      gap: var(--spacing-lg);
    }

    .modal-message {
      font-size: var(--font-size-base);
      color: var(--color-text-muted);
      line-height: 1.5;
    }

    .appointment-details {
      background: var(--color-background);
      padding: var(--spacing-md);
      border-radius: var(--radius-md);
      border: 1px solid var(--color-border);
    }

    .details-title {
      font-size: var(--font-size-sm);
      font-weight: 600;
      color: var(--color-primary-dark);
      margin-bottom: var(--spacing-sm);
    }

    .details-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: var(--spacing-sm);
    }

    .detail-item {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      font-size: var(--font-size-sm);
      color: var(--color-text-primary);
    }

    .modal-footer {
      padding: var(--spacing-lg);
      display: flex;
      justify-content: flex-end;
      gap: var(--spacing-md);
      background: #F9FAFB;
      border-top: 1px solid var(--color-border);
    }

    .animate-spin {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `]
})
export class CancelModalComponent {
  readonly translate = inject(Translate);
  
  cita = input.required<MisCitaItem>();
  loading = input<boolean>(false);
  
  confirm = output<number>();
  cancel = output<void>();

  _onConfirm(): void {
    this.confirm.emit(this.cita().citaId);
  }

  _onCancel(): void {
    this.cancel.emit();
  }
}
