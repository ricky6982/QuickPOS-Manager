import { StaffStatus } from './staff-status';

export interface Staff {
  userId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phoneNumber: string | null;
  roles: string;
  status: StaffStatus;
}

