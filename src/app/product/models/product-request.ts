export interface ProductRequest {
  id: string | null;
  name: string;
  description: string | null;
  sku: string | null;
  barcode: string | null;
  categoryId: string | null;
  organizerId: string | null;
  isActive: boolean;
}

