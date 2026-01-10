import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Product, ProductRequest } from '../models';
import { ApiResponse, PaginatedResponse } from '../../models';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private http = inject(HttpClient);
  private readonly apiUrl = '/api/product';

  getAll(page: number = 1, pageSize: number = 10): Observable<PaginatedResponse<Product>> {
    return this.http.get<PaginatedResponse<Product>>(
      `${this.apiUrl}/paged?page=${page}&pageSize=${pageSize}`
    ).pipe(
      map(response => response),
      catchError(this.handleError)
    );
  }

  getById(id: string): Observable<Product> {
    return this.http.get<ApiResponse<Product>>(`${this.apiUrl}/${id}`).pipe(
      map(response => {
        if (response.error) {
          throw new Error(response.error.message || 'Error al obtener el producto');
        }
        return response.data;
      }),
      catchError(this.handleError)
    );
  }

  create(request: ProductRequest): Observable<Product> {
    return this.http.post<ApiResponse<Product>>(this.apiUrl, request).pipe(
      map(response => {
        if (response.error) {
          throw new Error(response.error.message || 'Error al crear el producto');
        }
        return response.data;
      }),
      catchError(this.handleError)
    );
  }

  update(id: string, request: ProductRequest): Observable<Product> {
    return this.http.put<ApiResponse<Product>>(`${this.apiUrl}/${id}`, request).pipe(
      map(response => {
        if (response.error) {
          throw new Error(response.error.message || 'Error al actualizar el producto');
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
          throw new Error(response.error.message || 'Error al eliminar el producto');
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
          errorMessage = apiError.error?.detail || 'Producto no encontrado';
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

