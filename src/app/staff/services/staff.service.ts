import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Staff, StaffRequest } from '../models';
import { ApiResponse, PaginatedResponse } from '../../models';

@Injectable({
  providedIn: 'root'
})
export class StaffService {
  private http = inject(HttpClient);
  private readonly apiUrl = '/api/staff';

  /**
   * Obtener todo el personal con paginación
   */
  getAll(page: number = 1, pageSize: number = 10): Observable<PaginatedResponse<Staff>> {
    return this.http.get<PaginatedResponse<Staff>>(
      `${this.apiUrl}/paged?page=${page}&pageSize=${pageSize}`
    ).pipe(
      map(response => response),
      catchError(this.handleError)
    );
  }

  /**
   * Obtener un miembro del personal por ID
   */
  getByEmail(email: string): Observable<Staff> {
    return this.http.get<ApiResponse<Staff>>(`${this.apiUrl}/by-email/${email}`).pipe(
      map(response => {
        if (response.error) {
          throw new Error(response.error.message || 'Error al obtener el personal');
        }
        return response.data;
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Crear un nuevo miembro del personal
   */
  create(request: StaffRequest): Observable<Staff> {
    return this.http.post<ApiResponse<Staff>>(`${this.apiUrl}`, request).pipe(
      map(response => {
        if (response.error) {
          throw new Error(response.error.message || 'Error al crear el personal');
        }
        return response.data;
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Actualizar información del personal (status, roles, permisos)
   */
  update(id: string, request: StaffRequest): Observable<Staff> {
    return this.http.put<ApiResponse<Staff>>(`${this.apiUrl}/${id}`, request).pipe(
      map(response => {
        if (response.error) {
          throw new Error(response.error.message || 'Error al actualizar el personal');
        }
        return response.data;
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Activar un miembro del personal
   */
  activate(id: string): Observable<Staff> {
    return this.http.post<ApiResponse<Staff>>(`${this.apiUrl}/${id}/unlock`, {}).pipe(
      map(response => {
        if (response.error) {
          throw new Error(response.error.message || 'Error al activar el personal');
        }
        return response.data;
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Suspender un miembro del personal
   */
  suspend(id: string): Observable<Staff> {
    return this.http.post<ApiResponse<Staff>>(`${this.apiUrl}/${id}/lock`, {}).pipe(
      map(response => {
        if (response.error) {
          throw new Error(response.error.message || 'Error al suspender el personal');
        }
        return response.data;
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Obtener lista de roles disponibles
   */
  getAvailableRoles(): Observable<string[]> {
    return this.http.get<ApiResponse<string[]>>(`${this.apiUrl}/roles`).pipe(
      map(response => {
        if (response.error) {
          throw new Error(response.error.message || 'Error al obtener roles');
        }
        return response.data;
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Obtener lista de permisos disponibles
   */
  getAvailablePermissions(): Observable<string[]> {
    return this.http.get<ApiResponse<string[]>>(`${this.apiUrl}/permissions`).pipe(
      map(response => {
        if (response.error) {
          throw new Error(response.error.message || 'Error al obtener permisos');
        }
        return response.data;
      }),
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('Error en StaffService:', error);
    const message = error.error?.message || error.message || 'Error desconocido';
    return throwError(() => new Error(message));
  }
}
