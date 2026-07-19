import { Component, afterNextRender, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { SystemLogsService } from '../../../../core/services/admin/system-logs.service';
import { LogEntry } from '../../../../core/models/admin.model';
import { catchError, finalize } from 'rxjs';

@Component({
  selector: 'app-system-logs',
  standalone: true,
  imports: [FormsModule, LucideAngularModule],
  templateUrl: './system-logs.html',
  styleUrl: './system-logs.scss',
})
export class SystemLogs {
  private readonly _service = inject(SystemLogsService);

  readonly _logs    = signal<LogEntry[]>([]);
  readonly _total   = signal(0);
  readonly _loading = signal(false);
  readonly _error   = signal(false);

  readonly _activeTab = signal<'SISTEMA' | 'NOTIFICACIONES'>('SISTEMA');

  readonly _servicios = ['TODOS', 'alfa-admin-service', 'alfa-agendamiento-service', 'alfa-analitica-service', 'alfa-auth-service', 'alfa-api-gateway', 'alfa-laboratorio-service', 'alfa-notificaciones-service'];
  readonly _niveles   = ['TODOS', 'INFO', 'WARN', 'ERROR', 'DEBUG'];

  readonly _fServicio = signal('TODOS');
  readonly _fNivel    = signal('TODOS');

  readonly _fDesde = signal(this._formatDate(new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)));
  readonly _fHasta = signal(this._formatDate(new Date()));

  readonly _today     = this._formatDate(new Date());

  readonly _pagina    = signal(1);
  readonly _pageSize  = signal(50);

  constructor() {
    afterNextRender(() => this._loadData());
  }

  _setTab(tab: 'SISTEMA' | 'NOTIFICACIONES'): void {
    this._activeTab.set(tab);
    this._pagina.set(1);
    this._loadData();
  }

  _applyFilters(): void {
    this._pagina.set(1);
    this._loadData();
  }

  _prevPage(): void {
    if (this._pagina() > 1) {
      this._pagina.update(p => p - 1);
      this._loadData();
    }
  }

  _nextPage(): void {
    if (this._pagina() * this._pageSize() < this._total()) {
      this._pagina.update(p => p + 1);
      this._loadData();
    }
  }

  _badgeClass(level: string): string {
    switch (level) {
      case 'ERROR': return 'log-badge--error';
      case 'WARN':  return 'log-badge--warn';
      case 'DEBUG': return 'log-badge--debug';
      default:      return 'log-badge--info';
    }
  }

  private _loadData(): void {
    this._loading.set(true);
    this._error.set(false);

    if (this._activeTab() === 'SISTEMA') {
      this._service.getLogs({
        servicio:   this._fServicio(),
        nivel:      this._fNivel(),
        fechaDesde: this._fDesde(),
        fechaHasta: this._fHasta(),
        pagina:     this._pagina()
      }).pipe(
        finalize(() => this._loading.set(false)),
        catchError((err) => { this._error.set(true); throw err; })
      ).subscribe(res => {
        this._logs.set(res.logs);
        this._total.set(res.total);
      });
    } else {
      this._service.getFailedNotificationsLogs(this._pagina()).pipe(
        finalize(() => this._loading.set(false)),
        catchError((err) => { this._error.set(true); throw err; })
      ).subscribe(res => {
        this._logs.set(res.logs);
        this._total.set(res.total);
      });
    }
  }

  private _formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}
