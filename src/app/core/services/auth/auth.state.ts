import { Injectable, computed, inject, signal } from '@angular/core';
import { StorageService } from '../storage.service';

const TOKEN_KEY = 'auth_token';
const ROLE_KEY  = 'auth_role';

@Injectable({ providedIn: 'root' })
export class AuthStateService {

  private readonly _storage = inject(StorageService);

  private readonly _token = signal<string | null>(this._storage.get(TOKEN_KEY));
  private readonly _role  = signal<string | null>(this._storage.get(ROLE_KEY));

  readonly isAuthenticated = computed(() => this._token() !== null);
  readonly userRole        = computed(() => this._role());

  setSession(token: string, role: string): void {
    this._token.set(token);
    this._role.set(role);
    this._storage.set(TOKEN_KEY, token);
    this._storage.set(ROLE_KEY, role);
  }

  clearSession(): void {
    this._token.set(null);
    this._role.set(null);
    this._storage.remove(TOKEN_KEY);
    this._storage.remove(ROLE_KEY);
  }

  getToken(): string | null {
    return this._token();
  }
}
