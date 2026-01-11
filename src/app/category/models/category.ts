/**
 * Interface para el modelo de Categoría
 */
export interface Category {
  id: number;
  name: string;
  parentName?: string;
  description?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}


