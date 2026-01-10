import { Component, signal, computed, OnInit, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDividerModule } from '@angular/material/divider';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { AuthService } from '../auth.service';
import { OrganizerStateService } from '../organizer/services/organizer-state.service';
import { ApiResponse } from '../models';

interface Organizer {
  id: string;
  name: string;
}

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatSidenavModule,
    MatToolbarModule,
    MatIconModule,
    MatListModule,
    MatButtonModule,
    MatMenuModule,
    MatSelectModule,
    MatFormFieldModule,
    MatDividerModule,
    ReactiveFormsModule,
    NgxMatSelectSearchModule
  ],
  templateUrl: './auth-layout.component.html',
  styleUrls: ['./auth-layout.component.css']
})
export class AuthLayoutComponent implements OnInit {
  private http = inject(HttpClient);
  private router = inject(Router);
  private auth = inject(AuthService);
  private organizerStateService = inject(OrganizerStateService);

  protected readonly title = signal('QuickPOS Manager');
  protected readonly username = computed(() => this.auth.getUsername());
  protected organizers = signal<Organizer[]>([]);
  protected selectedOrganizer = signal<string | null>(null);

  // Control para el buscador y signal para el valor de búsqueda
  protected organizerSearchCtrl = new FormControl('');
  protected searchTerm = signal<string>('');

  // Computed para saber si mostrar el buscador
  protected showSearch = computed(() => {
    const orgs = this.organizers();
    return orgs && orgs.length > 10;
  });

  // Computed para organizadores filtrados
  protected filteredOrganizers = computed(() => {
    const search = this.searchTerm().toLowerCase();
    const orgs = this.organizers();

    if (!search || !orgs) {
      return orgs;
    }

    return orgs.filter(org =>
      org.name.toLowerCase().includes(search)
    );
  });

  constructor() {
    // Effect para sincronizar el selectedOrganizer con el servicio de estado
    effect(() => {
      const selected = this.selectedOrganizer();
      if (selected !== null) {
        this.organizerStateService.setSelectedOrganizer(selected);
      }
    });
  }

  ngOnInit() {
    // Recuperar el organizador desde el servicio de estado
    const savedOrganizer = this.organizerStateService.getSelectedOrganizer();
    if (savedOrganizer) {
      this.selectedOrganizer.set(savedOrganizer);
    }

    this.loadOrganizers();

    // Sincronizar el FormControl con el signal
    this.organizerSearchCtrl.valueChanges.subscribe(value => {
      this.searchTerm.set(value || '');
    });
  }

  loadOrganizers() {
    this.http.get<ApiResponse<Organizer[]>>('/api/organizer/active').subscribe({
      next: (response) => {
        this.organizers.set(response.data);
        // Si no hay organizador seleccionado, seleccionar el primero
        const current = this.selectedOrganizer();
        if (response.data && response.data.length > 0 && !current) {
          const firstOrg = response.data[0].id;
          this.selectedOrganizer.set(firstOrg);
          this.organizerStateService.setSelectedOrganizer(firstOrg);
        }
      },
      error: (error) => {
        console.error('Error al cargar organizadores', error);
      }
    });
  }

  onOrganizerChange(organizerId: string | null) {
    const previousOrganizer = this.selectedOrganizer();
    this.selectedOrganizer.set(organizerId);

    if (previousOrganizer !== null && previousOrganizer !== organizerId) {
      window.location.reload();
    }
  }

  async logout() {
    this.auth.logout();
    this.organizerStateService.clearSelectedOrganizer();
    await this.router.navigate(['/']);
  }
}

