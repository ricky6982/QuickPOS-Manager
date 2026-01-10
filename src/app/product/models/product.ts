export interface Product {
  id: string;
  name: string;
  description: string | null;
  sku: string | null;
  barcode: string | null;
  categoryId: string | null;
  categoryName?: string;
  organizerId: string | null;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}
