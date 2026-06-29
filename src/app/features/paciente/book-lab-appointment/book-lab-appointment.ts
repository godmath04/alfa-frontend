import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { DatePipe } from '@angular/common';

import { Translate } from '../../../core/services/translate';
import { LabBookingViewModel } from '../../../core/services/lab/lab-booking.view-model';
import { Button } from '../../../shared/components/button/button';
import { Spinner } from '../../../shared/components/spinner/spinner';
import { LabCatalog } from '../../../core/models/lab.model';
import { formatToAmPm } from '../../../shared/utils/date-time.utils';
import { DoctorProfile } from '../../../core/models/admin.model';

@Component({
  selector: 'app-book-lab-appointment',
  standalone: true,
  imports: [LucideAngularModule, Button, Spinner, DatePipe],
  templateUrl: './book-lab-appointment.html',
  styleUrl: './book-lab-appointment.scss',
})
export class BookLabAppointment implements OnInit {

  readonly t   = inject(Translate);
  readonly vm  = inject(LabBookingViewModel);
  private readonly _router = inject(Router);

  _currentStep = 1;
  readonly _totalSteps = 4;

  readonly _stepLabels = [
    'lab.booking.steps.lab',
    'lab.booking.steps.slot',
    'lab.booking.steps.details',
    'lab.booking.steps.voucher',
  ];

  readonly formatToAmPm = formatToAmPm;

  // ─── Doctor selection modal ───────────────────────────────────────────────
  _showDoctorModal = signal(false);
  _doctorSearchQuery = signal('');
  readonly _failedImageIds = signal(new Set<number>());

  _markImageFailed(id: number): void {
    this._failedImageIds.update(set => {
      const next = new Set(set);
      next.add(id);
      return next;
    });
  }

  _filteredDoctors = computed(() => {
    const q = this._doctorSearchQuery().toLowerCase().trim();
    const docs = this.vm.doctors();
    if (!q) return docs;
    return docs.filter(d => 
      d.firstName.toLowerCase().includes(q) || 
      (d.lastName && d.lastName.toLowerCase().includes(q)) ||
      (d.specialties?.some((s: any) => s.name.toLowerCase().includes(q)))
    );
  });

  _openDoctorModal(): void {
    this._showDoctorModal.set(true);
    this._doctorSearchQuery.set('');
  }

  _closeDoctorModal(): void {
    this._showDoctorModal.set(false);
  }

  _selectDoctor(doc: DoctorProfile): void {
    this.vm.setMedicoId(doc.email);
    this._closeDoctorModal();
  }

  _getInitials(firstName: string, lastName?: string): string {
    const f = (firstName ?? '').trim();
    const l = (lastName ?? '').trim();
    const a = f.charAt(0).toUpperCase();
    const b = l ? l.charAt(0).toUpperCase() : (f.charAt(1) ?? '').toUpperCase();
    return (a + b).trim() || '?';
  }

  _getDoctorName(id: string): string {
    if (!id) return '';
    const doc = this.vm.doctors().find(d => d.id.toString() === id || d.email === id);
    if (!doc) return id;
    return `${doc.firstName} ${doc.lastName || ''}`;
  }

  ngOnInit(): void {
    this.vm.clear();
    this.vm.loadLabs();
    this.vm.loadCatalogs();
  }

  _goToStep(step: number): void {
    if (step >= 1 && step <= this._totalSteps) this._currentStep = step;
  }

  _next(): void { this._goToStep(this._currentStep + 1); }
  _back(): void { this._goToStep(this._currentStep - 1); }

  _onLabClick(lab: LabCatalog): void {
    this.vm.selectLab(lab);
    this._next();
  }

  _onDateClick(date: string): void {
    this.vm.selectDate(date);
  }

  _onTimeClick(time: string): void {
    this.vm.selectTime(time);
  }

  _onStudyTypeChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const opt = select.options[select.selectedIndex];
    this.vm.selectStudyType(Number(opt.value), opt.text);
  }

  _onInsuranceTypeChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const opt = select.options[select.selectedIndex];
    this.vm.selectInsuranceType(Number(opt.value), opt.text);
  }

  _onObsInput(event: Event): void {
    this.vm.setObservations((event.target as HTMLTextAreaElement).value);
  }

  _confirmDetails(): void {
    if (!this.vm.canConfirmDetails()) return;
    this._next();
  }

  _confirm(): void {
    this.vm.book(() => this._next());
  }

  _newBooking(): void {
    this.vm.clear();
    this.vm.loadLabs();
    this._currentStep = 1;
  }

  _goToDashboard(): void {
    this._router.navigate(['/paciente/appointment-history']);
  }
}
