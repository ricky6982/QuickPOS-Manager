export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string | null;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}
