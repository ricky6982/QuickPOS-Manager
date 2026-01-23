import { Component, OnInit, inject, signal, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { StaffService } from '../../services/staff.service';
import { Staff } from '../../models';
import { Role } from '../../../role-permission/models/role';

interface DialogData {
  availableRoles: Role[];
  staffToEdit?: Staff;
  isEditMode?: boolean;
}

@Component({
  selector: 'app-add-staff-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatSnackBarModule
  ],
  templateUrl: './add-staff-modal.component.html',
  styleUrls: ['./add-staff-modal.component.css']
})
export class AddStaffModalComponent implements OnInit {
  private staffService = inject(StaffService);
  private dialogRef = inject(MatDialogRef<AddStaffModalComponent>);
  private snackBar = inject(MatSnackBar);

  protected searchValue = '';
  protected staffUserFound = signal<Staff | null>(null);
  protected userNotFound = signal(false);
  protected isSearching = signal(false);
  protected isSaving = signal(false);
  protected availableRoles = signal<Role[]>([]);
  protected selectedRoles: string[] = [];
  protected isEditMode = signal(false);

  constructor(@Inject(MAT_DIALOG_DATA) public data: DialogData) {
    if (data && data.availableRoles) {
      this.availableRoles.set(data.availableRoles);
    }

    // Si viene un staff para editar, cargarlo
    if (data && data.staffToEdit) {
      this.isEditMode.set(true);
      this.staffUserFound.set(data.staffToEdit);
      // Parsear roles del string "Admin, Vendedor" a array de IDs
      this.parseAndSelectRoles(data.staffToEdit.roles);
    }
  }

  ngOnInit(): void {
    // Ya no necesitamos cargar roles aquí, vienen desde el componente padre
  }

  /**
   * Parsea el string de roles "Admin, Vendedor" y selecciona los roles correspondientes
   */
  parseAndSelectRoles(rolesString: string): void {
    if (!rolesString) {
      this.selectedRoles = [];
      return;
    }

    // Separar por comas y limpiar espacios
    const roleNames = rolesString.split(',').map(r => r.trim());
    const availableRoles = this.availableRoles();

    // Encontrar los IDs de los roles que coincidan con los nombres
    this.selectedRoles = availableRoles
      .filter(role => roleNames.includes(role.name))
      .map(role => role.id);
  }

  searchUser(): void {
    const value = this.searchValue.trim();
    if (!value) return;

    this.isSearching.set(true);
    this.staffUserFound.set(null);
    this.userNotFound.set(false);
    this.selectedRoles = [];

    this.staffService.getByEmail(value).subscribe({
      next: (user) => {
        this.staffUserFound.set(user);
        this.isSearching.set(false);
      },
      error: (error) => {
        this.userNotFound.set(true);
        this.isSearching.set(false);
      }
    });
  }

  onSave(): void {
    const staffUser = this.staffUserFound();
    const roles = this.selectedRoles;

    if (!staffUser || roles.length === 0) return;

    this.isSaving.set(true);
    const request = {
      userId: staffUser.userId,
      roleIds: roles
    };

    // Usar update si está en modo edición, create si es nuevo
    const operation = this.isEditMode()
      ? this.staffService.update(staffUser.userId, request)
      : this.staffService.create(request);

    operation.subscribe({
      next: (response) => {
        const message = this.isEditMode()
          ? 'Permisos actualizados exitosamente'
          : 'Usuario agregado al staff exitosamente';
        this.snackBar.open(message, 'Cerrar', {
          duration: 3000
        });
        this.dialogRef.close(response);
      },
      error: (error) => {
        console.error('Error saving staff:', error);
        const message = this.isEditMode()
          ? 'Error al actualizar los permisos'
          : 'Error al agregar el usuario al staff';
        this.snackBar.open(
          error.message || message,
          'Cerrar',
          { duration: 3000 }
        );
        this.isSaving.set(false);
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
