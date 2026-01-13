import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { OrganizerStateService } from '../organizer/services/organizer-state.service';

/**
 * Interceptor que agrega automáticamente el header X-Organizer-Id
 * a todas las peticiones HTTP basándose en el organizador seleccionado
 */
export const organizerInterceptor: HttpInterceptorFn = (req, next) => {
  const organizerState = inject(OrganizerStateService);
  const organizerId = organizerState.getSelectedOrganizer();

  // Si hay un organizador seleccionado, agregar el header
  if (organizerId) {
    const clonedRequest = req.clone({
      setHeaders: {
        'X-Organizer-Id': organizerId
      }
    });
    return next(clonedRequest);
  }

  // Si no hay organizador seleccionado, continuar sin modificar
  return next(req);
};

