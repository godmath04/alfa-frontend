import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { importProvidersFrom } from '@angular/core';
import { LucideAngularModule, Search } from 'lucide-angular';

import { AppointmentHistoryComponent } from './appointment-history';

describe('AppointmentHistoryComponent', () => {
  let component: AppointmentHistoryComponent;
  let fixture: ComponentFixture<AppointmentHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppointmentHistoryComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        importProvidersFrom(LucideAngularModule.pick({ Search })),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AppointmentHistoryComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
