import { StaffStatus } from './staff-status';

export interface StaffRequest {
  id?: string;
  userId: string;
  roleIds: string[];
  permissions?: string[] | null;
}
