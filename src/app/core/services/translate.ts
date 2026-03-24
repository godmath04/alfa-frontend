import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Translate {
  private _translations: Record<string, string> = {};

  constructor(private http: HttpClient) {}

  load(): Promise<void> {
    return lastValueFrom(this.http.get<Record<string, string>>('/i18n/es.json')).then((data) => {
      this._translations = data || {};
    });
  }

  get(key: string): string {
    return this._translations[key] || key;
  }
}
