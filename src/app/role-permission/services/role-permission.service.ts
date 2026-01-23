import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Role } from '../models/role';
import { ApiResponse } from '../../models';

@Injectable({
  providedIn: 'root'
})
export class RolePermissionService {
  private http = inject(HttpClient);
  private readonly apiUrl = '/api/rolepermission';

  /**
   * Obtener todos los roles
   */
  getAll(): Observable<Role[]> {
    return this.http.get<ApiResponse<Role[]>>(
      `${this.apiUrl}`
    ).pipe(
      map(response => response.data),
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('Error en StaffService:', error);
    const message = error.error?.message || error.message || 'Error desconocido';
    return throwError(() => new Error(message));
  }
}
