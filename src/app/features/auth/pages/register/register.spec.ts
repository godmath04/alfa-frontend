import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { importProvidersFrom } from '@angular/core';
import {
  LucideAngularModule,
  ArrowLeft,
  Mail,
  Lock,
  User,
  Phone,
  IdCard,
  Eye,
  CheckCircle2,
} from 'lucide-angular';

import { Register } from './register';

describe('Register', () => {
  let component: Register;
  let fixture: ComponentFixture<Register>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Register],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        importProvidersFrom(
          LucideAngularModule.pick({
            ArrowLeft,
            Mail,
            Lock,
            User,
            Phone,
            IdCard,
            Eye,
            CheckCircle2,
          }),
        ),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Register);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
