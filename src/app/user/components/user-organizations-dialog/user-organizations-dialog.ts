import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user';
import { UserOrganization } from '../../models/user-organization';

@Component({
  selector: 'app-user-organizations-dialog',
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatTableModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatIconModule
  ],
  templateUrl: './user-organizations-dialog.html',
  styleUrl: './user-organizations-dialog.css'
})
export class UserOrganizationsDialogComponent implements OnInit {
  private userService = inject(UserService);
  private snackBar = inject(MatSnackBar);
  public dialogRef = inject(MatDialogRef<UserOrganizationsDialogComponent>);
  public data = inject<{ user: User }>(MAT_DIALOG_DATA);

  protected organizations = signal<UserOrganization[]>([]);
  protected loading = signal(false);

  displayedColumns: string[] = ['organizationName', 'role', 'permissions', 'isActive'];

  ngOnInit() {
    this.loadOrganizations();
  }

  loadOrganizations() {
    this.loading.set(true);
    this.userService.getUserOrganizations(this.data.user.id).subscribe({
      next: (organizations) => {
        this.organizations.set(organizations);
        this.loading.set(false);
      },
      error: (error) => {
        this.snackBar.open(error.message || 'Error al cargar las organizaciones', 'Cerrar', {
          duration: 3000
        });
        this.loading.set(false);
      }
    });
  }

  close() {
    this.dialogRef.close();
  }
}

