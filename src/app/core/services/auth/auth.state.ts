import { Injectable, computed, signal } from '@angular/core';

const TOKEN_KEY = 'auth_token';
const ROLE_KEY  = 'auth_role';

@Injectable({ providedIn: 'root' })
export class AuthStateService {

  private readonly _token = signal<string | null>(localStorage.getItem(TOKEN_KEY));
  private readonly _role  = signal<string | null>(localStorage.getItem(ROLE_KEY));

  readonly isAuthenticated = computed(() => this._token() !== null);
  readonly userRole        = computed(() => this._role());

  setSession(token: string, role: string): void {
    this._token.set(token);
    this._role.set(role);
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(ROLE_KEY, role);
  }

  clearSession(): void {
    this._token.set(null);
    this._role.set(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ROLE_KEY);
  }

  getToken(): string | null {
    return this._token();
  }
}
