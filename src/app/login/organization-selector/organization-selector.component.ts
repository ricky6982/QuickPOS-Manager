import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../auth.service';
import { UserOrganizationOption } from '../../models';

@Component({
  selector: 'app-organization-selector',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatIconModule
  ],
  templateUrl: './organization-selector.component.html',
  styleUrls: ['./organization-selector.component.css']
})
export class OrganizationSelectorComponent implements OnInit {
  private auth = inject(AuthService);
  private router = inject(Router);

  organizations = signal<UserOrganizationOption[]>([]);
  loading = signal(false);
  selectedOrg = signal<UserOrganizationOption | null>(null);
  error = signal<string | null>(null);

  ngOnInit(): void {
    console.log('OrganizationSelectorComponent - ngOnInit');

    // Obtener organizaciones del state o del localStorage
    const navigation = history.state;
    console.log('Navigation state:', navigation);

    if (navigation?.organizations) {
      console.log('Organizaciones desde navigation state:', navigation.organizations);
      this.organizations.set(navigation.organizations);
    } else {
      // Intentar recuperar de localStorage
      const pending = this.auth.getPendingOrganizations();
      console.log('Organizaciones desde localStorage:', pending);

      if (pending) {
        this.organizations.set(pending);
      } else {
        console.warn('No se encontraron organizaciones, redirigiendo a login');
        // Si no hay organizaciones, redirigir al login
        this.router.navigate(['/login']);
      }
    }

    console.log('Organizaciones cargadas:', this.organizations());
  }

  selectOrganization(org: UserOrganizationOption): void {
    this.selectedOrg.set(org);
    this.loading.set(true);
    this.error.set(null);

    this.auth.selectOrganization({ organizationId: org.id })
      .subscribe({
        next: (response) => {
          if (response.data) {
            this.router.navigate(['/']);
          } else if (response.error) {
            this.error.set(response.error?.message || 'Error al seleccionar organización');
            this.loading.set(false);
          }
        },
        error: (err) => {
          this.loading.set(false);
          this.error.set(err?.error?.message || 'Error al seleccionar organización');
        }
      });
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
