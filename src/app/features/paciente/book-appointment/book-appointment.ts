import { Component, inject, OnInit } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { DecimalPipe } from '@angular/common';

import { Translate } from '../../../core/services/translate';
import { AppointmentViewModel } from '../../../core/services/appointment/appointment.view-model';
import { Button } from '../../../shared/components/button/button';

@Component({
  selector: 'app-book-appointment',
  standalone: true,
  imports: [LucideAngularModule, Button, DecimalPipe],
  templateUrl: './book-appointment.html',
  styleUrl: './book-appointment.scss',
})

export class BookAppointment implements OnInit {
  readonly _translate = inject(Translate);
  readonly vm = inject(AppointmentViewModel); // Connection to ViewModel
  _currentStep = 1;
  _totalSteps  = 3;
  ngOnInit(): void {
    // When the view is loaded (Step 1), launch HTTP request with ViewModel
    this.vm.loadSpecialties();
  }
  _goToStep(step: number): void {
    if (step >= 1 && step <= this._totalSteps) {
      this._currentStep = step;
    }
  }
  _next(): void { this._goToStep(this._currentStep + 1); }
  _back(): void { this._goToStep(this._currentStep - 1); }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    // Prevenimos un bucle infinito si el LOGO.svg también fallara por ruta incorrecta
    if (!img.src.includes('LOGO.svg')) {
      img.src = '/images/LOGO.svg';
    }
  }

  /**
   * Generates a timeline of dates starting from today.
   * By starting from 'today', we naturally exclude and block past dates!
   */
  readonly availableDates = this.generateNextDays(14); 

  private generateNextDays(count: number): { value: string, dayName: string, dayNumber: string, monthName: string }[] {
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
}