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
import { OrganizerService } from '../../services/organizer.service';
import { Organizer } from '../../models';
import { PaginationComponent } from '../../../shared/components';
import { ConfirmDialogComponent } from '../../../shared/components';

@Component({
  selector: 'app-organizer-list',
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
    PaginationComponent
  ],
  templateUrl: './organizer-list.html',
  styleUrl: './organizer-list.css'
})
export class OrganizerListComponent implements OnInit {
  private organizerService = inject(OrganizerService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  protected organizers = signal<Organizer[]>([]);
  protected loading = signal(false);
  protected currentPage = signal(1);
  protected pageSize = signal(10);
  protected totalItems = signal(0);

  displayedColumns: string[] = ['name', 'taxId', 'isActive', 'actions'];

  ngOnInit() {
    this.loadOrganizers();
  }

  loadOrganizers() {
    this.loading.set(true);
    this.organizerService.getAll(this.currentPage(), this.pageSize()).subscribe({
      next: (response) => {
        this.organizers.set(response.items);
        this.totalItems.set(response.totalItems);
        this.currentPage.set(response.pageNumber);
        this.loading.set(false);
      },
      error: (error) => {
        this.snackBar.open(error.message || 'Error al cargar los organizadores', 'Cerrar', {
          duration: 3000
        });
        this.loading.set(false);
      }
    });
  }

  onPageChange(page: number) {
    this.currentPage.set(page);
    this.loadOrganizers();
  }

  onPageSizeChange(pageSize: number) {
    this.pageSize.set(pageSize);
    this.currentPage.set(1);
    this.loadOrganizers();
  }

  create() {
    this.router.navigate(['/organizers/new']);
  }

  edit(id: string) {
    this.router.navigate(['/organizers/edit', id]);
  }

  delete(organizer: Organizer) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Eliminar Organizador',
        message: `¿Está seguro que desea eliminar el organizador "${organizer.name}"?`,
        confirmText: 'Eliminar',
        cancelText: 'Cancelar'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loading.set(true);
        this.organizerService.delete(organizer.id).subscribe({
          next: () => {
            this.snackBar.open('Organizador eliminado exitosamente', 'Cerrar', {
              duration: 3000
            });
            this.loadOrganizers();
          },
          error: (error) => {
            this.snackBar.open(error.message || 'Error al eliminar el organizador', 'Cerrar', {
              duration: 3000
            });
            this.loading.set(false);
          }
        });
      }
    });
  }
}
