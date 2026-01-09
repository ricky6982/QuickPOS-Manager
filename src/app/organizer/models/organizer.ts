export interface Organizer {
  id: string;
  name: string;
  taxId: string | null;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}
