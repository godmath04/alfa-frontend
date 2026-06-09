import { Component, inject, OnInit } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { DatePipe } from '@angular/common';

import { Translate } from '../../../core/services/translate';
import { LabResultsViewModel } from '../../../core/services/lab/lab-results.view-model';
import { Spinner } from '../../../shared/components/spinner/spinner';
import { Button } from '../../../shared/components/button/button';

@Component({
  selector: 'app-lab-results',
  standalone: true,
  imports: [LucideAngularModule, DatePipe, Spinner, Button],
  templateUrl: './lab-results.html',
  styleUrl: './lab-results.scss',
  providers: [LabResultsViewModel],
})
export class LabResultsComponent implements OnInit {

  readonly t   = inject(Translate);
  readonly vm  = inject(LabResultsViewModel);

  ngOnInit(): void {
    this.vm.loadMisResultados();
  }

  _download(id: string): void {
    this.vm.download(id);
  }
}
