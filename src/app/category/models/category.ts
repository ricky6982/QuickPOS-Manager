/**
 * Interface para el modelo de Categoría
 */
export interface Category {
  id: number;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}


