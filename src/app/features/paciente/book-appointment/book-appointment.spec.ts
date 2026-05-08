import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { importProvidersFrom } from '@angular/core';
import { LucideAngularModule, ClipboardList, Zap } from 'lucide-angular';

import { BookAppointment } from './book-appointment';

describe('BookAppointment', () => {
  let component: BookAppointment;
  let fixture: ComponentFixture<BookAppointment>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookAppointment],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        importProvidersFrom(LucideAngularModule.pick({ ClipboardList, Zap })),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BookAppointment);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
