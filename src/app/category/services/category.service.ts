import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Category, CategoryRequest } from '../models';
import { ApiResponse, PaginatedResponse } from '../../models';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private http = inject(HttpClient);
  private readonly apiUrl = '/api/category';

  /**
   * Obtener todas las categorías con paginación
   * @param page - Número de página (empieza en 1)
   * @param pageSize - Cantidad de items por página
   * @returns Observable con la respuesta paginada
   */
  getAll(page: number = 1, pageSize: number = 10): Observable<PaginatedResponse<Category>> {
    return this.http.get<PaginatedResponse<Category>>(
      `${this.apiUrl}/paged?page=${page}&pageSize=${pageSize}`
    ).pipe(
      map(response => {
        return response;
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Obtener una categoría por ID
   * @param id - ID de la categoría
   * @returns Observable con la categoría
   */
  getById(id: string): Observable<Category> {
    return this.http.get<ApiResponse<Category>>(`${this.apiUrl}/${id}`).pipe(
      map(response => {
        if (response.error) {
          throw new Error(response.error.message || 'Error al obtener la categoría');
        }
        return response.data;
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Crear una nueva categoría
   * @param request - Datos de la categoría
   * @returns Observable con la categoría creada
   */
  create(request: CategoryRequest): Observable<Category> {
    return this.http.post<ApiResponse<Category>>(this.apiUrl, request).pipe(
      map(response => {
        if (response.error) {
          throw new Error(response.error.message || 'Error al crear la categoría');
        }
        return response.data;
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Actualizar una categoría existente
   * @param id - ID de la categoría
   * @param request - Datos actualizados de la categoría
   * @returns Observable con la categoría actualizada
   */
  update(id: string, request: CategoryRequest): Observable<Category> {
    return this.http.put<ApiResponse<Category>>(`${this.apiUrl}/${id}`, request).pipe(
      map(response => {
        if (response.error) {
          throw new Error(response.error.message || 'Error al actualizar la categoría');
        }
        return response.data;
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Eliminar una categoría
   * @param id - ID de la categoría
   * @returns Observable con la confirmación
   */
  delete(id: number): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`).pipe(
      map(response => {
        if (response.error) {
          throw new Error(response.error.message || 'Error al eliminar la categoría');
        }
        return response.data;
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Obtener todas las categorías activas
   * @returns Observable con el arreglo de categorías activas
   */
  getActiveCategories(): Observable<Category[]> {
    return this.http.get<ApiResponse<Category[]>>(`${this.apiUrl}/active`).pipe(
      map(response => {
        if (response.error) {
          throw new Error(response.error.message || 'Error al obtener las categorías activas');
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
          errorMessage = apiError.error?.detail || 'Categoría no encontrada';
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

