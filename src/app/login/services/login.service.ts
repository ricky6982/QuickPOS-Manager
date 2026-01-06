import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { LoginRequest, LoginResponse } from '../models';
import { ApiResponse } from '../../models';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private http = inject(HttpClient);
  private readonly apiUrl = '/api'; // El proxy redirigirá a http://localhost:7087/api

  /**
   * Realizar login con username y password
   * @param username - Nombre de usuario
   * @param password - Contraseña
   * @returns Observable con la respuesta del servidor
   */
  login(username: string, password: string): Observable<LoginResponse> {
    const loginData: LoginRequest = {
      username,
      password
    };
    return this.http.post<ApiResponse<LoginResponse>>(`${this.apiUrl}/auth/login`, loginData)
      .pipe(
        map(response => {
          // Extraer el LoginResponse del objeto data
          if (response.error) {
            throw new Error(response.error.message || 'Error en la respuesta');
          }
          return response.data;
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Realizar login usando un objeto LoginRequest
   * @param credentials - Objeto con username y password
   * @returns Observable con la respuesta del servidor
   */
  loginWithCredentials(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<ApiResponse<LoginResponse>>(`${this.apiUrl}/auth/login`, credentials)
      .pipe(
        map(response => {
          // Extraer el LoginResponse del objeto data
          if (response.error) {
            throw new Error(response.error.message || 'Error en la respuesta');
          }
          return response.data;
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Manejo de errores HTTP
   * @param error - Error HTTP
   * @returns Observable con el error
   */

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Ha ocurrido un error desconocido';
    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Error del lado del servidor
      const apiError = error.error as ApiResponse<LoginResponse>;
      switch (error.status) {
        case 400:
          errorMessage = apiError.error?.detail || 'Datos de inicio de sesión inválidos';
          break;
        case 401:
          errorMessage = apiError.error?.detail || 'Usuario o contraseña incorrectos';
          break;
        case 403:
          errorMessage = 'Acceso denegado';
          break;
        case 404:
          errorMessage = 'Servicio no encontrado';
          break;
        case 500:
          errorMessage = apiError.error?.detail || 'Error en el servidor. Intenta más tarde';
          break;
        default:
          errorMessage = apiError.error?.detail || `Error del servidor: ${error.status}`;
      }
    }

    return throwError(() => new Error(errorMessage));
  }
}

