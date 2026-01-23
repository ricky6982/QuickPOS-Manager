export enum StaffStatus {
  Active,
  Suspended
}

export function getStaffStatusLabel(status: StaffStatus): string {
  switch (status) {
    case StaffStatus.Active:
      return 'Activo';
    case StaffStatus.Suspended:
      return 'Suspendido';
    default:
      return 'Desconocido';
  }
}

export function getStaffStatusColor(status: StaffStatus): string {
  switch (status) {
    case StaffStatus.Active:
      return 'primary';
    case StaffStatus.Suspended:
      return 'warn';
    default:
      return 'accent';
  }
}
