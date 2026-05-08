import { ComponentFixture, TestBed } from '@angular/core/testing';
import { importProvidersFrom } from '@angular/core';
import {
  LucideAngularModule,
  AlertCircle,
  Calendar,
  Clock,
  Stethoscope,
  FileText,
} from 'lucide-angular';

import { CancelModalComponent } from './cancel-modal';

describe('CancelModalComponent', () => {
  let component: CancelModalComponent;
  let fixture: ComponentFixture<CancelModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CancelModalComponent],
      providers: [
        importProvidersFrom(
          LucideAngularModule.pick({ AlertCircle, Calendar, Clock, Stethoscope, FileText }),
        ),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CancelModalComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('cita', {
      id: 1,
      fecha: '2026-05-08',
      horaInicio: '10:00',
      especialidad: 'General',
      doctor: 'Dr. House',
      estado: 'PENDIENTE',
    });
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
