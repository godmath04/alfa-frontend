import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { DatePipe } from '@angular/common';

import { Translate } from '../../../../core/services/translate';
import { LabBookingViewModel } from '../../../../core/services/lab/lab-booking.view-model';
import { Button } from '../../../../shared/components/button/button';
import { Spinner } from '../../../../shared/components/spinner/spinner';
import { LabCatalog } from '../../../../core/models/lab.model';
import { formatToAmPm } from '../../../../shared/utils/date-time.utils';
import { DoctorProfile } from '../../../../core/models/admin.model';


@Component({
  selector: 'app-executive-book-lab-appointment',
  standalone: true,
  imports: [LucideAngularModule, Button, Spinner, DatePipe],
  templateUrl: './book-lab-appointment.html',
  styleUrl: './book-lab-appointment.scss',
})
export class ExecutiveBookLabAppointmentPage implements OnInit {

  readonly t   = inject(Translate);
  readonly vm  = inject(LabBookingViewModel);
  private readonly _router = inject(Router);
  private readonly _route  = inject(ActivatedRoute);

  private _patientId!: number;

  _currentStep = 0;
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

  _filteredDoctors = computed(() => {
    const q = this._doctorSearchQuery().toLowerCase().trim();
    const docs = this.vm.doctors();
    if (!q) return docs;
    return docs.filter(d => 
      d.firstName.toLowerCase().includes(q) || 
      (d.lastName && d.lastName.toLowerCase().includes(q)) ||
      (d.specialties?.some((s: any) => s.nombre.toLowerCase().includes(q)))
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
    this.vm.setMedicoId(doc.id.toString());
    this._closeDoctorModal();
  }

  _getDoctorName(id: string): string {
    if (!id) return '';
    const doc = this.vm.doctors().find(d => d.id.toString() === id);
    if (!doc) return id;
    return `${doc.firstName} ${doc.lastName || ''}`;
  }

  ngOnInit(): void {
    this._patientId = Number(this._route.snapshot.paramMap.get('id'));
    this.vm.clear();
    this.vm.loadLabs();
    this.vm.loadCatalogs();
    this._currentStep = 1;
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

  _onDateClick(date: string): void { this.vm.selectDate(date); }
  _onTimeClick(time: string): void { this.vm.selectTime(time); }

  _onStudyTypeChange(event: Event): void {
    const sel = event.target as HTMLSelectElement;
    const opt = sel.options[sel.selectedIndex];
    this.vm.selectStudyType(Number(opt.value), opt.text);
  }

  _onInsuranceTypeChange(event: Event): void {
    const sel = event.target as HTMLSelectElement;
    const opt = sel.options[sel.selectedIndex];
    this.vm.selectInsuranceType(Number(opt.value), opt.text);
  }

  _onObsInput(event: Event): void {
    this.vm.setObservations((event.target as HTMLTextAreaElement).value);
  }


  _confirm(): void {
    if (!this.vm.canConfirmDetails()) return;
    this.vm.book(() => this._next(), this._patientId);
  }

  _goBack(): void {
    this._router.navigate(['/ejecutivo/pacientes', this._patientId]);
  }

  _newBooking(): void {
    this.vm.clear();
    this.vm.loadLabs();
    this._currentStep = 1;
  }
}
