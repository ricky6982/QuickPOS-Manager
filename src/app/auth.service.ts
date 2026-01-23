import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import {
  LoginRequest,
  LoginResponse,
  SelectOrganizationRequest,
  SelectOrganizationResponse,
  SwitchOrganizationRequest,
  AuthenticatedUser,
  UserOrganizationOption
} from './models/auth.models';
import { ApiResponse } from './models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private readonly API_URL = '/api/auth';
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'auth_user';
  private readonly ORGS_KEY = 'pending_organizations';

  private currentUserSubject = signal<AuthenticatedUser | null>(this.getStoredUser());

  constructor() {
    // Inicializar desde localStorage
    this.initializeFromStorage();
  }

  private initializeFromStorage(): void {
    const token = localStorage.getItem(this.TOKEN_KEY);
    const userStr = localStorage.getItem(this.USER_KEY);

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        this.currentUserSubject.set(user);
      } catch (error) {
        console.error('Error parsing stored user:', error);
        this.logout();
      }
    }
  }

  // Paso 1: Login inicial
  login(credentials: LoginRequest): Observable<ApiResponse<LoginResponse>> {
    return this.http.post<ApiResponse<LoginResponse>>(`${this.API_URL}/login`, credentials)
      .pipe(
        tap(response => {
          if (response.data) {
            this.setToken(response.data.token);
            this.setUser(response.data.user);
            this.currentUserSubject.set(response.data.user);
            if (response.data.organizations) {
              localStorage.setItem(this.ORGS_KEY, JSON.stringify(response.data.organizations));
            }
          }
        })
      );
  }

  // Paso 2: Seleccionar organización
  selectOrganization(request: SelectOrganizationRequest): Observable<ApiResponse<SelectOrganizationResponse>> {
    return this.http.post<ApiResponse<SelectOrganizationResponse>>(
      `${this.API_URL}/select-organization`,
      request
    ).pipe(
      tap(response => {
        if (response.data) {
          this.setToken(response.data.token);
          this.setUser(response.data.user);
          this.currentUserSubject.set(response.data.user);
          // Limpiar organizaciones pendientes
          localStorage.removeItem(this.ORGS_KEY);
        }
      })
    );
  }

  // Cambiar de organización
  switchOrganization(request: SwitchOrganizationRequest): Observable<ApiResponse<SelectOrganizationResponse>> {
    return this.http.post<ApiResponse<SelectOrganizationResponse>>(
      `${this.API_URL}/switch-organization`,
      request
    ).pipe(
      tap(response => {
        if (response.data) {
          this.setToken(response.data.token);
          this.setUser(response.data.user);
          this.currentUserSubject.set(response.data.user);
        }
      })
    );
  }

  // Obtener organizaciones pendientes de selección
  getPendingOrganizations(): UserOrganizationOption[] | null {
    const orgsStr = localStorage.getItem(this.ORGS_KEY);
    return orgsStr ? JSON.parse(orgsStr) : null;
  }

  // Logout
  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem(this.ORGS_KEY);
    this.currentUserSubject.set(null);
  }

  // Helpers
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  hasOrganization(): boolean {
    const user = this.currentUserSubject();
    return user?.isGlobalAdmin === true || !!user?.organizationId;
  }

  getCurrentUser(): AuthenticatedUser | null {
    return this.currentUserSubject();
  }

  getUsername(): string {
    return this.currentUserSubject()?.username || '';
  }

  hasPermission(permission: string): boolean {
    const user = this.currentUserSubject();
    if (user?.isGlobalAdmin) return true;
    return user?.permissions?.includes(permission) || false;
  }

  hasRole(role: string): boolean {
    const user = this.currentUserSubject();
    if (user?.isGlobalAdmin) return true;
    return user?.roles?.includes(role) || false;
  }

  private setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  private setUser(user: AuthenticatedUser): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  private getStoredUser(): AuthenticatedUser | null {
    const userStr = localStorage.getItem(this.USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  }
}

