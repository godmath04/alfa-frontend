import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { Translate } from '../../../core/services/translate';
import { Button } from '../../../shared/components/button/button';
import { Spinner } from '../../../shared/components/spinner/spinner';
import { AppointmentHistoryViewModel } from './appointment-history.view-model';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-appointment-history',
  standalone: true,
  imports: [ReactiveFormsModule, LucideAngularModule, Button, Spinner, DatePipe],
  providers: [AppointmentHistoryViewModel],
  templateUrl: './appointment-history.html',
  styleUrl: './appointment-history.scss'
})
export class AppointmentHistoryComponent implements OnInit {

  readonly vm = inject(AppointmentHistoryViewModel);
  readonly translate = inject(Translate);
  private readonly _fb = inject(FormBuilder);

  // Filtros de búsqueda
  readonly filterForm = this._fb.group({
    estado: [''],
    fechaDesde: [''],
    fechaHasta: ['']
  });

  ngOnInit(): void {
    // Carga inicial (page=0, sin filtros)
    this.vm.loadMisCitas();
  }

  _onSearch(): void {
    const v = this.filterForm.value;
    this.vm.setFilters(v.estado || '', v.fechaDesde || '', v.fechaHasta || '');
  }

  _onClearFilters(): void {
    this.filterForm.reset({
      estado: '',
      fechaDesde: '',
      fechaHasta: ''
    });
    this.vm.clearFilters();
  }

  _prevPage(): void {
    if (this.vm.page() > 0) {
      this.vm.setPage(this.vm.page() - 1);
      this._scrollToTop();
    }
  }

  _nextPage(): void {
    if (!this.vm.isLastPage()) {
      this.vm.setPage(this.vm.page() + 1);
      this._scrollToTop();
    }
  }

  private _scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
