import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Organizer, OrganizerRequest, PaginatedResponse } from '../models';
import { ApiResponse } from '../../models';

@Injectable({
  providedIn: 'root'
})
export class OrganizerService {
  private http = inject(HttpClient);
  private readonly apiUrl = '/api/organizer';

  getAll(page: number = 1, pageSize: number = 20): Observable<PaginatedResponse<Organizer>> {
    return this.http.get<PaginatedResponse<Organizer>>(
      `${this.apiUrl}/paged?page=${page}&pageSize=${pageSize}`
    ).pipe(
      map(response => response),
      catchError(this.handleError)
    );
  }

  getById(id: string): Observable<Organizer> {
    return this.http.get<ApiResponse<Organizer>>(`${this.apiUrl}/${id}`).pipe(
      map(response => {
        if (response.error) {
          throw new Error(response.error.message || 'Error al obtener el organizador');
        }
        return response.data;
      }),
      catchError(this.handleError)
    );
  }

  create(request: OrganizerRequest): Observable<Organizer> {
    return this.http.post<ApiResponse<Organizer>>(this.apiUrl, request).pipe(
      map(response => {
        if (response.error) {
          throw new Error(response.error.message || 'Error al crear el organizador');
        }
        return response.data;
      }),
      catchError(this.handleError)
    );
  }

  update(id: string, request: OrganizerRequest): Observable<Organizer> {
    return this.http.put<ApiResponse<Organizer>>(`${this.apiUrl}/${id}`, request).pipe(
      map(response => {
        if (response.error) {
          throw new Error(response.error.message || 'Error al actualizar el organizador');
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
          throw new Error(response.error.message || 'Error al eliminar el organizador');
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
          errorMessage = apiError.error?.detail || 'Organizador no encontrado';
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
