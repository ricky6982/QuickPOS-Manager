import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class OrganizerStateService {
  private readonly STORAGE_KEY = 'selectedOrganizerId';

  // Signal para el organizador seleccionado
  private _selectedOrganizerId = signal<string | null>(this.getFromStorage());

  // Getter público para el signal (readonly)
  get selectedOrganizerId() {
    return this._selectedOrganizerId.asReadonly();
  }

  /**
   * Establece el organizador seleccionado
   */
  setSelectedOrganizer(organizerId: string | null) {
    this._selectedOrganizerId.set(organizerId);
    if (organizerId) {
      localStorage.setItem(this.STORAGE_KEY, organizerId);
    } else {
      localStorage.removeItem(this.STORAGE_KEY);
    }
  }

  /**
   * Obtiene el organizador seleccionado actual
   */
  getSelectedOrganizer(): string | null {
    return this._selectedOrganizerId();
  }

  /**
   * Obtiene el organizador desde localStorage
   */
  private getFromStorage(): string | null {
    return localStorage.getItem(this.STORAGE_KEY);
  }

  /**
   * Limpia el organizador seleccionado
   */
  clearSelectedOrganizer() {
    this._selectedOrganizerId.set(null);
    localStorage.removeItem(this.STORAGE_KEY);
  }
}

