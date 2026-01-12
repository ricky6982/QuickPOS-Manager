import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { PriceList, PriceListRequest } from '../models';
import { ApiResponse, PaginatedResponse } from '../../models';

@Injectable({
  providedIn: 'root'
})
export class PriceListService {
  private http = inject(HttpClient);
  private readonly apiUrl = '/api/pricelist';

  getAll(page: number = 1, pageSize: number = 10): Observable<PaginatedResponse<PriceList>> {
    return this.http.get<PaginatedResponse<PriceList>>(
      `${this.apiUrl}/paged?page=${page}&pageSize=${pageSize}`
    ).pipe(
      map(response => response),
      catchError(this.handleError)
    );
  }

  getById(id: number): Observable<PriceList> {
    return this.http.get<ApiResponse<PriceList>>(`${this.apiUrl}/${id}`).pipe(
      map(response => {
        if (response.error) {
          throw new Error(response.error.message || 'Error al obtener la lista de precios');
        }
        return response.data;
      }),
      catchError(this.handleError)
    );
  }

  create(request: PriceListRequest): Observable<PriceList> {
    return this.http.post<ApiResponse<PriceList>>(this.apiUrl, request).pipe(
      map(response => {
        if (response.error) {
          throw new Error(response.error.message || 'Error al crear la lista de precios');
        }
        return response.data;
      }),
      catchError(this.handleError)
    );
  }

  update(id: number, request: PriceListRequest): Observable<PriceList> {
    return this.http.put<ApiResponse<PriceList>>(`${this.apiUrl}/${id}`, request).pipe(
      map(response => {
        if (response.error) {
          throw new Error(response.error.message || 'Error al actualizar la lista de precios');
        }
        return response.data;
      }),
      catchError(this.handleError)
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`).pipe(
      map(response => {
        if (response.error) {
          throw new Error(response.error.message || 'Error al eliminar la lista de precios');
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
          errorMessage = apiError.error?.detail || 'Lista de precios no encontrada';
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

