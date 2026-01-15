import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { User, UserRequest, UserOrganization } from '../models';
import { ApiResponse, PaginatedResponse } from '../../models';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private http = inject(HttpClient);
  private readonly apiUrl = '/api/user';

  getAll(page: number = 1, pageSize: number = 10): Observable<PaginatedResponse<User>> {
    return this.http.get<PaginatedResponse<User>>(
      `${this.apiUrl}/paged?page=${page}&pageSize=${pageSize}`
    ).pipe(
      map(response => response),
      catchError(this.handleError)
    );
  }

  getById(id: string): Observable<User> {
    return this.http.get<ApiResponse<User>>(`${this.apiUrl}/${id}`).pipe(
      map(response => {
        if (response.error) {
          throw new Error(response.error.message || 'Error al obtener el usuario');
        }
        return response.data;
      }),
      catchError(this.handleError)
    );
  }

  update(id: string, request: UserRequest): Observable<User> {
    return this.http.put<ApiResponse<User>>(`${this.apiUrl}/${id}`, request).pipe(
      map(response => {
        if (response.error) {
          throw new Error(response.error.message || 'Error al actualizar el usuario');
        }
        return response.data;
      }),
      catchError(this.handleError)
    );
  }

  delete(id: string): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`).pipe(
      map(response => {
        if (response.error) {
          throw new Error(response.error.message || 'Error al eliminar el usuario');
        }
        return response.data;
      }),
      catchError(this.handleError)
    );
  }

  getUserOrganizations(userId: string): Observable<UserOrganization[]> {
    return this.http.get<ApiResponse<UserOrganization[]>>(`${this.apiUrl}/${userId}/organizations`).pipe(
      map(response => {
        if (response.error) {
          throw new Error(response.error.message || 'Error al obtener las organizaciones del usuario');
        }
        return response.data;
      }),
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Ha ocurrido un error desconocido';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      const apiError = error.error as ApiResponse<any>;
      switch (error.status) {
        case 400:
          errorMessage = apiError.error?.detail || 'Datos inválidos';
          break;
        case 401:
          errorMessage = apiError.error?.detail || 'No autorizado';
          break;
        case 403:
          errorMessage = 'Acceso denegado';
          break;
        case 404:
          errorMessage = apiError.error?.detail || 'Usuario no encontrado';
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

