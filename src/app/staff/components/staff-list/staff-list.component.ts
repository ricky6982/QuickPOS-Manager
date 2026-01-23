import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { StaffService } from '../../services/staff.service';
import { Staff, StaffStatus, getStaffStatusLabel, getStaffStatusColor } from '../../models';
import { AddStaffModalComponent } from '../add-staff-modal/add-staff-modal.component';
import { RolePermissionService } from '../../../role-permission/services/role-permission.service';
import { Role } from '../../../role-permission/models/role';

@Component({
  selector: 'app-staff-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatDialogModule,
    PaginationComponent
  ],
  templateUrl: './staff-list.component.html',
  styleUrls: ['./staff-list.component.css']
})
export class StaffListComponent implements OnInit {
  private staffService = inject(StaffService);
  private rolePermissionService = inject(RolePermissionService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  protected staff = signal<Staff[]>([]);
  protected loading = signal(false);
  protected currentPage = signal(1);
  protected pageSize = signal(10);
  protected totalItems = signal(0);
  protected availableRoles = signal<Role[]>([]);

  displayedColumns: string[] = ['lastName', 'firstName', 'email', 'roles', 'status', 'actions'];

  ngOnInit() {
    this.loadStaff();
    this.loadRoles();
  }

  loadRoles() {
    this.rolePermissionService.getAll().subscribe({
      next: (roles) => {
        this.availableRoles.set(roles);
      },
      error: (error) => {
        console.error('Error loading roles:', error);
        this.snackBar.open('Error al cargar los roles', 'Cerrar', {
          duration: 3000
        });
      }
    });
  }

  loadStaff() {
    this.loading.set(true);
    this.staffService.getAll(this.currentPage(), this.pageSize()).subscribe({
      next: (response) => {
        this.staff.set(response.items);
        this.totalItems.set(response.totalItems);
        this.loading.set(false);
      },
      error: (error) => {
        this.snackBar.open(error.message || 'Error al cargar el personal', 'Cerrar', {
          duration: 3000
        });
        this.loading.set(false);
      }
    });
  }

  onPageChange(page: number) {
    this.currentPage.set(page);
    this.loadStaff();
  }

  onPageSizeChange(pageSize: number) {
    this.pageSize.set(pageSize);
    this.currentPage.set(1);
    this.loadStaff();
  }

  editStaff(staff: Staff) {
    const dialogRef = this.dialog.open(AddStaffModalComponent, {
      width: '600px',
      disableClose: false,
      data: {
        availableRoles: this.availableRoles(),
        staffToEdit: staff,
        isEditMode: true
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadStaff();
      }
    });
  }

  toggleStatus(staff: Staff) {
    const isActive = staff.status === StaffStatus.Active;
    const action = isActive ? 'suspender' : 'activar';
    const confirmMessage = `¿Estás seguro de ${action} a ${staff.firstName} ${staff.lastName}?`;

    if (!confirm(confirmMessage)) {
      return;
    }

    this.loading.set(true);
    const observable = isActive
      ? this.staffService.suspend(staff.userId)
      : this.staffService.activate(staff.userId);

    observable.subscribe({
      next: () => {
        this.snackBar.open(
          `Personal ${isActive ? 'suspendido' : 'activado'} exitosamente`,
          'Cerrar',
          { duration: 3000 }
        );
        this.loadStaff();
      },
      error: (error) => {
        this.snackBar.open(
          error.message || `Error al ${action} el personal`,
          'Cerrar',
          { duration: 3000 }
        );
        this.loading.set(false);
      }
    });
  }

  getStatusLabel(status: StaffStatus): string {
    return getStaffStatusLabel(status);
  }

  getStatusColor(status: StaffStatus): string {
    return getStaffStatusColor(status);
  }

  openAddStaffModal() {
    const dialogRef = this.dialog.open(AddStaffModalComponent, {
      width: '600px',
      disableClose: false,
      data: {
        availableRoles: this.availableRoles()
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadStaff();
      }
    });
  }
}
