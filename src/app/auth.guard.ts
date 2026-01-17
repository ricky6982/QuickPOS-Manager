import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isAuthenticated()) {
    router.navigate(['/login']);
    return false;
  }

  // Validar que tenga organización seleccionada (excepto admin)
  if (!auth.hasOrganization() && !auth.getCurrentUser()?.isGlobalAdmin) {
    router.navigate(['/select-organization']);
    return false;
  }

  return true;
};



