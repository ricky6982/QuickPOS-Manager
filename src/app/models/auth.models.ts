/**
 * Modelos para el nuevo flujo de autenticación multi-tenant
 */

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  organizations?: UserOrganizationOption[]; // Solo para usuarios normales
  user: AuthenticatedUser;
}

export interface UserOrganizationOption {
  id: number;
  name: string;
  roles: string[];
}

export interface SelectOrganizationRequest {
  organizationId: number;
}

export interface SelectOrganizationResponse {
  token: string;
  user: AuthenticatedUser;
}

export interface AuthenticatedUser {
  username: string;
  email: string;
  fullName?: string;
  isGlobalAdmin: boolean;
  organizationId?: number;
  organizationName?: string;
  roles: string[];
  permissions: string[];
}

export interface SwitchOrganizationRequest {
  organizationId: number;
}
