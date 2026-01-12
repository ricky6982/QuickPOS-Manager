import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ProductService } from '../../../product/services/product.service';
import { Product } from '../../../product/models';

export interface ProductSelectionData {
  productId: string;
  productName: string;
  price: number;
}

@Component({
  selector: 'app-product-selection-dialog',
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatTableModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './product-selection-dialog.html',
  styleUrl: './product-selection-dialog.css'
})
export class ProductSelectionDialogComponent implements OnInit {
  private dialogRef = inject(MatDialogRef<ProductSelectionDialogComponent>);
  private productService = inject(ProductService);
  private snackBar = inject(MatSnackBar);

  protected loading = signal(false);
  protected products = signal<Product[]>([]);
  protected filteredProducts = signal<Product[]>([]);
  protected selectedProducts = signal<Map<string, ProductSelectionData>>(new Map());
  protected searchText = '';

  displayedColumns = ['select', 'name', 'sku', 'category'];

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.loading.set(true);
    this.productService.getActive().subscribe({
      next: (products) => {
        this.products.set(products);
        this.filteredProducts.set(products);
        this.loading.set(false);
      },
      error: (error) => {
        this.snackBar.open(error.message || 'Error al cargar productos', 'Cerrar', {
          duration: 3000
        });
        this.loading.set(false);
      }
    });
  }

  onSearchChange() {
    const search = this.searchText.toLowerCase();
    if (!search) {
      this.filteredProducts.set(this.products());
    } else {
      const filtered = this.products().filter(p =>
        p.name.toLowerCase().includes(search) ||
        (p.sku && p.sku.toLowerCase().includes(search)) ||
        (p.barcode && p.barcode.toLowerCase().includes(search))
      );
      this.filteredProducts.set(filtered);
    }
  }

  isSelected(productId: string): boolean {
    return this.selectedProducts().has(productId);
  }

  toggleSelection(product: Product) {
    const selected = new Map(this.selectedProducts());

    if (selected.has(product.id)) {
      selected.delete(product.id);
    } else {
      selected.set(product.id, {
        productId: product.id,
        productName: product.name,
        price: 0 // Default price, will be set in main form
      });
    }

    this.selectedProducts.set(selected);
  }

  confirm() {
    const selected = Array.from(this.selectedProducts().values());

    if (selected.length === 0) {
      this.snackBar.open('Debe seleccionar al menos un producto', 'Cerrar', {
        duration: 3000
      });
      return;
    }

    this.dialogRef.close(selected);
  }

  cancel() {
    this.dialogRef.close();
  }

  get selectedCount(): number {
    return this.selectedProducts().size;
  }
}

