import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _token = signal<string | null>(null);
  private _username = signal<string>('');

  async login(username: string, password: string) {
    // Simple fake auth: accept any non-empty username/password
    await new Promise(r => setTimeout(r, 500));
    if (username && password) {
      this._token.set('demo-token');
      this._username.set(username);
      return true;
    }
    return false;
  }

  logout() {
    this._token.set(null);
    this._username.set('');
  }

  isAuthenticated() {
    return !!this._token();
  }

  getUsername() {
    return this._username();
  }
}

