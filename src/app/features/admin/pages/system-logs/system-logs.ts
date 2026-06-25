import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { SystemLogsService } from '../../../../core/services/admin/system-logs.service';
import { LogEntry } from '../../../../core/models/admin.model';
import { catchError, finalize } from 'rxjs';

@Component({
  selector: 'app-system-logs',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './system-logs.html',
  styleUrl: './system-logs.scss',
})
export class SystemLogs {
  private readonly _service = inject(SystemLogsService);

  readonly logs = signal<LogEntry[]>([]);
  readonly total = signal(0);
  readonly loading = signal(false);
  readonly error = signal(false);

  // Tabs
  readonly activeTab = signal<'SISTEMA' | 'NOTIFICACIONES'>('SISTEMA');

  // Filtros
  readonly servicios = ['TODOS', 'alfa-admin-service', 'alfa-agendamiento-service', 'alfa-analitica-service', 'alfa-auth-service', 'alfa-eureka-server', 'alfa-api-gateway', 'alfa-ia-service', 'alfa-laboratorio-service', 'alfa-notificaciones-service'];
  readonly niveles = ['TODOS', 'INFO', 'WARN', 'ERROR', 'DEBUG'];

  readonly fServicio = signal('TODOS');
  readonly fNivel = signal('TODOS');
  
  readonly fDesde = signal(this._formatDate(new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)));
  readonly fHasta = signal(this._formatDate(new Date()));
  
  readonly pagina = signal(1);
  readonly pageSize = signal(50);

  constructor() {
    this.loadData();
  }

  setTab(tab: 'SISTEMA' | 'NOTIFICACIONES') {
    this.activeTab.set(tab);
    this.pagina.set(1);
    this.loadData();
  }

  loadData() {
    this.loading.set(true);
    this.error.set(false);

    if (this.activeTab() === 'SISTEMA') {
      this._service.getLogs({
        servicio: this.fServicio(),
        nivel: this.fNivel(),
        fechaDesde: this.fDesde(),
        fechaHasta: this.fHasta(),
        pagina: this.pagina()
      }).pipe(
        finalize(() => this.loading.set(false)),
        catchError((err) => {
          this.error.set(true);
          throw err;
        })
      ).subscribe(res => {
        this.logs.set(res.logs);
        this.total.set(res.total);
      });
    } else {
      this._service.getFailedNotificationsLogs(this.pagina()).pipe(
        finalize(() => this.loading.set(false)),
        catchError((err) => {
          this.error.set(true);
          throw err;
        })
      ).subscribe(res => {
        this.logs.set(res.logs);
        this.total.set(res.total);
      });
    }
  }

  applyFilters() {
    this.pagina.set(1);
    this.loadData();
  }

  prevPage() {
    if (this.pagina() > 1) {
      this.pagina.update(p => p - 1);
      this.loadData();
    }
  }

  nextPage() {
    if (this.pagina() * this.pageSize() < this.total()) {
      this.pagina.update(p => p + 1);
      this.loadData();
    }
  }

  badgeClass(level: string): string {
    switch (level) {
      case 'ERROR': return 'log-badge--error';
      case 'WARN':  return 'log-badge--warn';
      case 'DEBUG': return 'log-badge--debug';
      default:      return 'log-badge--info';
    }
  }

  private _formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}
