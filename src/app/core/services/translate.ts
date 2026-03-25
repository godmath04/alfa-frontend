import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Translate {

  private _translations: Record<string, any> = {};

  constructor(private http: HttpClient) {}

  load(): Promise<void> {
    return lastValueFrom(
      this.http.get<Record<string, any>>('/i18n/es.json')
    ).then(data => {
      this._translations = data || {};
    });
  }

  get(key: string): string {
    const keys = key.split('.');
    let result: any = this._translations;

    for (const k of keys) {
      if (result?.[k] === undefined) return key;
      result = result[k];
    }

    return typeof result === 'string' ? result : key;
  }
}