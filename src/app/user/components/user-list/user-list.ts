import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user';
import { PaginationComponent } from '../../../shared/components';
import { ConfirmDialogComponent } from '../../../shared/components';
import { UserOrganizationsDialogComponent } from '../user-organizations-dialog/user-organizations-dialog';

@Component({
  selector: 'app-user-list',
  imports: [
    CommonModule,
    RouterModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule,
    MatTooltipModule,
    PaginationComponent
  ],
  templateUrl: './user-list.html',
  styleUrl: './user-list.css'
})
export class UserListComponent implements OnInit {
  private userService = inject(UserService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  protected users = signal<User[]>([]);
  protected loading = signal(false);
  protected currentPage = signal(1);
  protected pageSize = signal(10);
  protected totalItems = signal(0);

  displayedColumns: string[] = ['username', 'email', 'fullName', 'isActive', 'actions'];

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.loading.set(true);
    this.userService.getAll(this.currentPage(), this.pageSize()).subscribe({
      next: (response) => {
        this.users.set(response.items);
        this.totalItems.set(response.totalItems);
        this.currentPage.set(response.pageNumber);
        this.loading.set(false);
      },
      error: (error) => {
        this.snackBar.open(error.message || 'Error al cargar los usuarios', 'Cerrar', {
          duration: 3000
        });
        this.loading.set(false);
      }
    });
  }

  onPageChange(page: number) {
    this.currentPage.set(page);
    this.loadUsers();
  }

  onPageSizeChange(pageSize: number) {
    this.pageSize.set(pageSize);
    this.currentPage.set(1);
    this.loadUsers();
  }

  edit(id: string) {
    this.router.navigate(['/users/edit', id]);
  }

  viewOrganizations(user: User) {
    this.dialog.open(UserOrganizationsDialogComponent, {
      width: '800px',
      data: { user }
    });
  }

  delete(user: User) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Eliminar Usuario',
        message: `¿Está seguro que desea eliminar el usuario "${user.username}"?`,
        confirmText: 'Eliminar',
        cancelText: 'Cancelar'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loading.set(true);
        this.userService.delete(user.id).subscribe({
          next: () => {
            this.snackBar.open('Usuario eliminado exitosamente', 'Cerrar', {
              duration: 3000
            });
            this.loadUsers();
          },
          error: (error) => {
            this.snackBar.open(error.message || 'Error al eliminar el usuario', 'Cerrar', {
              duration: 3000
            });
            this.loading.set(false);
          }
        });
      }
    });
  }
}

