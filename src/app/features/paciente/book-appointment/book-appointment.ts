import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { DecimalPipe } from '@angular/common';

import { Translate } from '../../../core/services/translate';
import { AppointmentViewModel } from '../../../core/services/appointment/appointment.view-model';
import { Button } from '../../../shared/components/button/button';
import { FlowType } from '../../../core/models/appointment.model';

@Component({
  selector: 'app-book-appointment',
  standalone: true,
  imports: [LucideAngularModule, Button, DecimalPipe],
  templateUrl: './book-appointment.html',
  styleUrl: './book-appointment.scss',
})
export class BookAppointment implements OnInit {

  readonly _translate = inject(Translate);
  readonly vm = inject(AppointmentViewModel);
  private readonly _router = inject(Router);

  _currentStep = 0;

  // Dynamic total steps based on flow type
  get _totalSteps(): number {
    return this.vm.flowType() === 'quick' ? 3 : 5;
  }

  // Step labels for the stepper header
  get _stepLabels(): string[] {
    if (this.vm.flowType() === 'quick') {
      return [
        this._translate.get('paciente.appointments.steps.quickSpecialtyDate'),
        this._translate.get('paciente.appointments.steps.quickConfirm'),
        this._translate.get('paciente.appointments.steps.voucher')
      ];
    }
    return [
      this._translate.get('paciente.appointments.steps.specialty'),
      this._translate.get('paciente.appointments.steps.doctor'),
      this._translate.get('paciente.appointments.steps.datetime'),
      this._translate.get('paciente.appointments.steps.confirmation'),
      this._translate.get('paciente.appointments.steps.voucher')
    ];
  }

  // Helper to check if current step is the voucher
  get _isVoucherStep(): boolean {
    return (this.vm.flowType() === 'manual' && this._currentStep === 5) ||
           (this.vm.flowType() === 'quick' && this._currentStep === 3);
  }

  ngOnInit(): void {
    this.vm.clearFlow();
    this.vm.loadSpecialties();
  }

  // ─── Flow selection ────────────────────────────────

  _selectFlow(flow: FlowType): void {
    this.vm.selectFlow(flow);
    this._currentStep = 1;
  }

  // ─── Navigation ────────────────────────────────────

  _goToStep(step: number): void {
    if (step >= 0 && step <= this._totalSteps) {
      this._currentStep = step;
    }
  }

  _next(): void {
    this._goToStep(this._currentStep + 1);
  }

  _back(): void {
    if (this._currentStep === 1) {
      // Return to flow selector, cancel any active proposal
      this.vm.resetFlow();
      this._currentStep = 0;
    } else if (this.vm.flowType() === 'quick' && this._currentStep === 2 && this.vm.proposal()) {
      // Cancel proposal when going back from quick step 2
      this.vm.cancelQuickProposal();
      this._goToStep(1);
    } else {
      this._goToStep(this._currentStep - 1);
    }
  }

  // ─── Specialty click handler ───────────────────────

  _onSpecialtyClick(specialty: import('../../../core/models/appointment.model').SpecialtyCatalog): void {
    this.vm.onSpecialtySelected(specialty);
    // In manual flow, auto-advance to step 2
    if (this.vm.flowType() === 'manual') {
      this._next();
    }
  }

  // ─── Doctor click handler ──────────────────────────

  _onDoctorClick(doctor: import('../../../core/models/appointment.model').SpecialtyDoctor): void {
    this.vm.onDoctorSelected(doctor);
    this._next();
  }

  // ─── Manual confirmation ───────────────────────────

  _confirmManual(): void {
    this.vm.confirmManualAppointment(() => this._next());
  }

  // ─── Quick flow actions ────────────────────────────

  _requestQuickProposal(): void {
    this.vm.requestQuickProposal(() => this._next());
  }

  _confirmQuick(): void {
    this.vm.confirmQuickAppointment(() => this._next());
  }

  _cancelQuickAndGoBack(): void {
    this.vm.cancelQuickProposal();
    this._goToStep(1);
  }

  // ─── Post-voucher actions ──────────────────────────

  _newAppointment(): void {
    this.vm.clearFlow();
    this._currentStep = 0;
    this.vm.loadSpecialties();
  }

  _goToDashboard(): void {
    this._router.navigate(['/paciente/dashboard']);
  }

  // ─── Input handler for motivo textarea ─────────────

  _onMotivoInput(event: Event): void {
    const textarea = event.target as HTMLTextAreaElement;
    this.vm.setMotivo(textarea.value);
  }

  // ─── Image error fallback ──────────────────────────

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    // Prevent infinite loop if LOGO.svg also fails
    if (!img.src.includes('LOGO.svg')) {
      img.src = '/images/LOGO.svg';
    }
  }

  // ─── Date timeline (next 14 days from today) ───────

  readonly availableDates = this._generateNextDays(14);

  private _generateNextDays(count: number): { value: string; dayName: string; dayNumber: string; monthName: string }[] {
    const days = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

    for (let i = 0; i < count; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);

      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const ddStr = String(d.getDate()).padStart(2, '0');

      days.push({
        value: `${yyyy}-${mm}-${ddStr}`,
        dayName: i === 0 ? 'Hoy' : i === 1 ? 'Mañana' : weekDays[d.getDay()],
        dayNumber: ddStr,
        monthName: months[d.getMonth()]
      });
    }
    return days;
  }

  // ─── Time format helper ────────────────────────────

  /**
   * Transforms 24h string like '08:30:00' to 12h user-friendly string '8:30 AM'
   */
  formatToAmPm(timeStr: string): string {
    if (!timeStr) return '';
    const parts = timeStr.split(':');
    if (parts.length < 2) return timeStr;
    let h = parseInt(parts[0], 10);
    const m = parts[1];
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
    h = h ? h : 12;
    return `${h}:${m} ${ampm}`;
  }

  /**
   * Formats countdown seconds to mm:ss display
   */
  formatCountdown(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  }
}