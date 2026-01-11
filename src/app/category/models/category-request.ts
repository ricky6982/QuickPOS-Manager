/**
 * Interface para crear o actualizar una categoría
 */
export interface CategoryRequest {
  id: string | null;
  organizerId: string | null;
  parentId?: string | null;
  name: string;
  description: string;
  isActive: boolean;
}

