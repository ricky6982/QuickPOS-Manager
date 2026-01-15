export interface UserOrganization {
  organizationId: string;
  organizationName: string;
  role: string;
  permissions: string[];
  isActive: boolean;
  joinedAt?: string;
}

