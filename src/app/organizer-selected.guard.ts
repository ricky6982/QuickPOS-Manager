import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { OrganizerStateService } from './organizer/services/organizer-state.service';

/**
 * Guard que verifica si hay un organizador seleccionado antes de permitir acceso.
 * Solo aplica para usuarios admin. Los usuarios normales siempre tienen organizationId en su JWT.
 */
export const organizerSelectedGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const organizerState = inject(OrganizerStateService);
  const router = inject(Router);

  const user = auth.getCurrentUser();

  // Si es admin, verificar que haya organizador seleccionado
  if (user?.isGlobalAdmin) {
    const selectedOrganizer = organizerState.getSelectedOrganizer();
    if (!selectedOrganizer) {
      // Redirigir a organizers si no hay organizador seleccionado
      router.navigate(['/organizers']);
      return false;
    }
  }

  // Usuario normal o admin con organizador seleccionado
  return true;
};
