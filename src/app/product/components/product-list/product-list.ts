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
import { ProductService } from '../../services/product.service';
import type { Product } from '../../models/product';
import { PaginationComponent } from '../../../shared/components';
import { ConfirmDialogComponent } from '../../../shared/components';

@Component({
  selector: 'app-product-list',
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
  templateUrl: './product-list.html',
  styleUrl: './product-list.css'
})
export class ProductListComponent implements OnInit {
  private productService = inject(ProductService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  protected products = signal<Product[]>([]);
  protected loading = signal(false);
  protected currentPage = signal(1);
  protected pageSize = signal(10);
  protected totalItems = signal(0);

  displayedColumns: string[] = ['name', 'sku', 'barcode', 'categoryName', 'isActive', 'actions'];

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.loading.set(true);
    this.productService.getAll(this.currentPage(), this.pageSize()).subscribe({
      next: (response) => {
        this.products.set(response.items);
        this.totalItems.set(response.totalItems);
        this.currentPage.set(response.pageNumber);
        this.loading.set(false);
      },
      error: (error) => {
        this.snackBar.open(error.message || 'Error al cargar los productos', 'Cerrar', {
          duration: 3000
        });
        this.loading.set(false);
      }
    });
  }

  onPageChange(page: number) {
    this.currentPage.set(page);
    this.loadProducts();
  }

  onPageSizeChange(pageSize: number) {
    this.pageSize.set(pageSize);
    this.currentPage.set(1);
    this.loadProducts();
  }

  create() {
    this.router.navigate(['/products/new']);
  }

  edit(id: string) {
    this.router.navigate(['/products/edit', id]);
  }

  delete(product: Product) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Eliminar Producto',
        message: `¿Está seguro que desea eliminar el producto "${product.name}"?`,
        confirmText: 'Eliminar',
        cancelText: 'Cancelar'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loading.set(true);
        this.productService.delete(product.id).subscribe({
          next: () => {
            this.snackBar.open('Producto eliminado exitosamente', 'Cerrar', {
              duration: 3000
            });
            this.loadProducts();
          },
          error: (error) => {
            this.snackBar.open(error.message || 'Error al eliminar el producto', 'Cerrar', {
              duration: 3000
            });
            this.loading.set(false);
          }
        });
      }
    });
  }
}

