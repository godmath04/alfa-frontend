import { Component, inject, OnInit } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { AnaliticaViewModel } from '../../../../core/services/analitica/analitica.view-model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [JsonPipe],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard implements OnInit {
  readonly vm = inject(AnaliticaViewModel);

  ngOnInit(): void {
    // Check health on load to test integration
    this.vm.checkHealth();
  }
}
