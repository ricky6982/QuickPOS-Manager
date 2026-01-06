/**
 * Interfaz genérica para las respuestas de la API
 * Utilizada para estandarizar la estructura de respuesta de todos los servicios
 */
export interface ApiResponse<T> {
  data: T;
  error: any;
}

