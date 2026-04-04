import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookAppointment } from './book-appointment';

describe('BookAppointment', () => {
  let component: BookAppointment;
  let fixture: ComponentFixture<BookAppointment>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BookAppointment],
    }).compileComponents();

    fixture = TestBed.createComponent(BookAppointment);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
