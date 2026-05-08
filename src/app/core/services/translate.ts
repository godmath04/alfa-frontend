import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class Translate {
  private readonly _http = inject(HttpClient);
  private _translations: Record<string, unknown> = {};

  load(): Promise<void> {
    return lastValueFrom(this._http.get<Record<string, unknown>>('/i18n/es.json')).then((data) => {
      this._translations = data || {};
    });
  }

  get(key: string): string {
    const keys = key.split('.');
    let result: unknown = this._translations;

    for (const k of keys) {
      if ((result as Record<string, unknown>)?.[k] === undefined) return key;
      result = (result as Record<string, unknown>)[k];
    }

    return typeof result === 'string' ? result : key;
  }
}
