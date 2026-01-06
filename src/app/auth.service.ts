import { Injectable, signal, inject } from '@angular/core';
import { LoginService } from './login/services/login.service';
import { lastValueFrom } from 'rxjs';
import { LoginResponse } from './login/models/login.response';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private loginService = inject(LoginService);

  private _token = signal<string | null>(null);
  private _username = signal<string>('');
  private _initialized = false;

  constructor() {
    // Inicializar tokens desde localStorage al crear el servicio
    this.initializeFromStorage();
  }

  private initializeFromStorage(): void {
    const token = localStorage.getItem('auth_token');
    if (token) {
      this._token.set(token);
      const username = localStorage.getItem('username') || '';
      this._username.set(username);
    }
    this._initialized = true;
  }

  async login(username: string, password: string): Promise<boolean> {
    try {
      // Hacer petición POST a /api/auth/login
      const response: LoginResponse = await lastValueFrom(
        this.loginService.login(username, password)
      );

      // Verificar si el login fue exitoso
      if (response.token || response.accessToken) {
        const token = response.token || response.accessToken;
        this._token.set(token!);

        // Guardar el username (del response o usar el ingresado)
        const user = response.user?.username || response.user?.name || username;
        this._username.set(user);

        // Opcional: guardar token en localStorage para persistencia
        localStorage.setItem('auth_token', token!);
        localStorage.setItem('username', user);

        return true;
      }

      return false;
    } catch (error) {
      console.error('Error en login:', error);
      // Propagar el error para que el componente pueda mostrarlo
      throw error;
    }
  }

  logout() {
    this._token.set(null);
    this._username.set('');

    // Limpiar localStorage
    localStorage.removeItem('auth_token');
    localStorage.removeItem('username');
  }

  isAuthenticated(): boolean {
    // Solo leer el estado de los signals, sin modificarlos
    // La inicialización se hace en el constructor
    return this._token() !== null;
  }

  getUsername(): string {
    return this._username();
  }

  getToken(): string | null {
    return this._token();
  }
}

