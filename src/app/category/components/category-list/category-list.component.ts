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
import { CategoryService } from '../../services/category.service';
import { Category } from '../../models';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
@Component({
  selector: 'app-category-list',
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
    MatDialogModule,
    PaginationComponent
  ],
  templateUrl: './category-list.component.html',
  styleUrls: ['./category-list.component.css']
})
export class CategoryListComponent implements OnInit {
  private categoryService = inject(CategoryService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);
  protected categories = signal<Category[]>([]);
  protected loading = signal(false);
  protected currentPage = signal(1);
  protected pageSize = signal(10);
  protected totalItems = signal(0);
  displayedColumns: string[] = ['name', 'description', 'parentName', 'isActive', 'actions'];
  ngOnInit() {
    this.loadCategories();
  }
  loadCategories() {
    this.loading.set(true);
    this.categoryService.getAll(this.currentPage(), this.pageSize()).subscribe({
      next: (response) => {
        this.categories.set(response.items);
        this.totalItems.set(response.totalItems);
        this.currentPage.set(response.pageNumber);
        this.loading.set(false);
      },
      error: (error) => {
        this.snackBar.open(error.message || 'Error al cargar las categorías', 'Cerrar', {
          duration: 3000
        });
        this.loading.set(false);
      }
    });
  }
  onPageChange(page: number) {
    this.currentPage.set(page);
    this.loadCategories();
  }

  onPageSizeChange(pageSize: number) {
    this.pageSize.set(pageSize);
    this.currentPage.set(1);
    this.loadCategories();
  }
  createCategory() {
    this.router.navigate(['/categories/new']);
  }
  editCategory(id: string) {
    this.router.navigate(['/categories/edit', id]);
  }
  deleteCategory(category: Category) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Eliminar Categoría',
        message: `¿Está seguro que desea eliminar la categoría "${category.name}"?`,
        confirmText: 'Eliminar',
        cancelText: 'Cancelar'
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loading.set(true);
        this.categoryService.delete(category.id).subscribe({
          next: () => {
            this.snackBar.open('Categoría eliminada exitosamente', 'Cerrar', {
              duration: 3000
            });
            this.loadCategories();
          },
          error: (error) => {
            this.snackBar.open(error.message || 'Error al eliminar la categoría', 'Cerrar', {
              duration: 3000
            });
            this.loading.set(false);
          }
        });
      }
    });
  }
}
